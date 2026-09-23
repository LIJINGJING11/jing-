const sharp = require('sharp');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const WIDTH = 1920;
const HEIGHT = 1080;
const LIMITS = {
  png: 800 * 1024,
  jpg: 1024 * 1024,
  bmp: 8 * 1024 * 1024,
  batchImage: 2_000_000,
  // Finder / Windows Explorer display decimal MB. Keep the real file strictly
  // below 50,000,000 bytes instead of treating 50 MiB as "50 MB".
  video: 50_000_000,
  compressedVideo: 200_000_000
};
const VECTOR_EXTENSIONS = new Set(['.ai', '.eps', '.cdr']);

function unpackedBinary(binaryPath) {
  if (!binaryPath) return binaryPath;
  return binaryPath.replace('app.asar', 'app.asar.unpacked');
}

function existing(candidates) {
  return candidates.find((candidate) => candidate && fsSync.existsSync(candidate));
}

function findInkscape() {
  const names = process.platform === 'win32' ? ['inkscape.exe'] : ['inkscape'];
  const pathDirs = (process.env.PATH || '').split(path.delimiter);
  const resourceRoot = process.resourcesPath;
  const bundled = process.platform === 'darwin'
    ? resourceRoot && path.join(resourceRoot, 'tools', 'Inkscape.app', 'Contents', 'MacOS', 'inkscape')
    : resourceRoot && path.join(resourceRoot, 'tools', 'inkscape', 'bin', 'inkscape.exe');
  const developmentBundle = process.platform === 'darwin'
    ? path.join(__dirname, '..', 'vendor', `inkscape-darwin-${process.arch}`, 'Inkscape.app', 'Contents', 'MacOS', 'inkscape')
    : path.join(__dirname, '..', 'vendor', `inkscape-win32-${process.arch}`, 'bin', 'inkscape.exe');
  return existing([
    bundled,
    developmentBundle,
    process.env.INKSCAPE_PATH,
    process.platform === 'darwin' ? '/Applications/Inkscape.app/Contents/MacOS/inkscape' : null,
    process.platform === 'win32' ? 'C:\\Program Files\\Inkscape\\bin\\inkscape.exe' : null,
    ...pathDirs.flatMap((dir) => names.map((name) => path.join(dir, name)))
  ]);
}

function run(command, args, onLine) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      if (onLine) onLine(text);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(stderr);
      else reject(new Error(stderr.trim().split('\n').slice(-4).join('\n') || `处理程序退出，代码 ${code}`));
    });
  });
}

function runWithOutput(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      windowsHide: true,
      env: { ...process.env, ...(options.env || {}) }
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      if (options.onLine) options.onLine(text);
    });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

function findLocalBackgroundRemovalRunner() {
  // The high-quality BiRefNet model is intentionally kept outside the
  // Electron package (it is close to 1 GB).  When the locally installed Skill
  // is present, the app delegates only the matte segmentation to it; all
  // colour preservation and output generation remain in this process.
  if (process.platform === 'win32') return null;
  const home = os.homedir();
  const codexHome = process.env.CODEX_HOME;
  return existing([
    process.env.LOCAL_BACKGROUND_REMOVAL_RUNNER,
    codexHome && path.join(codexHome, 'skills', 'local-background-removal', 'scripts', 'run.sh'),
    path.join(home, '.codex-company', 'skills', 'local-background-removal', 'scripts', 'run.sh'),
    path.join(home, '.codex', 'skills', 'local-background-removal', 'scripts', 'run.sh')
  ]);
}

function looksLikeWarmGradientLogo(data, info) {
  const background = sampleBorderRgb(data, info);
  const backgroundLuminance = 0.2126 * background[0] + 0.7152 * background[1] + 0.0722 * background[2];
  const backgroundSpread = Math.max(...background) - Math.min(...background);
  // BiRefNet is most useful for a logo rendered on a white matte.  Coloured
  // artwork and already-transparent PNGs keep using the deterministic path.
  if (backgroundLuminance < 210 || backgroundSpread > 42) return false;

  const pixelCount = info.width * info.height;
  const sampleStep = pixelCount > 2_000_000 ? 2 : 1;
  let warmPixels = 0;
  let colouredPixels = 0;
  for (let pixel = 0; pixel < pixelCount; pixel += sampleStep) {
    const i = pixel * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const goldScore = r + g - 2 * b;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    const diff = Math.sqrt((r - background[0]) ** 2 + (g - background[1]) ** 2 + (b - background[2]) ** 2);
    if (diff > 20 && chroma > 8) colouredPixels += 1;
    if (diff > 18 && goldScore > 14 && r - b > 8 && g - b > 3) warmPixels += 1;
  }
  const scale = sampleStep;
  return warmPixels * scale >= Math.max(128, pixelCount * 0.002)
    && colouredPixels * scale >= Math.max(256, pixelCount * 0.004);
}

async function runQualityLogoCutout(inputPath, tempDir, progress) {
  const runner = findLocalBackgroundRemovalRunner();
  if (!runner) return null;
  const outputDir = path.join(tempDir, 'birefnet-output');
  await fs.mkdir(outputDir, { recursive: true });
  progress('正在调用高质量抠图模型', 26, '使用本机 BiRefNet 分离渐变 Logo 与白色底图');
  const command = process.platform === 'win32' ? runner : '/bin/bash';
  const args = process.platform === 'win32'
    ? [inputPath, '--output', outputDir, '--mode', 'quality', '--background', 'transparent']
    : [runner, inputPath, '--output', outputDir, '--mode', 'quality', '--background', 'transparent'];
  const result = await runWithOutput(command, args, { env: { PYTHONUNBUFFERED: '1' } });
  if (result.code !== 0) throw new Error(result.stderr.trim().split('\n').slice(-4).join('\n') || `高质量抠图程序退出，代码 ${result.code}`);
  let summary;
  try {
    summary = JSON.parse(result.stdout.trim());
  } catch {
    throw new Error('高质量抠图程序返回了无效结果。');
  }
  if (summary.failed || !summary.succeeded || !summary.results?.[0]?.output) {
    const failure = summary.failures?.[0]?.error;
    throw new Error(failure || '高质量抠图模型未生成有效输出。');
  }
  const outputPath = summary.results[0].output;
  if (!fsSync.existsSync(outputPath)) throw new Error('高质量抠图输出文件不存在。');
  progress('高质量模型完成', 58, '正在保留原始金色渐变并生成透明边缘');
  return outputPath;
}

async function prepareInput(inputPath, tempDir) {
  const ext = path.extname(inputPath).toLowerCase();
  if (!VECTOR_EXTENSIONS.has(ext)) return inputPath;
  const inkscape = findInkscape();
  if (!inkscape) {
    throw new Error(`${ext.slice(1).toUpperCase()} 内置矢量引擎缺失，请重新安装完整版应用。`);
  }
  const converted = path.join(tempDir, 'vector-input.png');
  // Imported CDR/AI/EPS artwork can sit outside the source document page.
  // Export the drawing bounds so valid artwork is not converted into an empty page.
  try {
    await run(inkscape, [
      inputPath,
      '--export-type=png',
      `--export-filename=${converted}`,
      '--export-area-drawing',
      '--export-width=3840'
    ]);
    const stats = await sharp(converted, { limitInputPixels: false }).stats();
    const alpha = stats.channels[3];
    if (alpha && alpha.max <= 1) throw new Error('empty-vector-output');
  } catch (error) {
    throw new Error(`${ext.slice(1).toUpperCase()} 文件未能解析。可能是文件版本过新、内容损坏或包含不兼容效果，请从原设计软件导出 PDF/SVG 后再试。`);
  }
  return converted;
}

function sampleBorderRgb(data, info) {
  const positions = [];
  const fractions = [0.02, 0.06, 0.18, 0.35, 0.5, 0.65, 0.82, 0.94, 0.98];
  const point = (x, y) => {
    const px = Math.max(0, Math.min(info.width - 1, Math.round(x)));
    const py = Math.max(0, Math.min(info.height - 1, Math.round(y)));
    positions.push((py * info.width + px) * 4);
  };
  for (const fraction of fractions) {
    point((info.width - 1) * fraction, (info.height - 1) * 0.025);
    point((info.width - 1) * fraction, (info.height - 1) * 0.975);
    point((info.width - 1) * 0.025, (info.height - 1) * fraction);
    point((info.width - 1) * 0.975, (info.height - 1) * fraction);
  }
  return [0, 1, 2].map((channel) => {
    const values = positions.map((index) => data[index + channel]).sort((a, b) => a - b);
    return values[Math.floor(values.length / 2)];
  });
}

function safeBaseName(inputPath) {
  return path.basename(inputPath, path.extname(inputPath)).replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').slice(0, 80);
}

async function sampleImage(inputPath) {
  const { data, info } = await sharp(inputPath, { limitInputPixels: false })
    .rotate()
    .ensureAlpha()
    .resize({ width: 420, height: 420, fit: 'inside', withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const border = sampleBorderRgb(data, info);
  let foreground = 0;
  let alphaPixels = 0;
  let saturation = 0;
  let foregroundRed = 0;
  let foregroundGreen = 0;
  let foregroundBlue = 0;
  let colorCount = 0;
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const i = (y * info.width + x) * 4;
      const a = data[i + 3];
      if (a < 245) alphaPixels += 1;
      const diff = Math.sqrt((data[i] - border[0]) ** 2 + (data[i + 1] - border[1]) ** 2 + (data[i + 2] - border[2]) ** 2);
      if (a > 20 && diff > 32) {
        foreground += 1;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        const max = Math.max(data[i], data[i + 1], data[i + 2]);
        const min = Math.min(data[i], data[i + 1], data[i + 2]);
        saturation += max === 0 ? 0 : (max - min) / max;
        foregroundRed += data[i];
        foregroundGreen += data[i + 1];
        foregroundBlue += data[i + 2];
        colorCount += 1;
      }
    }
  }

  const total = info.width * info.height;
  const boxArea = maxX >= 0 ? ((maxX - minX + 1) * (maxY - minY + 1)) / total : 1;
  const transparentRatio = alphaPixels / total;
  const foregroundRatio = foreground / total;
  const isLogo = transparentRatio > 0.08 || foregroundRatio < 0.18 || (foregroundRatio < 0.42 && boxArea < 0.58);
  const luminance = 0.2126 * border[0] + 0.7152 * border[1] + 0.0722 * border[2];
  const foregroundLuminance = colorCount
    ? 0.2126 * (foregroundRed / colorCount) + 0.7152 * (foregroundGreen / colorCount) + 0.0722 * (foregroundBlue / colorCount)
    : luminance;
  const colorful = colorCount ? saturation / colorCount > 0.22 : false;

  return { border, isLogo, luminance, foregroundLuminance, colorful, transparentRatio, foregroundRatio };
}

function chooseBackground(analysis, requested) {
  if (requested && requested !== 'auto') return requested;
  const subjectLuminance = Number.isFinite(analysis.foregroundLuminance)
    ? analysis.foregroundLuminance
    : analysis.luminance;

  // 纯白是开机素材最通用的背景。只有近乎纯白的 Logo 才切换为深色，
  // 避免白色主体消失在白色画布上。
  if (analysis.isLogo && subjectLuminance > 215) return '#181A18';
  return '#FFFFFF';
}

function parseHex(value) {
  const hex = value.replace('#', '');
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
    alpha: 1
  };
}

function normalizeMaterialMode(materialMode) {
  return materialMode === 'logo' ? 'logo' : 'cover';
}

async function makeCanvas(inputPath, options, analysis) {
  const background = chooseBackground(analysis, options.background);
  let source = sharp(inputPath, { limitInputPixels: false }).rotate().ensureAlpha();

  if (analysis.isLogo) {
    const normalized = await source.png().toBuffer({ resolveWithObject: true });
    const raw = await sharp(normalized.data).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    if (analysis.transparentRatio > 0.08) {
      source = sharp(raw.data, { raw: raw.info });
    } else {
      const { mask } = maskFromBackground(raw.data, raw.info, 55);
      for (let i = 0; i < mask.length; i += 4) {
        mask[i] = raw.data[i];
        mask[i + 1] = raw.data[i + 1];
        mask[i + 2] = raw.data[i + 2];
      }
      source = sharp(mask, { raw: raw.info });
    }
    source = source.trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 2 });
  }

  const fit = analysis.isLogo
    ? { width: 520, height: 330, fit: 'inside', withoutEnlargement: false }
    : { width: WIDTH, height: HEIGHT, fit: 'cover', position: 'centre', withoutEnlargement: false };
  const foreground = await source.resize(fit).png().toBuffer();
  const buffer = await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 4, background: parseHex(background) }
  })
    .composite([{ input: foreground, gravity: 'centre' }])
    .removeAlpha()
    .png()
    .toBuffer();

  return { buffer, background, isLogo: analysis.isLogo };
}

async function writeWithinLimit(factory, outputPath, limit, attempts) {
  let last;
  for (const settings of attempts) {
    last = await factory(settings);
    if (last.length <= limit) {
      await fs.writeFile(outputPath, last);
      return { path: outputPath, bytes: last.length, settings };
    }
  }
  await fs.writeFile(outputPath, last);
  throw new Error(`在保持 1920×1080 尺寸的前提下，文件无法压缩到 ${Math.round(limit / 1024)}KB 以下。请换用更简洁的素材。`);
}

function encodeBmp(rgb, width, height) {
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelSize = rowSize * height;
  const output = Buffer.alloc(54 + pixelSize);
  output.write('BM', 0, 2, 'ascii');
  output.writeUInt32LE(output.length, 2);
  output.writeUInt32LE(54, 10);
  output.writeUInt32LE(40, 14);
  output.writeInt32LE(width, 18);
  output.writeInt32LE(height, 22);
  output.writeUInt16LE(1, 26);
  output.writeUInt16LE(24, 28);
  output.writeUInt32LE(pixelSize, 34);

  for (let y = 0; y < height; y += 1) {
    const sourceY = height - 1 - y;
    const targetRow = 54 + y * rowSize;
    for (let x = 0; x < width; x += 1) {
      const source = (sourceY * width + x) * 3;
      const target = targetRow + x * 3;
      output[target] = rgb[source + 2];
      output[target + 1] = rgb[source + 1];
      output[target + 2] = rgb[source];
    }
  }
  return output;
}

async function processImage({ inputPath, outputDir, background = 'auto', materialMode = 'cover' }, progress = () => {}) {
  if (!inputPath || !outputDir) throw new Error('请选择输入文件和输出目录。');
  progress('正在读取素材', 8, '分析画面与 Logo 特征');
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bootframe-image-'));
  try {
    const prepared = await prepareInput(inputPath, tempDir);
    const analysis = await sampleImage(prepared);
    const mode = normalizeMaterialMode(materialMode);
    const composition = { ...analysis, isLogo: mode === 'logo' };
    progress('正在构图', 24, mode === 'logo' ? '按单一 Logo 居中排版' : '按整张开机封面铺满裁切');
    const canvas = await makeCanvas(prepared, { background }, composition);
    await fs.mkdir(outputDir, { recursive: true });
    const base = `${safeBaseName(inputPath)}_1920x1080`;

    progress('正在导出 PNG', 42, '优化色彩并控制在 800KB 内');
    const png = await writeWithinLimit(
      (colors) => sharp(canvas.buffer).png({ compressionLevel: 9, effort: 10, palette: true, colours: colors, dither: colors >= 64 ? 0.7 : 0.2 }).toBuffer(),
      path.join(outputDir, `${base}.png`),
      LIMITS.png,
      [256, 192, 128, 96, 64, 48, 32, 24, 16, 12, 8, 4, 2]
    );

    progress('正在导出 JPG', 64, '逐级寻找最佳画质');
    const jpg = await writeWithinLimit(
      (quality) => sharp(canvas.buffer).jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer(),
      path.join(outputDir, `${base}.jpg`),
      LIMITS.jpg,
      [94, 90, 86, 82, 78, 74, 68, 62, 56, 48, 40, 34, 28, 24]
    );

    progress('正在导出 BMP', 82, '写入无压缩 24 位位图');
    const rgb = await sharp(canvas.buffer).removeAlpha().raw().toBuffer();
    const bmpBuffer = encodeBmp(rgb, WIDTH, HEIGHT);
    const bmpPath = path.join(outputDir, `${base}.bmp`);
    await fs.writeFile(bmpPath, bmpBuffer);
    const bmp = { path: bmpPath, bytes: bmpBuffer.length };

    progress('处理完成', 100, '3 个文件已通过规格检查');
    return {
      files: [png, jpg, bmp],
      background: canvas.background,
      isLogo: canvas.isLogo,
      materialMode: mode,
      detectedIsLogo: analysis.isLogo,
      analysis
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function encodeBatchImage(inputPath, outputPath, extension, limit) {
  const source = sharp(inputPath, { limitInputPixels: false })
    .rotate()
    .resize({ width: WIDTH, height: HEIGHT, fit: 'cover', position: 'centre', withoutEnlargement: false });
  let encoded;
  if (extension === '.png') {
    for (const colors of [256, 192, 128, 96, 64, 48, 32, 24, 16, 12, 8]) {
      encoded = await source.clone().png({
        compressionLevel: 9,
        effort: 10,
        palette: true,
        colours: colors,
        dither: colors >= 64 ? 0.6 : 0.2
      }).toBuffer();
      if (encoded.length < limit) break;
    }
  } else {
    for (const quality of [92, 88, 84, 80, 76, 70, 64, 58, 52, 46, 40, 34, 28, 24]) {
      encoded = await source.clone()
        .flatten({ background: '#ffffff' })
        .jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:2:0' })
        .toBuffer();
      if (encoded.length < limit) break;
    }
  }
  if (!encoded || encoded.length >= limit) {
    throw new Error(`${path.basename(inputPath)} 在保持 1920×1080 的前提下无法压缩到 2MB 以内，请更换更简洁的图片。`);
  }
  await fs.writeFile(outputPath, encoded);
  return { path: outputPath, bytes: encoded.length };
}

async function availableOutputPath(outputDir, filename, reserved) {
  const extension = path.extname(filename);
  const stem = path.basename(filename, extension);
  let index = 1;
  let candidate = path.join(outputDir, filename);
  while (reserved.has(candidate) || fsSync.existsSync(candidate)) {
    index += 1;
    candidate = path.join(outputDir, `${stem}_${index}${extension}`);
  }
  reserved.add(candidate);
  return candidate;
}

async function processImageBatch({ inputPaths, outputDir, limitBytes = LIMITS.batchImage }, progress = () => {}) {
  if (!Array.isArray(inputPaths) || inputPaths.length === 0 || !outputDir) {
    throw new Error('请选择 1 至 10 张图片和输出目录。');
  }
  if (inputPaths.length > 10) throw new Error('批量处理一次最多支持 10 张图片。');
  const supported = new Set(['.jpg', '.jpeg', '.png']);
  const unsupported = inputPaths.find((inputPath) => !supported.has(path.extname(inputPath).toLowerCase()));
  if (unsupported) throw new Error(`不支持 ${path.extname(unsupported).toUpperCase()} 文件，仅支持 JPG、PNG。`);

  await fs.mkdir(outputDir, { recursive: true });
  const files = [];
  const reserved = new Set();
  for (let index = 0; index < inputPaths.length; index += 1) {
    const inputPath = inputPaths[index];
    const sourceExtension = path.extname(inputPath).toLowerCase();
    const outputExtension = sourceExtension === '.jpeg' ? '.jpeg' : sourceExtension;
    const outputPath = await availableOutputPath(
      outputDir,
      `${safeBaseName(inputPath)}_1920x1080${outputExtension}`,
      reserved
    );
    const start = 8 + (index / inputPaths.length) * 86;
    progress('正在裁剪并压缩图片', start, `第 ${index + 1}/${inputPaths.length} 张 · ${path.basename(inputPath)}`);
    files.push(await encodeBatchImage(inputPath, outputPath, outputExtension, limitBytes));
  }
  progress('处理完成', 100, `${files.length} 张图片已铺满裁切，并全部压缩至 2MB 以内`);
  return { files, count: files.length, width: WIDTH, height: HEIGHT };
}

/**
 * Local hotel-scene retouch fallback for the Electron build.  The browser Demo
 * uses an edge-aware Canvas pass; the packaged build uses Sharp's native
 * median filter followed by a restrained sharpen so it remains offline and
 * does not require a separate converter or model download.  Median cleanup is
 * especially useful for phone-shot dust, water spots, dirty glass specks and
 * fine bedding creases; sharpening restores room edges afterwards.
 */
async function retouchScene({ inputPath, outputDir }, progress = () => {}) {
  const ext = path.extname(inputPath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) throw new Error('场景精修仅支持 JPG 或 PNG 图片。');
  await fs.mkdir(outputDir, { recursive: true });
  const base = safeBaseName(inputPath);
  const outputPath = await availableOutputPath(outputDir, `${base}_场景精修${ext === '.png' ? '.png' : '.jpg'}`, new Set());
  progress('正在分析场景照片', 22, '识别低纹理表面与手机噪点');
  const source = sharp(inputPath, { limitInputPixels: false }).rotate().ensureAlpha();
  const metadata = await source.metadata();
  if (!metadata.width || !metadata.height) throw new Error('无法读取场景照片尺寸。');
  progress('正在清洁细节', 48, '抑制水渍、玻璃脏点与床品细碎褶皱');
  const pipeline = source.clone()
    .median(3)
    .modulate({ brightness: 1.035, saturation: 1.06 })
    .sharpen({ sigma: 1.05, m1: 0.55, m2: 1.4, x1: 2, y2: 10 });
  if (ext === '.png') {
    await pipeline.png({ compressionLevel: 9, effort: 8 }).toFile(outputPath);
  } else {
    await pipeline.jpeg({ quality: 92, mozjpeg: true }).toFile(outputPath);
  }
  progress('处理完成', 100, '已生成清洁、通透并增强清晰度的场景图');
  return { files: [{ path: outputPath, bytes: (await fs.stat(outputPath)).size }], width: metadata.width, height: metadata.height };
}

/**
 * Offline full-screen watermark cleanup.
 *
 * This is intentionally a small, dependency-free implementation of the
 * same three-stage idea used by the open-source tools we evaluated:
 * repeated-pattern consensus detection, a tight mask, and local inpainting.
 * It is not a claim that arbitrary copyright marks can always be recovered;
 * the caller receives an explicit "not detected" error instead of an
 * unchanged file being presented as a successful result.
 */
async function removeFullScreenWatermark({ inputPath, outputDir, manualStrokes = [], selection = null }, progress = () => {}) {
  const ext = path.extname(inputPath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) throw new Error('满屏去水印仅支持 JPG 或 PNG 图片。');
  await fs.mkdir(outputDir, { recursive: true });
  progress('正在分析满屏水印', 18, '寻找重复文字、图案或网格的周期特征');
  const sourceResult = await sharp(inputPath, { limitInputPixels: false }).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const source = sourceResult.data;
  const info = sourceResult.info;
  const width = info.width;
  const height = info.height;
  const probeResult = await sharp(inputPath, { limitInputPixels: false }).rotate().ensureAlpha()
    .resize({ width: 560, height: 560, fit: 'inside', withoutEnlargement: true })
    .raw().toBuffer({ resolveWithObject: true });
  const probe = probeResult.data;
  const pw = probeResult.info.width;
  const ph = probeResult.info.height;
  const count = pw * ph;
  const feature = new Float32Array(count);
  const highpass = new Float32Array(count);
  const candidate = new Uint8Array(count);
  const lumAt = (x, y) => {
    const p = (y * pw + x) * 4;
    return probe[p] * 0.2126 + probe[p + 1] * 0.7152 + probe[p + 2] * 0.0722;
  };
  for (let y = 1; y < ph - 1; y += 1) for (let x = 1; x < pw - 1; x += 1) {
    const p = y * pw + x;
    const index = p * 4;
    const lum = lumAt(x, y);
    const cross = (lumAt(x - 1, y) + lumAt(x + 1, y) + lumAt(x, y - 1) + lumAt(x, y + 1)) / 4;
    const hp = lum - cross;
    const gx = Math.abs(lumAt(x + 1, y) - lumAt(x - 1, y));
    const gy = Math.abs(lumAt(x, y + 1) - lumAt(x, y - 1));
    const chroma = Math.max(probe[index], probe[index + 1], probe[index + 2]) - Math.min(probe[index], probe[index + 1], probe[index + 2]);
    const magnitude = Math.abs(hp);
    if (chroma < 58 && Math.max(gx, gy, magnitude) > 3.2 && magnitude > 2.6 && lum > 42 && lum < 252) {
      candidate[p] = 1;
      highpass[p] = hp;
      feature[p] = Math.min(48, magnitude + (gx + gy) * 0.22);
    }
  }
  const vectors = [[1, 0, 'x'], [0, 1, 'y'], [1, 1, 'diag-down'], [1, -1, 'diag-up']];
  const periods = [];
  for (const [vx, vy, axis] of vectors) {
    const dimension = axis === 'x' ? pw : axis === 'y' ? ph : Math.min(pw, ph);
    const minLag = Math.max(18, Math.round(dimension * 0.065));
    const maxLag = Math.max(minLag + 4, Math.floor(dimension * 0.72));
    const scores = [];
    for (let lag = minLag; lag <= maxLag; lag += 2) {
      let dot = 0; let ea = 0; let eb = 0; let overlap = 0;
      for (let y = 1; y < ph - 1; y += 2) for (let x = 1; x < pw - 1; x += 2) {
        const nx = x + vx * lag; const ny = y + vy * lag;
        if (nx < 1 || nx >= pw - 1 || ny < 1 || ny >= ph - 1) continue;
        const a = feature[y * pw + x]; const b = feature[ny * pw + nx];
        if (!a || !b) continue;
        dot += a * b; ea += a * a; eb += b * b; overlap += 1;
      }
      scores.push({ lag, score: overlap > 20 ? dot / Math.sqrt(Math.max(1, ea * eb)) : 0, overlap });
    }
    const sorted = scores.map((item) => item.score).sort((a, b) => a - b);
    const baseline = sorted[Math.floor(sorted.length * 0.5)] || 0;
    for (let i = 1; i < scores.length - 1; i += 1) {
      const item = scores[i];
      if (item.score < Math.max(0.09, baseline * 1.32, baseline + 0.012) || item.overlap < 24) continue;
      if (item.score < scores[i - 1].score || item.score < scores[i + 1].score) continue;
      if (periods.some((existing) => existing.axis === axis && (Math.abs(existing.lag - item.lag) < minLag * 0.22 || Math.abs(existing.lag - item.lag * 2) < minLag * 0.18 || Math.abs(existing.lag * 2 - item.lag) < minLag * 0.18))) continue;
      periods.push({ axis, vx, vy, ...item });
      if (periods.filter((existing) => existing.axis === axis).length >= 2) break;
    }
  }
  // Only a repeated diagonal family is a safe automatic signal for a
  // full-screen stock watermark. Horizontal/vertical repetition is common
  // in legitimate poster typography and product layouts, so those periods
  // must never be repaired automatically. The manual brush remains the path
  // for text-like watermarks or ambiguous cases.
  const safePeriods = periods.filter((period) => (
    (period.axis === 'diag-down' || period.axis === 'diag-up')
    && Number(period.score) >= 0.12
  ));
  const lowMask = new Uint8Array(count);
  for (const period of safePeriods) {
    const lag = period.lag;
    for (let y = 1; y < ph - 1; y += 1) for (let x = 1; x < pw - 1; x += 1) {
      const p = y * pw + x;
      if (!candidate[p] || feature[p] < 3) continue;
      let support = 0;
      for (const sign of [-2, -1, 1, 2]) {
        const nx = x + period.vx * lag * sign; const ny = y + period.vy * lag * sign;
        if (nx < 1 || nx >= pw - 1 || ny < 1 || ny >= ph - 1) continue;
        const neighbor = ny * pw + nx;
        if (!candidate[neighbor] || !feature[neighbor]) continue;
        if (highpass[p] * highpass[neighbor] >= -1.5 && Math.abs(feature[p] - feature[neighbor]) < Math.max(5, Math.max(feature[p], feature[neighbor]) * 0.72)) support += 1;
      }
      if (support >= 1) lowMask[p] = 1;
    }
  }
  const dilate = (input, radius) => {
    const output = new Uint8Array(count);
    for (let y = 0; y < ph; y += 1) for (let x = 0; x < pw; x += 1) {
      let hit = 0;
      for (let oy = -radius; oy <= radius && !hit; oy += 1) for (let ox = -radius; ox <= radius; ox += 1) {
        if (ox * ox + oy * oy > radius * radius) continue;
        const nx = x + ox; const ny = y + oy;
        if (nx >= 0 && nx < pw && ny >= 0 && ny < ph && input[ny * pw + nx]) { hit = 1; break; }
      }
      output[y * pw + x] = hit;
    }
    return output;
  };
  const analysisMask = dilate(dilate(lowMask, 1), 2);
  let autoMarked = 0;
  for (const value of analysisMask) autoMarked += value;
  const autoCoverage = autoMarked / Math.max(1, count);
  // A detector that marks a large fraction of the poster is almost
  // certainly matching legitimate typography or texture. Reject it instead
  // of repairing a broad area and risking loss of the poster copy.
  const autoAllowed = safePeriods.length > 0 && autoCoverage >= 0.001 && autoCoverage <= 0.028;
  const mask = new Uint8Array(width * height);
  const explicitMask = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const px = Math.min(pw - 1, Math.floor(x * pw / width));
    const py = Math.min(ph - 1, Math.floor(y * ph / height));
    if (autoAllowed && analysisMask[py * pw + px]) mask[y * width + x] = 1;
  }
  const hasManual = Array.isArray(manualStrokes) && manualStrokes.some((stroke) => Array.isArray(stroke) && stroke.length);
  const hasSelection = selection && Number(selection.width) > 0 && Number(selection.height) > 0;
  if (!autoAllowed && !hasManual && !hasSelection) throw new Error('未识别到可确认的重复满屏水印。请在预览图上沿着水印文字或图案拖动涂抹后再导出；为避免误伤实景，未检测到水印时不会导出原图。');
  progress('正在修复水印区域', 54, hasManual ? '自动检测与手动涂抹区域一起修复' : '只修复检测到的重复文字 / 图案区域');
  if (hasManual) {
    const brushRadius = Math.max(14, Math.round(Math.min(width, height) * 0.012));
    for (const stroke of manualStrokes) for (const point of stroke) {
      const cx = Math.round(Number(point.x) * width / Math.max(1, info.width));
      const cy = Math.round(Number(point.y) * height / Math.max(1, info.height));
      for (let y = Math.max(0, cy - brushRadius); y <= Math.min(height - 1, cy + brushRadius); y += 1) for (let x = Math.max(0, cx - brushRadius); x <= Math.min(width - 1, cx + brushRadius); x += 1) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= brushRadius ** 2) {
          mask[y * width + x] = 1;
          explicitMask[y * width + x] = 1;
        }
      }
    }
  }
  if (hasSelection) {
    const sx = Math.max(0, Math.floor(Number(selection.x) * width / Math.max(1, info.width)));
    const sy = Math.max(0, Math.floor(Number(selection.y) * height / Math.max(1, info.height)));
    const ex = Math.min(width - 1, Math.ceil((Number(selection.x) + Number(selection.width)) * width / Math.max(1, info.width)));
    const ey = Math.min(height - 1, Math.ceil((Number(selection.y) + Number(selection.height)) * height / Math.max(1, info.height)));
    for (let y = sy; y <= ey; y += 1) for (let x = sx; x <= ex; x += 1) {
      mask[y * width + x] = 1;
      explicitMask[y * width + x] = 1;
    }
  }
  const output = Buffer.from(source);
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
  const pixelDistance = (a, b) => Math.abs(source[a] - source[b]) + Math.abs(source[a + 1] - source[b + 1]) + Math.abs(source[a + 2] - source[b + 2]);
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    if (!mask[y * width + x]) continue;
    const centerIndex = (y * width + x) * 4;
    const centerLuma = source[centerIndex] * 0.2126 + source[centerIndex + 1] * 0.7152 + source[centerIndex + 2] * 0.0722;
    const centerChroma = Math.max(source[centerIndex], source[centerIndex + 1], source[centerIndex + 2])
      - Math.min(source[centerIndex], source[centerIndex + 1], source[centerIndex + 2]);
    // The automatic mask is only a hypothesis. Do not overwrite strong
    // edges or saturated pixels inside a detected diagonal family: in a
    // designed poster those are usually legitimate letters, prices, logos
    // or product details crossing a watermark line. Ambiguous pixels stay
    // unchanged; users can mark them explicitly with the brush if needed.
    const diagonalSign = safePeriods.find((period) => period.axis === 'diag-up') ? -1 : 1;
    const normalX = -diagonalSign / Math.sqrt(2);
    const normalY = 1 / Math.sqrt(2);
    const sampleAt = (sx, sy) => {
      const px = Math.max(0, Math.min(width - 1, Math.round(sx)));
      const py = Math.max(0, Math.min(height - 1, Math.round(sy)));
      const index = (py * width + px) * 4;
      return {
        luma: source[index] * 0.2126 + source[index + 1] * 0.7152 + source[index + 2] * 0.0722,
        index
      };
    };
    const sideA = sampleAt(x + normalX * 8, y + normalY * 8);
    const sideB = sampleAt(x - normalX * 8, y - normalY * 8);
    const signal = Math.abs(centerLuma - (sideA.luma + sideB.luma) / 2);
    const explicitlyMarked = Boolean(explicitMask[y * width + x]);
    if (!explicitlyMarked && (signal > 34 || centerChroma > 68 || Math.abs(sideA.luma - sideB.luma) > 58)) continue;
    const pairs = [];
    for (let d = 0; d < 4; d += 1) {
      const [dx, dy] = directions[d]; const opposite = directions[d + 4];
      let first = -1; let second = -1;
      for (let radius = 5; radius <= Math.min(110, Math.round(Math.min(width, height) * 0.055)); radius += 5) {
        const nx = x + dx * radius; const ny = y + dy * radius;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && !mask[ny * width + nx]) { first = (ny * width + nx) * 4; break; }
      }
      for (let radius = 5; radius <= Math.min(110, Math.round(Math.min(width, height) * 0.055)); radius += 5) {
        const nx = x + opposite[0] * radius; const ny = y + opposite[1] * radius;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && !mask[ny * width + nx]) { second = (ny * width + nx) * 4; break; }
      }
      if (first >= 0 && second >= 0) pairs.push({ score: pixelDistance(first, second), rgb: [(source[first] + source[second]) / 2, (source[first + 1] + source[second + 1]) / 2, (source[first + 2] + source[second + 2]) / 2] });
    }
    if (!pairs.length) continue;
    pairs.sort((a, b) => a.score - b.score);
    const chosen = pairs.slice(0, Math.min(3, pairs.length));
    const rgb = chosen.reduce((sum, item) => [sum[0] + item.rgb[0], sum[1] + item.rgb[1], sum[2] + item.rgb[2]], [0, 0, 0]).map((value) => value / chosen.length);
    output[centerIndex] = Math.max(0, Math.min(255, Math.round(rgb[0])));
    output[centerIndex + 1] = Math.max(0, Math.min(255, Math.round(rgb[1])));
    output[centerIndex + 2] = Math.max(0, Math.min(255, Math.round(rgb[2])));
  }
  const base = safeBaseName(inputPath);
  const outputPath = await availableOutputPath(outputDir, `${base}_去水印${ext === '.png' ? '.png' : '.jpg'}`, new Set());
  if (ext === '.png') await sharp(output, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9, effort: 8 }).toFile(outputPath);
  else await sharp(output, { raw: { width, height, channels: 4 } }).jpeg({ quality: 92, mozjpeg: true }).toFile(outputPath);
  progress('处理完成', 100, '已生成去水印图片');
  return { files: [{ path: outputPath, bytes: (await fs.stat(outputPath)).size }], width, height, detected: Boolean(autoAllowed), manual: hasManual || Boolean(hasSelection), coverage: mask.reduce((sum, value) => sum + value, 0) / Math.max(1, mask.length) };
}

function getFfmpeg() {
  const binary = unpackedBinary(require('ffmpeg-static'));
  if (!binary || !fsSync.existsSync(binary)) throw new Error('未找到内置 FFmpeg。请重新安装应用。');
  return binary;
}

async function probeVideo(inputPath) {
  const ffmpeg = getFfmpeg();
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpeg, ['-hide_banner', '-i', inputPath], { windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', () => {
      const match = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
      if (!match) {
        reject(new Error('无法读取视频时长，请确认文件没有损坏。'));
        return;
      }
      resolve(Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]));
    });
  });
}

async function probeVideoInfo(inputPath) {
  const ffmpeg = getFfmpeg();
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpeg, ['-hide_banner', '-i', inputPath], { windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', () => {
      const durationMatch = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
      const videoMatch = stderr.match(/Video:.*?(\d{2,5})x(\d{2,5})/);
      if (!durationMatch || !videoMatch) {
        reject(new Error('无法读取视频时长或分辨率，请确认文件没有损坏。'));
        return;
      }
      resolve({
        duration: Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3]),
        width: Number(videoMatch[1]),
        height: Number(videoMatch[2]),
        hasAudio: /Audio:/.test(stderr)
      });
    });
  });
}

async function encodeVideo(inputPath, outputPath, duration, videoKbps, progress, passLabel) {
  const ffmpeg = getFfmpeg();
  const args = [
    '-y', '-i', inputPath,
    '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease:flags=lanczos,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,setsar=1',
    '-c:v', 'mpeg2video', '-pix_fmt', 'yuv420p',
    '-b:v', `${videoKbps}k`, '-maxrate', `${videoKbps}k`, '-bufsize', `${videoKbps * 2}k`,
    '-g', '15', '-bf', '2',
    '-c:a', 'ac3', '-b:a', '192k', '-ar', '48000',
    '-sn', '-f', 'mpegts', outputPath
  ];
  let tail = '';
  await run(ffmpeg, args, (text) => {
    tail = (tail + text).slice(-1200);
    const matches = [...tail.matchAll(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/g)];
    if (matches.length) {
      const match = matches.at(-1);
      const seconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
      progress('正在转换视频', Math.min(94, 12 + (seconds / duration) * 82), `${passLabel} · MPEG-2 / AC3`);
    }
  });
}

async function processVideo({ inputPath, outputDir }, progress = () => {}) {
  if (!inputPath || !outputDir) throw new Error('请选择 MP4 文件和输出目录。');
  if (path.extname(inputPath).toLowerCase() !== '.mp4') throw new Error('视频输入仅支持 MP4 格式。');
  await fs.mkdir(outputDir, { recursive: true });
  progress('正在分析视频', 5, '计算时长与目标码率');
  const duration = await probeVideo(inputPath);
  const audioKbps = 192;
  // Reserve enough room for MPEG-TS packetisation, muxing tables and encoder
  // bitrate variation. The final file size below is still the source of truth.
  const targetBytes = 46_000_000;
  let videoKbps = Math.floor((targetBytes * 8) / duration / 1000 - audioKbps - 40);
  videoKbps = Math.max(350, Math.min(15000, videoKbps));
  const outputPath = path.join(outputDir, `${safeBaseName(inputPath)}_1920x1080_mpeg2.ts`);

  let stat;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const passLabel = attempt === 0 ? '首次编码' : `大小校准 ${attempt}`;
    await encodeVideo(inputPath, outputPath, duration, videoKbps, progress, passLabel);
    stat = await fs.stat(outputPath);
    if (stat.size < LIMITS.video) break;

    const displayedMb = (stat.size / 1_000_000).toFixed(1);
    progress('正在校准文件大小', 12, `实际文件为 ${displayedMb}MB，自动降低码率重试`);
    const ratio = Math.min(0.94, targetBytes / stat.size);
    const nextVideoKbps = Math.floor(videoKbps * ratio);
    videoKbps = Math.max(300, Math.min(videoKbps - 100, nextVideoKbps));
  }
  if (!stat || stat.size >= LIMITS.video) {
    throw new Error('视频已多次自动降低码率，但仍无法小于 50MB。请缩短视频时长后重试。');
  }
  progress('处理完成', 100, 'TS 视频已通过规格检查');
  return { files: [{ path: outputPath, bytes: stat.size }], duration, videoKbps };
}

async function encodeCompressedVideo(inputPath, outputPath, info, videoKbps, progress, passLabel) {
  const ffmpeg = getFfmpeg();
  const pixelFormat = info.width % 2 === 0 && info.height % 2 === 0 ? 'yuv420p' : 'yuv444p';
  const args = [
    '-y', '-i', inputPath,
    '-map', '0:v:0', '-map', '0:a?',
    '-c:v', 'libx264', '-preset', 'fast', '-pix_fmt', pixelFormat,
    '-b:v', `${videoKbps}k`, '-maxrate', `${Math.max(videoKbps, 300)}k`, '-bufsize', `${Math.max(videoKbps * 2, 600)}k`,
    '-c:a', 'aac', '-b:a', '128k',
    '-sn', '-map_metadata', '0', '-movflags', '+faststart', outputPath
  ];
  let tail = '';
  await run(ffmpeg, args, (text) => {
    tail = (tail + text).slice(-1200);
    const matches = [...tail.matchAll(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/g)];
    if (!matches.length) return;
    const match = matches.at(-1);
    const seconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
    progress('正在压缩视频', Math.min(95, 10 + (seconds / info.duration) * 84), `${passLabel} · 保持 ${info.width}×${info.height}`);
  });
}

async function compressVideo({ inputPath, outputDir, limitBytes = LIMITS.compressedVideo }, progress = () => {}) {
  if (!inputPath || !outputDir) throw new Error('请选择 MP4 文件和输出目录。');
  if (path.extname(inputPath).toLowerCase() !== '.mp4') throw new Error('视频压缩仅支持 MP4 格式。');
  await fs.mkdir(outputDir, { recursive: true });
  progress('正在分析视频', 5, '读取时长、分辨率和原文件大小');
  const [info, inputStat] = await Promise.all([probeVideoInfo(inputPath), fs.stat(inputPath)]);
  const outputPath = await availableOutputPath(outputDir, `${safeBaseName(inputPath)}_compressed.mp4`, new Set());

  if (inputStat.size < limitBytes) {
    await fs.copyFile(inputPath, outputPath);
    progress('处理完成', 100, `原文件已小于 ${Math.round(limitBytes / 1_000_000)}MB，已无损复制`);
    return {
      files: [{ path: outputPath, bytes: inputStat.size }],
      duration: info.duration,
      width: info.width,
      height: info.height,
      copied: true
    };
  }

  const targetBytes = Math.floor(limitBytes * 0.94);
  const audioKbps = info.hasAudio ? 128 : 0;
  let videoKbps = Math.floor((targetBytes * 8) / info.duration / 1000 - audioKbps - 48);
  videoKbps = Math.max(220, Math.min(50_000, videoKbps));
  let stat;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const passLabel = attempt === 0 ? '首次压缩' : `大小校准 ${attempt}`;
    await encodeCompressedVideo(inputPath, outputPath, info, videoKbps, progress, passLabel);
    stat = await fs.stat(outputPath);
    if (stat.size < limitBytes) break;
    progress('正在校准文件大小', 10, `当前 ${(stat.size / 1_000_000).toFixed(1)}MB，自动降低码率重试`);
    const ratio = Math.min(0.94, targetBytes / stat.size);
    videoKbps = Math.max(180, Math.min(videoKbps - 80, Math.floor(videoKbps * ratio)));
  }
  if (!stat || stat.size >= limitBytes) {
    throw new Error(`视频已多次自动降低码率，但仍无法小于 ${Math.round(limitBytes / 1_000_000)}MB。请缩短视频时长后重试。`);
  }
  progress('处理完成', 100, `视频保持 ${info.width}×${info.height}，并已压缩至 200MB 以内`);
  return {
    files: [{ path: outputPath, bytes: stat.size }],
    duration: info.duration,
    width: info.width,
    height: info.height,
    videoKbps,
    copied: false
  };
}

function smoothstep(value, edge0, edge1) {
  if (edge1 <= edge0) return value >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function dilateBinary(mask, width, height, radius) {
  if (radius <= 0) return Uint8Array.from(mask);
  const output = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(height - 1, y + radius);
    for (let x = 0; x < width; x += 1) {
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width - 1, x + radius);
      let found = 0;
      for (let yy = y0; yy <= y1 && !found; yy += 1) {
        for (let xx = x0; xx <= x1; xx += 1) {
          if (mask[yy * width + xx]) {
            found = 1;
            break;
          }
        }
      }
      output[y * width + x] = found;
    }
  }
  return output;
}

function erodeBinary(mask, width, height, radius) {
  if (radius <= 0) return Uint8Array.from(mask);
  const output = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(height - 1, y + radius);
    for (let x = 0; x < width; x += 1) {
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width - 1, x + radius);
      let filled = 1;
      for (let yy = y0; yy <= y1 && filled; yy += 1) {
        for (let xx = x0; xx <= x1; xx += 1) {
          if (!mask[yy * width + xx]) {
            filled = 0;
            break;
          }
        }
      }
      output[y * width + x] = filled;
    }
  }
  return output;
}

// Gradient logos photographed/rendered on a white matte need a different
// treatment from flat-colour artwork.  A colour threshold alone either drops
// the pale end of a metallic gradient or keeps the warm drop shadow.  This
// mask builder uses reliable gold pixels as seeds, then fills only image
// regions enclosed by the visible bevel/outline.  The edge barrier is built
// from a small Sobel-like luminance gradient so shadows cannot grow across a
// real logo boundary.
function gradientLogoMaskFromWhiteBackground(data, info, sensitivity) {
  const width = info.width;
  const height = info.height;
  const pixelCount = width * height;
  const background = sampleBorderRgb(data, info);
  const strength = Math.max(0, Math.min(1, (Number(sensitivity) - 10) / 90));
  const highSeed = 30 + Math.round(strength * 14);
  const lowGold = 17 + Math.round(strength * 9);
  const seed = new Uint8Array(pixelCount);
  const warmMask = new Uint8Array(pixelCount);
  const luminance = new Float32Array(pixelCount);
  let warmPixels = 0;
  let seedPixels = 0;
  const padding = Math.max(2, Math.round(Math.min(width, height) * 0.008));

  for (let pixel = 0, i = 0; pixel < pixelCount; pixel += 1, i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const goldScore = r + g - 2 * b;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    const isWarm = goldScore > lowGold && r - b > 12 && g - b > 5;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    const awayFromFrame = x >= padding && x < width - padding && y >= padding && y < height - padding;
    if (goldScore > Math.max(5, lowGold - 8) && r - b > 8 && g - b > 3 && awayFromFrame) warmMask[pixel] = 1;
    if (isWarm && awayFromFrame) {
      warmPixels += 1;
      if (goldScore > highSeed && chroma > 12) {
        seed[pixel] = 1;
        seedPixels += 1;
      }
    }
    luminance[pixel] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  // Do not use this specialised path for a non-gold image.  The regular
  // chroma/luminance branch remains better for green, blue and black logos.
  if (warmPixels < Math.max(32, pixelCount * 0.003)
    || seedPixels < Math.max(24, pixelCount * 0.0008)) return null;

  // Sobel magnitude.  A one-pixel barrier dilation closes tiny JPEG gaps in
  // the outline without expanding the eventual foreground itself.
  const strongEdge = new Uint8Array(pixelCount);
  // The soft cast shadow has a surprisingly strong luminance ramp.  A high
  // threshold lets that ramp bridge the face and the shadow into one flood
  // component, which is what causes the dark crescent around C and the
  // heavy lower edges on the lettering.  Use a lower threshold so the
  // actual bevel/face boundary becomes a closed barrier before filling.
  const edgeThreshold = 11 + Math.round(strength * 8);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const p = y * width + x;
      // 3×3 Sobel kernels are less sensitive to the very soft JPEG shading
      // than a simple two-pixel difference, while still catching the bevel
      // that closes each logo face.
      const gx = -luminance[p - width - 1] + luminance[p - width + 1]
        - 2 * luminance[p - 1] + 2 * luminance[p + 1]
        - luminance[p + width - 1] + luminance[p + width + 1];
      const gy = -luminance[p - width - 1] - 2 * luminance[p - width] - luminance[p - width + 1]
        + luminance[p + width - 1] + 2 * luminance[p + width] + luminance[p + width + 1];
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      if (magnitude > edgeThreshold) strongEdge[p] = 1;
    }
  }
  const barrier = new Uint8Array(pixelCount);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const p = y * width + x;
      if (!strongEdge[p] && !strongEdge[p - 1] && !strongEdge[p + 1]
        && !strongEdge[p - width] && !strongEdge[p + width]
        && !strongEdge[p - width - 1] && !strongEdge[p - width + 1]
        && !strongEdge[p + width - 1] && !strongEdge[p + width + 1]) continue;
      barrier[p] = 1;
    }
  }

  // Flood the non-edge regions.  Only regions that contain a reliable gold
  // seed and do not touch the frame are accepted.  This fills pale highlights
  // enclosed by a bevel, while the broad white background and detached shadow
  // regions are discarded.
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  const component = new Int32Array(pixelCount);
  const binary = new Uint8Array(pixelCount);
  const neighbours = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]];
  for (let start = 0; start < pixelCount; start += 1) {
    if (visited[start] || barrier[start]) continue;
    let head = 0;
    let tail = 0;
    let componentSize = 0;
    let containsSeed = 0;
    let touchesFrame = 0;
    queue[tail++] = start;
    visited[start] = 1;
    while (head < tail) {
      const p = queue[head++];
      component[componentSize++] = p;
      const x = p % width;
      const y = Math.floor(p / width);
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) touchesFrame = 1;
      if (seed[p]) containsSeed = 1;
      for (const [dx, dy] of neighbours) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (visited[next] || barrier[next]) continue;
        visited[next] = 1;
        queue[tail++] = next;
      }
    }
    if (containsSeed && !touchesFrame) {
      for (let index = 0; index < componentSize; index += 1) binary[component[index]] = 1;
    }
  }
  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    if (seed[pixel]) binary[pixel] = 1;
  }

  const closeRadius = Math.max(2, Math.min(5, Math.round(Math.min(width, height) * 0.003)));
  const closed = dilateBinary(erodeBinary(dilateBinary(binary, width, height, closeRadius), width, height, closeRadius), width, height, 0);
  const interior = erodeBinary(closed, width, height, 1);
  const output = Buffer.alloc(data.length);
  for (let pixel = 0, i = 0; pixel < pixelCount; pixel += 1, i += 4) {
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    const isOuterEdge = x < padding || x >= width - padding || y < padding || y >= height - padding;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const goldScore = r + g - 2 * b;
    const confidence = smoothstep(goldScore, Math.max(2, lowGold - 10), highSeed + 16);
    let alpha = 0;
    if (!isOuterEdge && interior[pixel]) alpha = 1;
    // Keep only a restrained antialiased fringe around the eroded face.  The
    // previous minimum of 0.48 made pale matte pixels and warm cast-shadow
    // pixels read as a solid dark/white outline on contrasting backgrounds.
    else if (!isOuterEdge && closed[pixel]) alpha = Math.min(0.42, Math.max(0.08, confidence));
    // Do not dilate the specialised mask into a second outer ring.  A one
    // pixel expansion is enough to turn a soft shadow into a visible halo.
    // The photographed drop shadow is warm enough to pass a raw colour test,
    // but it is substantially darker and less saturated than the face.  Keep
    // the thin bevel while rejecting the broad low-luminance shadow fringe.
    if (alpha > 0 && goldScore < 45 && luminance[pixel] < 180) alpha = 0;
    output[i] = 255;
    output[i + 1] = 255;
    output[i + 2] = 255;
    output[i + 3] = Math.round(alpha * 255 * (data[i + 3] / 255));
  }

  // JPEG ringing can leave tiny detached islands (most noticeably as dark
  // specks in the pale C highlight) and can make the first matte pixel fully
  // opaque.  Before filtering components, suppress bright low-tone pixels
  // whose neighbourhood does not contain enough warm logo colour.  This is a
  // local test: it keeps the pale metallic face, but rejects isolated white
  // matte pixels along the outer contour.
  const warmIntegralWidth = width + 1;
  const warmIntegral = new Uint32Array((width + 1) * (height + 1));
  for (let y = 0; y < height; y += 1) {
    let rowSum = 0;
    for (let x = 0; x < width; x += 1) {
      rowSum += warmMask[y * width + x];
      warmIntegral[(y + 1) * warmIntegralWidth + x + 1]
        = warmIntegral[y * warmIntegralWidth + x + 1] + rowSum;
    }
  }
  // Judge a pale pixel against a slightly wider neighbourhood.  Metallic
  // highlights can be nearly neutral for several pixels in a row; a 5px
  // window incorrectly classified the middle of the C highlight as matte
  // and punched a visible transparent pinhole.  Eight pixels still keeps
  // isolated white ringing at the outer contour below the support threshold.
  const supportRadius = Math.max(4, Math.min(8, Math.round(Math.min(width, height) * 0.005)));
  const warmSupport = (x0, y0, x1, y1) => warmIntegral[(y1 + 1) * warmIntegralWidth + x1 + 1]
    - warmIntegral[y0 * warmIntegralWidth + x1 + 1]
    - warmIntegral[(y1 + 1) * warmIntegralWidth + x0]
    + warmIntegral[y0 * warmIntegralWidth + x0];
  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const alphaIndex = pixel * 4 + 3;
    if (output[alphaIndex] < 128) continue;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    const r = data[alphaIndex - 3];
    const g = data[alphaIndex - 2];
    const b = data[alphaIndex - 1];
    const goldScore = r + g - 2 * b;
    if (goldScore >= highSeed + 6 || luminance[pixel] < 210) continue;
    const x0 = Math.max(0, x - supportRadius);
    const y0 = Math.max(0, y - supportRadius);
    const x1 = Math.min(width - 1, x + supportRadius);
    const y1 = Math.min(height - 1, y + supportRadius);
    const area = (x1 - x0 + 1) * (y1 - y0 + 1);
    if (warmSupport(x0, y0, x1, y1) / area < 0.55) output[alphaIndex] = 0;
  }

  // Remove only genuinely small components.  Narrow lettering strokes stay
  // connected, while one-pixel JPEG specks cannot survive to the export.
  const hard = new Uint8Array(pixelCount);
  for (let pixel = 0; pixel < pixelCount; pixel += 1) hard[pixel] = output[pixel * 4 + 3] > 128 ? 1 : 0;
  const cleanupVisited = new Uint8Array(pixelCount);
  const componentQueue = new Int32Array(pixelCount);
  const minComponentSize = Math.max(8, Math.round(pixelCount * 0.00001));
  for (let start = 0; start < pixelCount; start += 1) {
    if (cleanupVisited[start] || !hard[start]) continue;
    let head = 0;
    let tail = 0;
    componentQueue[tail++] = start;
    cleanupVisited[start] = 1;
    while (head < tail) {
      const p = componentQueue[head++];
      const x = p % width;
      const y = Math.floor(p / width);
      for (const [dx, dy] of neighbours) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (cleanupVisited[next] || !hard[next]) continue;
        cleanupVisited[next] = 1;
        componentQueue[tail++] = next;
      }
    }
    if (tail < minComponentSize) {
      for (let index = 0; index < tail; index += 1) hard[componentQueue[index]] = 0;
    }
  }

  // A matte suppression pass can occasionally punch a pinhole through an
  // otherwise continuous pale highlight.  Fill only tiny transparent
  // components that are completely enclosed by foreground; real counters in
  // letters and Chinese glyphs are much larger, while the outer background
  // always reaches the image frame.
  const holeVisited = new Uint8Array(pixelCount);
  const maxPinholeSize = Math.max(12, Math.round(pixelCount * 0.00002));
  for (let start = 0; start < pixelCount; start += 1) {
    if (holeVisited[start] || hard[start]) continue;
    let head = 0;
    let tail = 0;
    let touchesFrame = 0;
    componentQueue[tail++] = start;
    holeVisited[start] = 1;
    while (head < tail) {
      const p = componentQueue[head++];
      const x = p % width;
      const y = Math.floor(p / width);
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) touchesFrame = 1;
      for (const [dx, dy] of neighbours) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (holeVisited[next] || hard[next]) continue;
        holeVisited[next] = 1;
        componentQueue[tail++] = next;
      }
    }
    if (!touchesFrame && tail <= maxPinholeSize) {
      for (let index = 0; index < tail; index += 1) {
        const pixel = componentQueue[index];
        hard[pixel] = 1;
        output[pixel * 4 + 3] = 255;
      }
    }
  }

  // JPEG compression can carve a shallow, warm-coloured notch out of the
  // outer contour where a pale highlight meets the white matte.  Those gaps
  // are not enclosed components (so flood fill cannot see them), but they
  // are easy to recognise as a short row gap with a solid foreground row a
  // couple of pixels below.  Repair only warm gaps up to ~24px wide and at
  // most three pixels deep; counters in glyphs are wider/deeper and remain
  // transparent.
  const maxContourGap = Math.max(8, Math.round(Math.min(width, height) * 0.035));
  for (let y = 1; y < height - 4; y += 1) {
    let x = 1;
    while (x < width - 1) {
      if (hard[y * width + x]) {
        x += 1;
        continue;
      }
      const gapStart = x;
      while (x < width - 1 && !hard[y * width + x]) x += 1;
      const gapEnd = x - 1;
      const gapWidth = gapEnd - gapStart + 1;
      if (gapStart <= 1 || gapEnd >= width - 2 || gapWidth > maxContourGap
        || !hard[y * width + gapStart - 1] || !hard[y * width + gapEnd + 1]) continue;
      let warm = 0;
      for (let xx = gapStart; xx <= gapEnd; xx += 1) {
        const p = y * width + xx;
        const r = data[p * 4];
        const g = data[p * 4 + 1];
        const b = data[p * 4 + 2];
        if (r + g - 2 * b > 8 && r - b > 4 && g - b > 1) warm += 1;
      }
      if (warm / gapWidth < 0.42) continue;
      let supportedBelow = 0;
      for (let yy = y + 1; yy <= y + 3; yy += 1) {
        let rowHard = 0;
        for (let xx = gapStart; xx <= gapEnd; xx += 1) rowHard += hard[yy * width + xx];
        if (rowHard / gapWidth >= 0.78) {
          supportedBelow = 1;
          break;
        }
      }
      if (!supportedBelow) continue;
      for (let xx = gapStart; xx <= gapEnd; xx += 1) {
        const p = y * width + xx;
        hard[p] = 1;
        output[p * 4 + 3] = 255;
      }
    }
  }

  // The flood mask can still classify a dark, detached cast-shadow crescent
  // as part of a ring-shaped logo.  Preserve the bevel but make that narrow
  // outer band translucent: pixels close to the hard-mask boundary, in a
  // low-fill-ratio component, and surrounded by a dark local patch are
  // shadow candidates.  Solid glyphs (for example the H stem) have a higher
  // fill ratio and are left fully opaque.
  const edgeDistance = new Uint8Array(pixelCount);
  edgeDistance.fill(255);
  let distanceHead = 0;
  let distanceTail = 0;
  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    if (!hard[pixel]) {
      edgeDistance[pixel] = 0;
      componentQueue[distanceTail++] = pixel;
    }
  }
  while (distanceHead < distanceTail) {
    const pixel = componentQueue[distanceHead++];
    const distance = edgeDistance[pixel];
    if (distance >= 4) continue;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    for (const [dx, dy] of neighbours) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      const next = ny * width + nx;
      if (edgeDistance[next] <= distance + 1) continue;
      edgeDistance[next] = distance + 1;
      componentQueue[distanceTail++] = next;
    }
  }

  const componentLabels = new Int32Array(pixelCount);
  componentLabels.fill(-1);
  const componentVisited = new Uint8Array(pixelCount);
  const componentFill = [];
  for (let start = 0; start < pixelCount; start += 1) {
    if (componentVisited[start] || !hard[start]) continue;
    let head = 0;
    let tail = 0;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    componentQueue[tail++] = start;
    componentVisited[start] = 1;
    while (head < tail) {
      const pixel = componentQueue[head++];
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      for (const [dx, dy] of neighbours) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (componentVisited[next] || !hard[next]) continue;
        componentVisited[next] = 1;
        componentQueue[tail++] = next;
      }
    }
    if (tail < minComponentSize) continue;
    const id = componentFill.length;
    componentFill.push(tail / ((maxX - minX + 1) * (maxY - minY + 1)));
    for (let index = 0; index < tail; index += 1) componentLabels[componentQueue[index]] = id;
  }

  const shadowSmooth = (value) => smoothstep(value, 70, 130);
  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    if (!hard[pixel] || edgeDistance[pixel] > 3) continue;
    const component = componentLabels[pixel];
    if (component < 0 || componentFill[component] >= 0.47) continue;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    const sourceLuminance = luminance[pixel];
    if (sourceLuminance >= 140) continue;
    let localSum = 0;
    let localCount = 0;
    for (let yy = Math.max(0, y - 4); yy <= Math.min(height - 1, y + 4); yy += 1) {
      for (let xx = Math.max(0, x - 4); xx <= Math.min(width - 1, x + 4); xx += 1) {
        localSum += luminance[yy * width + xx];
        localCount += 1;
      }
    }
    const localMean = localSum / localCount;
    if (localMean >= 110) continue;
    const depthFactor = edgeDistance[pixel] === 1 ? 0.85
      : edgeDistance[pixel] === 2 ? 0.95 : 1;
    const shadowAlpha = Math.round(255 * depthFactor * (0.1 + 0.4 * shadowSmooth(localMean)));
    const alphaIndex = pixel * 4 + 3;
    if (shadowAlpha < output[alphaIndex]) output[alphaIndex] = shadowAlpha;
  }

  // Keep the antialiased fringe produced above.  Clearing every non-hard
  // pixel here converted the specialised mask into a 1-bit silhouette,
  // which is why curved edges (especially the top of C) looked stair-stepped
  // at normal preview size.  The component and hole passes above already
  // remove detached opaque specks; low-alpha pixels are the source's genuine
  // antialiasing and are needed for a clean edge on dark or coloured canvases.
  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const alphaIndex = pixel * 4 + 3;
    if (hard[pixel]) continue;
    if (output[alphaIndex] < 10) output[alphaIndex] = 0;
  }
  return { mask: output, background };
}

function maskFromBackground(data, info, sensitivity) {
  const background = sampleBorderRgb(data, info);
  const specialised = gradientLogoMaskFromWhiteBackground(data, info, sensitivity);
  if (specialised) return specialised;
  const pixelCount = info.width * info.height;
  const output = Buffer.alloc(data.length);
  const strength = Math.max(0, Math.min(1, (Number(sensitivity) - 10) / 90));

  // A simple RGB distance treats pale gold (or any light gradient) as white.
  // Separate chroma from luminance so a light coloured logo remains opaque,
  // while a neutral drop shadow can still be discarded.
  const chromaLow = 8 + strength * 12;
  const chromaHigh = 34 + strength * 28;
  const lumaLow = 46 + strength * 46;
  const lumaHigh = 120 + strength * 90;
  const chromaScores = new Float32Array(pixelCount);
  const lumaScores = new Float32Array(pixelCount);
  const chromaSeeds = new Uint8Array(pixelCount);
  let chromaticPixels = 0;

  for (let i = 0, pixel = 0; i < data.length; i += 4, pixel += 1) {
    const dr = data[i] - background[0];
    const dg = data[i + 1] - background[1];
    const db = data[i + 2] - background[2];
    const mean = (dr + dg + db) / 3;
    const chroma = Math.sqrt((dr - mean) ** 2 + (dg - mean) ** 2 + (db - mean) ** 2);
    const luma = Math.abs(0.2126 * dr + 0.7152 * dg + 0.0722 * db);
    const chromaAlpha = smoothstep(chroma, chromaLow, chromaHigh);
    const lumaAlpha = smoothstep(luma, lumaLow, lumaHigh);
    chromaScores[pixel] = chromaAlpha;
    lumaScores[pixel] = lumaAlpha;
    if (chromaAlpha > 0.08) {
      chromaSeeds[pixel] = 1;
      chromaticPixels += 1;
    }
  }

  const chromatic = chromaticPixels >= Math.max(24, pixelCount * 0.004);
  // Include dark bevels immediately adjacent to a coloured gradient, but not
  // the broad neutral shadow that fades into the white source background.
  const chromaRadius = Math.max(2, Math.min(5, Math.round(Math.min(info.width, info.height) * 0.003)));
  const nearChroma = chromatic ? dilateBinary(chromaSeeds, info.width, info.height, chromaRadius) : chromaSeeds;
  const candidate = new Uint8Array(pixelCount);
  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const colour = chromaScores[pixel];
    const luminance = lumaScores[pixel];
    candidate[pixel] = colour > 0.06 || (!chromatic ? luminance > 0.06 : nearChroma[pixel] && luminance > 0.12) ? 1 : 0;
  }

  // Close tiny gaps caused by JPEG ringing and specular highlights. The
  // radius is deliberately small so counters in Chinese/Latin lettering stay
  // transparent instead of being filled in.
  const closed = dilateBinary(erodeBinary(dilateBinary(candidate, info.width, info.height, 2), info.width, info.height, 2), info.width, info.height, 0);
  const interior = erodeBinary(closed, info.width, info.height, 1);
  const outer = dilateBinary(closed, info.width, info.height, 1);
  const edgeX = Math.max(2, Math.round(info.width * 0.005));
  const edgeY = Math.max(2, Math.round(info.height * 0.005));

  for (let i = 0, pixel = 0; i < data.length; i += 4, pixel += 1) {
    const x = pixel % info.width;
    const y = Math.floor(pixel / info.width);
    const isOuterEdge = x < edgeX || x >= info.width - edgeX || y < edgeY || y >= info.height - edgeY;
    const confidence = Math.max(chromaScores[pixel], chromatic && !nearChroma[pixel] ? 0 : lumaScores[pixel]);
    let alpha = 0;
    if (!isOuterEdge && interior[pixel]) alpha = 1;
    else if (!isOuterEdge && closed[pixel]) alpha = Math.max(0.42, confidence);
    else if (!isOuterEdge && outer[pixel] && confidence > 0.02) alpha = Math.min(0.82, confidence * 0.9);
    alpha *= data[i + 3] / 255;
    output[i] = 255;
    output[i + 1] = 255;
    output[i + 2] = 255;
    output[i + 3] = Math.round(alpha * 255);
  }
  return { mask: output, background };
}

async function extractLogo({ inputPath, outputDir, sensitivity = 68 }, progress = () => {}) {
  if (!inputPath || !outputDir) throw new Error('请选择输入文件和输出目录。');
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bootframe-logo-'));
  try {
    progress('正在识别背景', 12, '采样边缘颜色与透明通道');
    const prepared = await prepareInput(inputPath, tempDir);
    const { data, info } = await sharp(prepared, { limitInputPixels: false }).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const hasTransparency = (() => {
      for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return true;
      return false;
    })();
    let background;
    let originalColor;
    let outputInfo = info;
    let qualityModel = null;
    let qualityCutoutPath = null;

    if (!hasTransparency && looksLikeWarmGradientLogo(data, info)) {
      // Normalise EXIF orientation before handing the file to the external
      // Skill.  This keeps the AI mask aligned with the pixels used below.
      const normalizedInput = path.join(tempDir, 'normalized-input.png');
      await sharp(data, { raw: info }).png().toFile(normalizedInput);
      try {
        qualityCutoutPath = await runQualityLogoCutout(normalizedInput, tempDir, progress);
        qualityModel = qualityCutoutPath ? 'birefnet-general' : null;
      } catch (error) {
        // A clean install may not have the optional Skill/runtime/model.  Keep
        // the original offline algorithm as a deterministic fallback instead
        // of making Logo extraction fail altogether.
        progress('高质量模型不可用', 34, '已切换到内置渐变边缘算法');
      }
    }

    if (qualityCutoutPath) {
      const cutout = await sharp(qualityCutoutPath, { limitInputPixels: false })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      outputInfo = cutout.info;
      originalColor = Buffer.from(cutout.data);
      background = ['transparent'];
      for (let i = 0; i < originalColor.length; i += 4) {
        if (originalColor[i + 3] === 0) originalColor[i] = originalColor[i + 1] = originalColor[i + 2] = 0;
      }
      progress('正在清理边缘', 66, '校验透明通道并保留 BiRefNet 抗锯齿边缘');
    } else {
      let mask;
      if (hasTransparency) {
        mask = Buffer.alloc(data.length);
        for (let i = 0; i < data.length; i += 4) {
          mask[i] = mask[i + 1] = mask[i + 2] = 255;
          mask[i + 3] = data[i + 3];
        }
        background = ['transparent'];
      } else {
        ({ mask, background } = maskFromBackground(data, info, Number(sensitivity)));
      }

      progress('正在清理边缘', 48, '生成平滑透明蒙版并保留原始颜色');
      originalColor = Buffer.from(mask);
      const matteBackground = Array.isArray(background) && background.length === 3 ? background : null;
      for (let i = 0; i < originalColor.length; i += 4) {
        const alpha = originalColor[i + 3] / 255;
        if (!alpha) {
          // Hidden RGB values can create a fringe when another program later
          // un-premultiplies or previews the transparent PNG.
          originalColor[i] = originalColor[i + 1] = originalColor[i + 2] = 0;
        } else if (matteBackground && alpha < 0.999) {
          const sourceLuminance = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
          const sourceGold = data[i] + data[i + 1] - 2 * data[i + 2];
          // Shadow opacity is intentionally lowered by the gradient mask. Do
          // not apply white-matte unmixing to those dark pixels: solving them
          // as a low-alpha white blend produces negative RGB values, which are
          // clamped to black and show as a harsh black crescent on dark canvases.
          const isDarkShadowFringe = alpha < 0.5 && sourceLuminance < 180 && sourceGold > 20;
          if (isDarkShadowFringe) {
            originalColor[i] = data[i];
            originalColor[i + 1] = data[i + 1];
            originalColor[i + 2] = data[i + 2];
            continue;
          }
          // JPEG/PNG screenshots contain the logo composited over a matte. Undo
          // that matte on the soft edge so pale gradients do not carry a white
          // halo onto dark backgrounds.
          originalColor[i] = Math.max(0, Math.min(255, Math.round((data[i] - matteBackground[0] * (1 - alpha)) / alpha)));
          originalColor[i + 1] = Math.max(0, Math.min(255, Math.round((data[i + 1] - matteBackground[1] * (1 - alpha)) / alpha)));
          originalColor[i + 2] = Math.max(0, Math.min(255, Math.round((data[i + 2] - matteBackground[2] * (1 - alpha)) / alpha)));
        } else {
          originalColor[i] = data[i];
          originalColor[i + 1] = data[i + 1];
          originalColor[i + 2] = data[i + 2];
        }
      }
    }

    const trimmed = await sharp(originalColor, { raw: { width: outputInfo.width, height: outputInfo.height, channels: 4 } })
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 2 })
      .extend({ top: 12, bottom: 12, left: 12, right: 12, background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .raw()
      .toBuffer({ resolveWithObject: true });

    await fs.mkdir(outputDir, { recursive: true });
    const base = safeBaseName(inputPath);
    const originalPath = path.join(outputDir, `${base}_logo_original.png`);
    const blackPath = path.join(outputDir, `${base}_logo_black.png`);
    const whitePath = path.join(outputDir, `${base}_logo_white.png`);
    const makeOriginal = async () => {
      await sharp(trimmed.data, { raw: trimmed.info }).png({ compressionLevel: 9, effort: 10 }).toFile(originalPath);
      return { path: originalPath, bytes: (await fs.stat(originalPath)).size };
    };
    const makeColor = async (value, outputPath) => {
      const pixels = Buffer.from(trimmed.data);
      for (let i = 0; i < pixels.length; i += 4) pixels[i] = pixels[i + 1] = pixels[i + 2] = value;
      await sharp(pixels, { raw: trimmed.info }).png({ compressionLevel: 9, effort: 10 }).toFile(outputPath);
      return { path: outputPath, bytes: (await fs.stat(outputPath)).size };
    };
    progress('正在导出三个版本', 76, '生成原色、黑色与白色透明 PNG');
    const [original, black, white] = await Promise.all([makeOriginal(), makeColor(0, blackPath), makeColor(255, whitePath)]);
    progress('处理完成', 100, '原色、黑色与白色透明 PNG 已生成');
    return {
      files: [original, black, white],
      background,
      width: trimmed.info.width,
      height: trimmed.info.height,
      qualityModel
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

/**
 * Deterministic local fallback implementations for the five paid image tools.
 * The renderer tries the company GPT‑Image gateway first; these handlers are
 * used only when that local gateway is not configured or not running, so the
 * packaged demo remains usable for offline flow testing.
 */
async function processPaidImage({ inputPath, outputDir, operation = 'enhance', expandRatio = 'landscape', enhanceStrength = 2 }, progress = () => {}) {
  if (!inputPath || !outputDir) throw new Error('请选择输入文件和输出目录。');
  const ext = path.extname(inputPath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) throw new Error('付费图片工具仅支持 JPG 或 PNG 图片。');
  await fs.mkdir(outputDir, { recursive: true });
  const base = safeBaseName(inputPath);
  progress('正在读取图片', 12, '准备本机图片处理器');

  if (operation === 'ai-cutout') {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hotel-paid-cutout-'));
    try {
      const result = await extractLogo({ inputPath, outputDir: tempDir, sensitivity: 68 }, progress);
      const source = result.files?.[0]?.path;
      if (!source || !fsSync.existsSync(source)) throw new Error('抠图没有生成有效的透明图片。');
      const outputPath = await availableOutputPath(outputDir, `${base}_AI抠图.png`, new Set());
      await fs.copyFile(source, outputPath);
      progress('处理完成', 100, '透明 PNG 已生成');
      return { files: [{ path: outputPath, bytes: (await fs.stat(outputPath)).size }], width: result.width, height: result.height, summary: '本机演示算法已完成主体抠图并导出透明 PNG。' };
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  const metadata = await sharp(inputPath, { limitInputPixels: false }).rotate().metadata();
  if (!metadata.width || !metadata.height) throw new Error('无法读取图片尺寸。');
  const outputExtension = ext === '.png' ? '.png' : '.jpg';
  const suffix = operation === 'erase' ? '擦除' : operation === 'mark-edit' ? '标记改图' : operation === 'expand' ? '扩图' : '变清晰';
  const outputPath = await availableOutputPath(outputDir, `${base}_${suffix}${outputExtension}`, new Set());
  let pipeline = sharp(inputPath, { limitInputPixels: false }).rotate();
  let width = metadata.width;
  let height = metadata.height;

  if (operation === 'expand') {
    const ratio = expandRatio === 'portrait' ? 3 / 4 : expandRatio === 'square' ? 1 : 16 / 9;
    const current = metadata.width / metadata.height;
    if (current >= ratio) height = Math.max(metadata.height, Math.round(width / ratio));
    else width = Math.max(metadata.width, Math.round(height * ratio));
    const edge = await sharp(inputPath, { limitInputPixels: false }).rotate().resize(1, 1).raw().toBuffer();
    pipeline = pipeline.resize({ width, height, fit: 'contain', background: { r: edge[0], g: edge[1], b: edge[2], alpha: 1 } });
    progress('正在扩展画布', 55, `${expandRatio === 'portrait' ? '3:4' : expandRatio === 'square' ? '1:1' : '16:9'} 比例`);
  } else if (operation === 'erase' || operation === 'mark-edit') {
    // A restrained median pass is a safe local fallback for the brush-marked
    // demo. It removes small dust/spot details without inventing a new room.
    pipeline = pipeline.median(3).sharpen({ sigma: 0.55, m1: 0.25, m2: 0.7 });
    progress('正在修复标记区域', 55, '延续周围纹理并压低细碎瑕疵');
  } else {
    const strength = Math.max(1, Math.min(3, Number(enhanceStrength) || 2));
    pipeline = pipeline.median(3).modulate({ brightness: 1 + strength * 0.012, saturation: 1 + strength * 0.025 }).sharpen({ sigma: 0.8 + strength * 0.2, m1: 0.4, m2: 1.1 });
    progress('正在增强清晰度', 55, '改善边缘、曝光与通透感');
  }

  if (outputExtension === '.png') await pipeline.png({ compressionLevel: 9, effort: 8 }).toFile(outputPath);
  else await pipeline.jpeg({ quality: 92, mozjpeg: true }).toFile(outputPath);
  progress('处理完成', 100, `${suffix}图片已保存`);
  return { files: [{ path: outputPath, bytes: (await fs.stat(outputPath)).size }], width, height, summary: `本机演示算法已完成${suffix}处理，文件已保存到所选文件夹。` };
}

module.exports = {
  WIDTH,
  HEIGHT,
  LIMITS,
  encodeBmp,
  sampleImage,
  processImage,
  processImageBatch,
  retouchScene,
  removeFullScreenWatermark,
  processVideo,
  compressVideo,
  extractLogo,
  processPaidImage,
  chooseBackground,
  normalizeMaterialMode
};
