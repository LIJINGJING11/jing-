const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const sharp = require('sharp');
const { processImage, processImageBatch, processVideo, compressVideo, extractLogo, retouchScene, removeFullScreenWatermark, processPaidImage } = require('./media.cjs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1040,
    minHeight: 680,
    backgroundColor: '#f7f7f9',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    titleBarOverlay: process.platform === 'darwin' ? false : { color: '#ffffff', symbolColor: '#3a3b40', height: 64 },
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

function progress(stage, percent, detail) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('task-progress', { stage, percent, detail });
}

const imageMimeTypes = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
const safeName = (value) => String(value || 'hotel-image').replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').slice(0, 90);
const execFileAsync = promisify(execFile);

ipcMain.handle('synthesize-speech', async (_event, payload = {}) => {
  if (process.platform !== 'darwin') throw new Error('当前桌面系统暂不支持本机普通话配音，请在 macOS 桌面版中导出。');
  const text = String(payload.text || '').trim().slice(0, 1200);
  if (!text) throw new Error('配音文案为空。');

  const requestedVoices = {
    'warm-female': ['Tingting', 'Flo', 'Sandy', 'Shelley'],
    'clear-female': ['Flo', 'Shelley', 'Tingting', 'Sandy'],
    'calm-male': ['Eddy', 'Reed', 'Grandpa', 'Rocko'],
    'lively-male': ['Rocko', 'Eddy', 'Reed', 'Grandpa']
  }[String(payload.voice || '')] || ['Tingting', 'Flo', 'Eddy', 'Reed'];
  const { stdout: voiceList } = await execFileAsync('/usr/bin/say', ['-v', '?'], { timeout: 10000, maxBuffer: 1024 * 1024 });
  const chineseVoices = String(voiceList).split(/\r?\n/).filter((line) => /\bzh_CN\b/.test(line)).map((line) => line.trim().split(/\s+/)[0]);
  const voice = requestedVoices.find((name) => chineseVoices.includes(name)) || chineseVoices[0];
  if (!voice) throw new Error('系统没有可用的普通话语音，请先在 macOS 系统设置中下载中文语音。');

  const outputPath = path.join(os.tmpdir(), `hotel-video-voice-${crypto.randomUUID()}.wav`);
  const rates = { 'warm-female': 165, 'clear-female': 180, 'calm-male': 150, 'lively-male': 195 };
  try {
    await execFileAsync('/usr/bin/say', ['-v', voice, '-r', String(rates[payload.voice] || 165), '-o', outputPath, '--file-format=WAVE', '--data-format=LEI16@22050', text], { timeout: 90000, maxBuffer: 1024 * 1024 });
    const audio = await fs.readFile(outputPath);
    if (audio.length < 1024) throw new Error('系统语音没有生成有效音频。');
    return { audio: new Uint8Array(audio), voice };
  } finally {
    await fs.rm(outputPath, { force: true }).catch(() => {});
  }
});

async function availableOutputPath(directory, filename) {
  const extension = path.extname(filename);
  const stem = filename.slice(0, -extension.length);
  let candidate = path.join(directory, filename);
  let index = 2;
  while (true) {
    try {
      await fs.access(candidate);
      candidate = path.join(directory, `${stem} (${index})${extension}`);
      index += 1;
    } catch {
      return candidate;
    }
  }
}

async function buildEditMask(inputPath, manualStrokes, previewSize, selection, { sourceCoordinates = false } = {}) {
  if ((!Array.isArray(manualStrokes) || !manualStrokes.some((stroke) => stroke?.length)) && !(selection && Number(selection.width) > 0 && Number(selection.height) > 0)) return null;
  const metadata = await sharp(inputPath, { limitInputPixels: false }).metadata();
  if (!metadata.width || !metadata.height) return null;
  const width = metadata.width;
  const height = metadata.height;
  const previewWidth = sourceCoordinates ? width : Math.max(1, Number(previewSize?.width) || width);
  const previewHeight = sourceCoordinates ? height : Math.max(1, Number(previewSize?.height) || height);
  const strokeWidth = Math.max(8, Math.round(Math.min(width, height) * 0.026));
  const strokes = Array.isArray(manualStrokes) ? manualStrokes : [];
  const paths = strokes.filter((stroke) => stroke?.length).map((stroke) => {
    const points = stroke.map((point) => `${(Number(point.x) * width / previewWidth).toFixed(2)},${(Number(point.y) * height / previewHeight).toFixed(2)}`);
    const d = points.map((point, index) => `${index ? 'L' : 'M'} ${point}`).join(' ');
    return `<path d="${d}" fill="none" stroke="#000" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('');
  const selectionPath = selection && Number(selection.width) > 0 && Number(selection.height) > 0
    ? `<rect x="${Number(selection.x) || 0}" y="${Number(selection.y) || 0}" width="${Number(selection.width)}" height="${Number(selection.height)}" fill="#000"/>`
    : '';
  if (!paths && !selectionPath) return null;
  const white = await sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  }).png().toBuffer();
  const brush = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g>${selectionPath}${paths}</g></svg>`);
  return sharp(white).composite([{ input: brush, blend: 'dest-out' }]).png().toBuffer();
}

async function processPaidImageModel(payload, onProgress = progress) {
  const { inputPath, outputDir, operation = 'enhance', expandRatio = 'landscape', enhanceStrength = 2, prompt = '', manualStrokes = [], previewSize, selection, watermarkMode = 'full' } = payload || {};
  if (!inputPath || !outputDir) throw new Error('请选择输入文件和输出目录。');
  const ext = path.extname(inputPath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) throw new Error('付费图片工具仅支持 JPG 或 PNG 图片。');
  await fs.mkdir(outputDir, { recursive: true });
  onProgress('正在连接公司图片模型', 18, '通过本机服务调用公司 GPT‑Image');

  const sourceBytes = await fs.readFile(inputPath);
  const form = new FormData();
  form.append('image', new Blob([sourceBytes], { type: imageMimeTypes[ext] || 'image/png' }), path.basename(inputPath));
  form.append('operation', operation);
  form.append('ratio', operation === 'watermark-removal' ? 'auto' : (expandRatio || 'landscape'));
  form.append('prompt', String(prompt || ''));
  form.append('enhanceStrength', String(enhanceStrength || 2));
  if (operation === 'watermark-removal') form.append('watermarkMode', watermarkMode || 'full');
  const maskBytes = await buildEditMask(inputPath, manualStrokes, previewSize, selection, { sourceCoordinates: operation === 'watermark-removal' });
  if (maskBytes) form.append('mask', new Blob([maskBytes], { type: 'image/png' }), 'edit-mask.png');

  const endpoints = [4174, 4175, 4176, 4177, 4178].map((port) => `http://127.0.0.1:${port}/api/paid-image`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000);
  let lastNetworkError = null;
  let notConfigured = false;
  try {
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { method: 'POST', body: form, signal: controller.signal });
        if ([404, 405, 501].includes(response.status)) continue;
        if (response.status === 503) {
          let payloadBody = {};
          try { payloadBody = await response.json(); } catch { /* ignore */ }
          notConfigured = payloadBody?.code !== 'MODEL_UNAVAILABLE';
          continue;
        }
        if (!response.ok) {
          let payloadBody = {};
          try { payloadBody = await response.json(); } catch { /* ignore */ }
          const error = new Error(payloadBody?.error || `公司图片模型接口返回 ${response.status}`);
          error.status = response.status;
          error.traceId = payloadBody?.traceId || '';
          throw error;
        }
        const contentType = response.headers.get('content-type') || 'image/png';
        const imageBytes = Buffer.from(await response.arrayBuffer());
        if (!imageBytes.length || !contentType.startsWith('image/')) throw new Error('公司图片模型没有返回有效图片');
        const suffix = operation === 'ai-cutout' ? 'AI抠图' : operation === 'erase' ? '擦除' : operation === 'mark-edit' ? '标记改图' : operation === 'expand' ? `扩图_${expandRatio === 'portrait' ? '3x4' : expandRatio === 'square' ? '1x1' : '16x9'}` : operation === 'watermark-removal' ? '去水印' : operation === 'scene-retouch' ? '场景精修' : '变清晰';
        const outputExtension = operation === 'ai-cutout' || /png/i.test(contentType) ? '.png' : '.jpg';
        const base = safeName(path.basename(inputPath, ext));
        const outputPath = await availableOutputPath(outputDir, `${base}_${suffix}${outputExtension}`);
        await fs.writeFile(outputPath, imageBytes);
        onProgress('公司图片模型完成', 100, '图片已保存到所选文件夹');
        return { files: [{ path: outputPath, bytes: imageBytes.length }], model: response.headers.get('x-hotel-model') || 'gpt-image-2', provider: response.headers.get('x-hotel-provider') || 'company', summary: `已调用公司 GPT‑Image 完成${suffix}。` };
      } catch (error) {
        if (error?.name === 'AbortError') throw Object.assign(new Error('公司图片模型服务响应超时'), { code: 'MODEL_UNAVAILABLE' });
        if (error?.status && ![502, 503].includes(error.status)) throw error;
        lastNetworkError = error;
      }
    }
  } finally {
    clearTimeout(timeout);
  }
  if (notConfigured) throw Object.assign(new Error('公司图片模型服务未配置 API Key'), { code: 'MODEL_NOT_CONFIGURED' });
  throw Object.assign(lastNetworkError || new Error('公司图片模型服务未启动'), { code: 'MODEL_UNAVAILABLE' });
}

ipcMain.handle('choose-file', async (_event, kind) => {
  const filters = kind === 'video'
    ? [{ name: 'MP4 视频', extensions: ['mp4'] }]
    : kind === 'batch-image'
      ? [{ name: 'JPG / PNG 图片', extensions: ['jpg', 'jpeg', 'png'] }]
      : [{ name: '图片与矢量文件', extensions: ['jpg', 'jpeg', 'png', 'svg', 'cdr', 'ai', 'eps'] }];
  const properties = kind === 'batch-image' ? ['openFile', 'multiSelections'] : ['openFile'];
  const result = await dialog.showOpenDialog(mainWindow, { properties, filters });
  if (result.canceled) return null;
  return kind === 'batch-image' ? result.filePaths : result.filePaths[0];
});
ipcMain.handle('choose-output', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'createDirectory'] });
  return result.canceled ? null : result.filePaths[0];
});

const handlers = {
  'process-image': processImage,
  'process-image-batch': processImageBatch,
  'process-video': processVideo,
  'compress-video': compressVideo,
  'extract-logo': extractLogo,
  'retouch-scene': retouchScene,
  'remove-fullscreen-watermark': removeFullScreenWatermark,
  'process-paid-image': processPaidImage,
  'process-paid-image-model': processPaidImageModel
};
for (const [channel, handler] of Object.entries(handlers)) {
  ipcMain.handle(channel, async (_event, payload) => {
    try { return { ok: true, ...(await handler(payload, progress)) }; }
    catch (error) { return { ok: false, error: error.message || '处理失败，请检查素材后重试。', code: error.code || '', status: error.status || 0, traceId: error.traceId || '' }; }
  });
}
ipcMain.handle('reveal-file', (_event, filePath) => shell.showItemInFolder(filePath));
