import { createServer } from 'node:http';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { chmodSync, existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const DEMO_ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4174);
const KEYCHAIN_SERVICE = 'hotel-material-studio-company';
const KEYCHAIN_ACCOUNT = process.env.USER || process.env.USERNAME || 'hotel-material-studio';
const RUNTIME_SETTINGS_PATH = join(DEMO_ROOT, '.runtime-settings.json');

function readKeychainValue() {
  if (process.platform !== 'darwin') return '';
  try {
    return execFileSync('security', ['find-generic-password', '-a', KEYCHAIN_ACCOUNT, '-s', KEYCHAIN_SERVICE, '-w'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return '';
  }
}

function readDoubaoKeychainValue() {
  if (process.platform !== 'darwin') return '';
  try {
    return execFileSync('security', ['find-generic-password', '-a', KEYCHAIN_ACCOUNT, '-s', 'hotel-material-studio-doubao', '-w'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return '';
  }
}

function readRuntimeSettings() {
  try {
    if (!existsSync(RUNTIME_SETTINGS_PATH)) return {};
    const parsed = JSON.parse(readFileSync(RUNTIME_SETTINGS_PATH, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function loadPersistentConfig() {
  const settings = readRuntimeSettings();
  const keychainKey = readKeychainValue();
  const fileKey = process.platform === 'darwin' && keychainKey ? '' : String(settings.apiKey || '');
  return {
    ...settings,
    apiKey: keychainKey || fileKey,
    storage: keychainKey ? 'keychain' : fileKey ? 'local-file' : 'process-memory'
  };
}

function persistConfig(config) {
  const apiKey = String(config.apiKey || '').trim();
  let storage = 'process-memory';
  let keychainSaved = false;
  if (apiKey && process.platform === 'darwin') {
    try {
      execFileSync('security', ['add-generic-password', '-a', KEYCHAIN_ACCOUNT, '-s', KEYCHAIN_SERVICE, '-w', apiKey, '-U'], {
        stdio: ['ignore', 'ignore', 'ignore']
      });
      keychainSaved = true;
      storage = 'keychain';
    } catch {
      // Fall back to a 0600 local file if Keychain is unavailable.
    }
  }
  const persisted = { ...config, storage };
  if (keychainSaved) delete persisted.apiKey;
  try {
    writeFileSync(RUNTIME_SETTINGS_PATH, `${JSON.stringify(persisted, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    chmodSync(RUNTIME_SETTINGS_PATH, 0o600);
    if (!keychainSaved && apiKey) persisted.apiKey = apiKey;
    return storage;
  } catch {
    return storage;
  }
}

function clearPersistentConfig() {
  if (process.platform === 'darwin') {
    try { execFileSync('security', ['delete-generic-password', '-a', KEYCHAIN_ACCOUNT, '-s', KEYCHAIN_SERVICE], { stdio: ['ignore', 'ignore', 'ignore'] }); } catch { /* already absent */ }
  }
  try { if (existsSync(RUNTIME_SETTINGS_PATH)) unlinkSync(RUNTIME_SETTINGS_PATH); } catch { /* best effort */ }
}

const PERSISTED_CONFIG = loadPersistentConfig();
const DOUBAO_KEYCHAIN_KEY = readDoubaoKeychainValue();
let CONFIG_STORAGE = PERSISTED_CONFIG.storage || 'process-memory';
// 启动脚本可以通过环境变量提供默认配置；配置弹窗则会在运行时更新这些
// 值。API Key 优先保存在 macOS 钥匙串，网页和前端代码都不会接触明文 Key。
let MODEL_PROVIDER = (process.env.MODEL_PROVIDER || PERSISTED_CONFIG.provider || (process.env.ARK_API_KEY ? 'doubao' : 'company')).toLowerCase();
let COMPANY_API_BASE_URL = (process.env.COMPANY_API_BASE_URL || PERSISTED_CONFIG.apiBaseUrl || 'https://coding.efficient.center/api/v1').replace(/\/+$/, '');
let COMPANY_API_KEY = process.env.API_GATEWAY_KEY || PERSISTED_CONFIG.apiKey || '';
let COMPANY_IMAGE_MODEL = process.env.COMPANY_IMAGE_MODEL || PERSISTED_CONFIG.model || 'gpt-image-2';
let COMPANY_ACTOR_AUTHORIZATION = process.env.COMPANY_ACTOR_AUTHORIZATION || PERSISTED_CONFIG.actorAuthorization || 'image-generation';
let COMPANY_IMAGE_QUALITY = process.env.COMPANY_IMAGE_QUALITY || PERSISTED_CONFIG.quality || 'medium';
// The company gateway shares one key across image, video, and audio, but the
// API hosts and routes differ. Turing's portal task API is configured independently.
let COMPANY_VIDEO_API_BASE_URL = (process.env.COMPANY_VIDEO_API_BASE_URL || PERSISTED_CONFIG.videoApiBaseUrl || 'https://live-turing.cn.llm.tcljd.com/api/v1').replace(/\/+$/, '');
let COMPANY_VIDEO_MODEL = process.env.COMPANY_VIDEO_MODEL || PERSISTED_CONFIG.videoModel || 'doubao-seedance-2-5-260628';
let COMPANY_AUDIO_MODEL = process.env.COMPANY_AUDIO_MODEL || PERSISTED_CONFIG.audioModel || 'turing/tts-1';
// Text generation uses the Turing chat-completions gateway, separate from the
// image gateway so a text request cannot accidentally hit an image endpoint.
let COMPANY_TEXT_API_BASE_URL = (process.env.COMPANY_TEXT_API_BASE_URL || PERSISTED_CONFIG.textApiBaseUrl || 'https://live-turing.cn.llm.tcljd.com/api/v1').replace(/\/+$/, '');
let COMPANY_TEXT_MODEL = process.env.COMPANY_TEXT_MODEL || PERSISTED_CONFIG.textModel || 'turing/deepseek-v3-2';
// Lightweight vision model used for automatic scene labels and smart EDL.
// It accepts image_url inputs on the company gateway and is fast enough to
// tag a batch of hotel thumbnails during upload.
let COMPANY_EDIT_MODEL = process.env.COMPANY_EDIT_MODEL || process.env.COMPANY_VISION_MODEL || PERSISTED_CONFIG.editModel || 'turing/gpt-4o-mini';
let COMPANY_ASR_MODEL = process.env.COMPANY_ASR_MODEL || PERSISTED_CONFIG.asrModel || '';
let COMPANY_VIDEO_STATUS_URL = (process.env.COMPANY_VIDEO_STATUS_URL || '').replace(/\/+$/, '');
const COMPANY_VIDEO_TASK_PATH = '/portal/me/videos';
const VIDEO_POLL_INTERVAL_MS = Math.max(1000, Number(process.env.COMPANY_VIDEO_POLL_INTERVAL_MS) || 20000);
let DOUBAO_API_BASE_URL = (process.env.DOUBAO_API_BASE_URL || PERSISTED_CONFIG.doubaoApiBaseUrl || 'https://ark.cn-beijing.volces.com/api/v3').replace(/\/+$/, '');
let DOUBAO_API_KEY = process.env.ARK_API_KEY || DOUBAO_KEYCHAIN_KEY || PERSISTED_CONFIG.apiKey || '';
let DOUBAO_IMAGE_MODEL = process.env.DOUBAO_MODEL || PERSISTED_CONFIG.doubaoModel || 'doubao-seedream-5-0-260128';
// The active Doubao text model was verified against the configured Ark key.
let DOUBAO_TEXT_MODEL = process.env.DOUBAO_TEXT_MODEL || PERSISTED_CONFIG.doubaoTextModel || 'doubao-seed-evolving';
let TEXT_MODEL_PROVIDER = (process.env.TEXT_MODEL_PROVIDER || PERSISTED_CONFIG.textProvider || (DOUBAO_API_KEY ? 'doubao' : 'company')).toLowerCase();
const MAX_BODY_BYTES = 128 * 1024 * 1024;
const require = createRequire(import.meta.url);

function ffmpegBinary() {
  const configured = process.env.FFMPEG_PATH || process.env.FFMPEG_BINARY;
  if (configured) return configured;
  try {
    const bundled = require('ffmpeg-static');
    if (bundled) return bundled;
  } catch {
    // The browser-only demo does not require npm dependencies to start.
  }
  return 'ffmpeg';
}

function runProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, stdio: ['ignore', 'pipe', 'pipe'] });
    const stdout = [];
    const stderr = [];
    child.stdout.on('data', chunk => stdout.push(chunk));
    child.stderr.on('data', chunk => stderr.push(chunk));
    child.on('error', reject);
    child.on('close', code => {
      const output = Buffer.concat(stderr).toString('utf8');
      if (code === 0) resolve({ stdout: Buffer.concat(stdout), stderr: output });
      else {
        const error = new Error(output.split('\n').filter(Boolean).slice(-8).join('\n') || `${command} 退出码 ${code}`);
        error.code = code;
        reject(error);
      }
    });
  });
}

function sharedApiKey() {
  return MODEL_PROVIDER === 'doubao'
    ? (DOUBAO_API_KEY || COMPANY_API_KEY)
    : (COMPANY_API_KEY || DOUBAO_API_KEY);
}

function textModelSettings() {
  const provider = TEXT_MODEL_PROVIDER === 'doubao' && DOUBAO_API_KEY ? 'doubao' : 'company';
  return provider === 'doubao'
    ? { provider, apiKey: DOUBAO_API_KEY, apiBaseUrl: DOUBAO_API_BASE_URL, model: DOUBAO_TEXT_MODEL }
    : { provider, apiKey: COMPANY_API_KEY || DOUBAO_API_KEY, apiBaseUrl: COMPANY_TEXT_API_BASE_URL, model: COMPANY_TEXT_MODEL };
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function json(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(payload));
}

function readRequestBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    let size = 0;
    let exceededLimit = false;
    req.on('data', chunk => {
      if (exceededLimit) return;
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        exceededLimit = true;
        chunks.length = 0;
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (exceededLimit) {
        const error = new Error('上传素材总大小不能超过 128MB');
        error.status = 413;
        rejectBody(error);
      } else resolveBody(Buffer.concat(chunks));
    });
    req.on('error', rejectBody);
  });
}

function parseMultipart(body, contentType) {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '');
  const boundaryText = match?.[1] || match?.[2];
  if (!boundaryText) throw new Error('无法读取上传表单边界');

  const boundary = Buffer.from(`--${boundaryText}`);
  const parts = [];
  let cursor = body.indexOf(boundary);
  while (cursor !== -1) {
    let partStart = cursor + boundary.length;
    if (body.slice(partStart, partStart + 2).toString() === '--') break;
    if (body.slice(partStart, partStart + 2).toString() === '\r\n') partStart += 2;

    const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), partStart);
    if (headerEnd === -1) break;
    const headers = body.slice(partStart, headerEnd).toString('utf8');
    const nextBoundary = body.indexOf(boundary, headerEnd + 4);
    if (nextBoundary === -1) break;

    let dataEnd = nextBoundary;
    if (body.slice(dataEnd - 2, dataEnd).toString() === '\r\n') dataEnd -= 2;
    const disposition = /content-disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]*)")?/i.exec(headers);
    if (disposition) {
      const contentTypeMatch = /content-type:\s*([^\r\n]+)/i.exec(headers);
      parts.push({
        name: disposition[1],
        filename: disposition[2] || '',
        contentType: contentTypeMatch?.[1]?.trim() || 'application/octet-stream',
        data: body.slice(headerEnd + 4, dataEnd)
      });
    }
    cursor = nextBoundary;
  }
  return parts;
}

function partByName(parts, name) {
  return parts.find(part => part.name === name);
}

function textPart(parts, name) {
  const part = partByName(parts, name);
  return part ? part.data.toString('utf8').trim() : '';
}

function safeFileExtension(filename, fallback = '.bin') {
  const suffix = extname(String(filename || '')).toLowerCase();
  return /^\.[a-z0-9]{1,8}$/.test(suffix) ? suffix : fallback;
}

function ffmpegPathEscape(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "\\'");
}

function srtTime(seconds) {
  const milliseconds = Math.max(0, Math.round(Number(seconds || 0) * 1000));
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const secs = Math.floor((milliseconds % 60000) / 1000);
  const millis = milliseconds % 1000;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

function wrapSrtText(value, maxChars) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const chars = [...text];
  const maxLines = 2;
  if (chars.length > maxChars * maxLines) {
    const target = Math.max(1, Math.ceil(chars.length / maxLines));
    const punctuation = /[，。！？；：,.!?;:]/;
    let boundary = target;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let index = 1; index < chars.length; index += 1) {
      const punctuationBonus = punctuation.test(chars[index - 1]) ? -3 : 0;
      const score = Math.abs(index - target) + punctuationBonus;
      if (score < bestScore) { bestScore = score; boundary = index; }
    }
    return [chars.slice(0, boundary).join(''), chars.slice(boundary).join('')].filter(Boolean).join('\n');
  }
  const lines = [];
  let line = '';
  for (const char of text) {
    if (line.length >= maxChars && /[，。！？；：,.!?;:]/.test(char)) {
      line += char;
      lines.push(line);
      line = '';
    } else if (line.length >= maxChars) {
      lines.push(line);
      line = char;
    } else {
      line += char;
    }
  }
  if (line) lines.push(line);
  return lines.join('\n');
}

function assTime(seconds) {
  const centiseconds = Math.max(0, Math.round(Number(seconds || 0) * 100));
  const hours = Math.floor(centiseconds / 360000);
  const minutes = Math.floor((centiseconds % 360000) / 6000);
  const secs = Math.floor((centiseconds % 6000) / 100);
  const cs = centiseconds % 100;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function assEscapeText(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/[{}]/g, '')
    .replace(/[\r\n]+/g, '\\N');
}

function assHeadlineParts(value, headline = {}) {
  const text = String(value || '').replace(/\s+/g, '').trim();
  const provided = headline && typeof headline === 'object'
    ? { lead: String(headline.lead || ''), keyword: String(headline.keyword || ''), tail: String(headline.tail || '') }
    : { lead: '', keyword: '', tail: '' };
  if (provided.keyword && text.includes(provided.keyword)) return provided;
  const clause = (text.split(/[，。！？、；：:]/).map(item => item.trim()).find(Boolean) || text).slice(0, 24);
  if (!clause) return { lead: '', keyword: '', tail: '' };
  const size = clause.length >= 10 ? 4 : clause.length >= 6 ? 3 : Math.max(2, Math.ceil(clause.length / 2));
  const start = Math.max(0, Math.min(clause.length - size, Math.floor((clause.length - size) * .55)));
  return { lead: clause.slice(0, start).slice(-7), keyword: clause.slice(start, start + size), tail: clause.slice(start + size).slice(0, 7) };
}

// Stable pseudo-random selection keeps the client preview and ASS render in sync.
const captionMotionNames = ['fade', 'slide-left', 'slide-right', 'slide-up', 'slide-down'];

function captionMotionFor(text, index = 0, provided = '') {
  const requested = String(provided || '').toLowerCase();
  if (captionMotionNames.includes(requested)) return requested;
  let hash = 2166136261;
  for (const char of `${index}:${String(text || '')}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return captionMotionNames[(hash >>> 0) % captionMotionNames.length];
}

function buildAssCaptions(edl, segments, width, height) {
  const styleName = String(edl?.subtitleStyle || 'clean-white').toLowerCase();
  const palette = styleName === 'warm-label'
    ? { accent: '&H00288BD8', accentStroke: '&H0073BCF1', body: '&H00FFF5E2', bodyText: '&H00774D25', support: '&H00FFFFFF' }
    : styleName === 'soft-blue'
      ? { accent: '&H00D18F2F', accentStroke: '&H00F0BA6F', body: '&H00E8F4FF', bodyText: '&H00234D70', support: '&H00FFFFFF' }
      : { accent: '&H00FFE88C', accentStroke: '&H00CBAE3C', body: '&H00FFFFFF', bodyText: '&H00FFFFFF', support: '&H00FFFFFF' };
  const fontSize = edl?.ratio === '16:9' ? 52 : 58;
  const bodySize = edl?.ratio === '16:9' ? 31 : 35;
  const header = [
    '[Script Info]',
    'ScriptType: v4.00+',
    `PlayResX: ${width}`,
    `PlayResY: ${height}`,
    'WrapStyle: 2',
    'ScaledBorderAndShadow: yes',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    `Style: Headline,PingFang SC,${fontSize},${palette.support},${palette.support},&H00101010,&H00000000,1,0,0,0,100,100,0,0,1,1,0,5,30,30,0,1`,
    `Style: Body,PingFang SC,${bodySize},${palette.bodyText},${palette.bodyText},${styleName === 'clean-white' ? '&H00101010' : palette.accentStroke},${styleName === 'clean-white' ? '&H00000000' : palette.body},0,0,0,0,100,100,0,0,3,1,0,2,40,40,${Math.round(height * .13)},1`,
    `Style: Rule,PingFang SC,16,${palette.accent},${palette.accent},${palette.accent},&H00000000,1,0,0,0,100,100,0,0,1,0,0,5,30,30,0,1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'
  ];
  const events = [];
  let cursor = 0;
  const maxChars = edl?.ratio === '16:9' ? 22 : 13;
  const prepared = segments.map((segment, index) => {
    const duration = Math.max(.4, Number(segment.duration) || 0);
    const text = String(segment.text || '').trim();
    const lines = wrapSrtText(text, maxChars).split('\n').filter(Boolean).slice(0, 2);
    const headline = assHeadlineParts(text, segment.headline);
    return { segment, index, duration, text, lines, headline };
  });
  const keywordScale = 1.34;
  const weightedLineLength = (line, keyword) => {
    const keywordIndex = keyword ? line.indexOf(keyword) : -1;
    return [...line].length + (keywordIndex >= 0 ? [...keyword].length * (keywordScale - 1) : 0);
  };
  const longestLine = Math.max(1, ...prepared.flatMap(({ lines, headline }) => lines.map((line) => weightedLineLength(line, headline.keyword))));
  const lineFontSize = Math.max(edl?.ratio === '16:9' ? 36 : 42, Math.round(fontSize * Math.min(1, maxChars / longestLine)));
  const keywordFontSize = Math.round(lineFontSize * keywordScale);
  const headlineX = Math.round(width / 2);
  const headlineY = Math.round(height * .67);
  const enterMs = 180;
  const exitMs = 140;
  const renderHeadline = (item, start, end, value, motion, withFade = true) => {
    const lines = wrapSrtText(value, maxChars).split('\n').filter(Boolean).slice(0, 2);
    if (!lines.length) return;
    const headline = assHeadlineParts(value, item.headline);
    const styledLines = lines.map((line) => {
      const keywordIndex = headline.keyword ? line.indexOf(headline.keyword) : -1;
      if (keywordIndex < 0) return `{\\c${palette.support}\\3c&H00101010&\\fs${lineFontSize}\\bord1\\shad0}${assEscapeText(line)}`;
      const lead = line.slice(0, keywordIndex);
      const keyword = line.slice(keywordIndex, keywordIndex + headline.keyword.length);
      const tail = line.slice(keywordIndex + headline.keyword.length);
      return `{\\c${palette.support}\\3c&H00101010&\\fs${lineFontSize}\\bord1\\shad0}${assEscapeText(lead)}{\\c${palette.accent}\\3c${palette.accentStroke}\\fs${keywordFontSize}\\bord1\\shad0}${assEscapeText(keyword)}{\\c${palette.support}\\3c&H00101010&\\fs${lineFontSize}\\bord1\\shad0}${assEscapeText(tail)}`;
    });
    const travel = Math.round(width * .045);
    const fade = withFade ? `\\fad(${enterMs},${exitMs})` : '';
    let movement = `\\pos(${headlineX},${headlineY})`;
    if (motion === 'slide-left') movement = `\\move(${headlineX - travel},${headlineY},${headlineX},${headlineY},0,${enterMs})`;
    if (motion === 'slide-right') movement = `\\move(${headlineX + travel},${headlineY},${headlineX},${headlineY},0,${enterMs})`;
    if (motion === 'slide-up') movement = `\\move(${headlineX},${headlineY + travel},${headlineX},${headlineY},0,${enterMs})`;
    if (motion === 'slide-down') movement = `\\move(${headlineX},${headlineY - travel},${headlineX},${headlineY},0,${enterMs})`;
    events.push(`Dialogue: 2,${assTime(start)},${assTime(end)},Headline,,0,0,0,,{\\an5\\q2\\fs${lineFontSize}${movement}${fade}}${styledLines.join('\\N')}`);
  };
  prepared.forEach(({ segment, index, duration, text, lines, headline }) => {
    const start = cursor;
    const end = cursor + duration;
    cursor = end;
    if (!text) return;
    const motion = captionMotionFor(text, index, segment.motion);
    renderHeadline({ ...segment, headline }, start, end, text, motion);
    const ruleY = Math.round(height * .67 + (lines.length - 1) * lineFontSize * .62 + Math.max(lineFontSize, keywordFontSize) * .52);
    const ruleWidth = Math.round(width * .18);
    const ruleX = Math.round(width / 2 - ruleWidth / 2);
    events.push(`Dialogue: 1,${assTime(start)},${assTime(end)},Rule,,0,0,0,,{\\an7\\bord0\\shad0\\fad(${enterMs},${exitMs})\\pos(${ruleX},${ruleY})\\p1\\c${palette.accent}&}m 0 0 l ${ruleWidth} 0 l ${ruleWidth} 3 l 0 3{\\p0}`);
  });
  return `${header.join('\n')}\n${events.join('\n')}\n`;
}

function normalizeEditSegments(edl) {
  const ranges = Array.isArray(edl?.ranges) ? edl.ranges : Array.isArray(edl?.segments) ? edl.segments : [];
  return ranges.map((range, index) => {
    const start = Math.max(0, Number(range?.sourceStart ?? range?.source_start ?? range?.start ?? range?.mediaStart ?? 0) || 0);
    const sourceEnd = Number(range?.sourceEnd ?? range?.source_end ?? range?.end ?? range?.mediaEnd);
    const sourceDuration = Math.max(.4, Number(range?.sourceDuration) || (Number.isFinite(sourceEnd) ? sourceEnd - start : 2));
    const voiceStart = Number(range?.voiceStart ?? range?.voice_start);
    const voiceEnd = Number(range?.voiceEnd ?? range?.voice_end);
    const duration = Math.max(.4, Number(range?.duration) || (Number.isFinite(voiceStart) && Number.isFinite(voiceEnd) ? voiceEnd - voiceStart : sourceDuration));
    const text = String(range?.text ?? range?.caption ?? range?.script ?? '').trim().slice(0, 160);
    return {
      index,
      assetIndex: Math.max(0, Number(range?.assetIndex ?? range?.asset_index ?? index) || 0),
      start,
      end: start + sourceDuration,
      duration,
      voiceStart: Number.isFinite(voiceStart) ? Math.max(0, voiceStart) : null,
      voiceEnd: Number.isFinite(voiceEnd) ? Math.max(0, voiceEnd) : null,
      captionStart: Number(range?.captionStart ?? range?.caption_start ?? 0) || 0,
      captionEnd: Number(range?.captionEnd ?? range?.caption_end ?? duration) || duration,
      headline: range?.headline && typeof range.headline === 'object' ? range.headline : {},
      beat: String(range?.beat || '').trim(),
      text,
      motion: captionMotionFor(text, index, range?.motion)
    };
  }).filter(item => item.duration > 0);
}

function outputSize(ratio) {
  if (ratio === 'auto') return 'auto';
  if (ratio === 'portrait') return '1152x1536';
  if (ratio === 'square') return '1024x1024';
  return '1536x864';
}

function imageFile(part, fallbackName) {
  const type = part.contentType?.startsWith('image/') ? part.contentType : 'image/png';
  const filename = part.filename || fallbackName;
  return new Blob([part.data], { type });
}

function buildPrompt(parts) {
  const title = textPart(parts, 'title');
  const description = textPart(parts, 'description');
  const brief = textPart(parts, 'brief');
  const ratio = textPart(parts, 'ratio') || 'landscape';
  const style = textPart(parts, 'style') || 'classic';
  const sceneUploaded = Boolean(partByName(parts, 'scene_image')?.data?.length);
  const logoUploaded = Boolean(partByName(parts, 'logo')?.data?.length);
  const qrUploaded = Boolean(partByName(parts, 'qr_code')?.data?.length);
  const sceneDirection = sceneUploaded
    ? '结合酒店实景图的光线、材质与主体自动选择最合适的色调、蒙层方向、文字层级和留白比例。酒店实景图是唯一主场景，保持其真实空间、主要家具和摄影视角，不要把它改造成另一间房。'
    : '本次没有上传酒店实景图，请根据用户对话中的地点、用途、季节和氛围生成合适的酒店场景；不要复制风格参考图的原场景内容，也不要凭空加入未提供的酒店名称或具体设施。';
  const ratioLabel = ratio === 'portrait' ? '3:4 竖版' : ratio === 'square' ? '1:1 方版' : '16:9 横版';
  const layoutByRatio = ratio === 'portrait'
    ? '这是 3:4 竖版：将实景安排在画面上方或主体区域，文字面板放在下方或侧下方，保持清晰的视觉层级，不要强行裁成横版。'
    : ratio === 'square'
      ? '这是 1:1 方版：将实景和文字面板重新平衡为方形构图，保持主体完整，不要强行裁成横版。'
      : '这是 16:9 横版：右侧约 62% 为实景，左侧约 38% 为文字面板。';
  const styleDirections = {
    smart: `版式智能匹配：请先理解用户对话中的用途、受众、季节和氛围，再${sceneDirection}整体保持克制、清晰、可发布；不要机械套用固定模板，也不要凭空增加未提供的文字、品牌或数字。${layoutByRatio}`,
    warm: `【暖调现代轻奢模板固定规则】${layoutByRatio} ${ratio === 'landscape' ? '左侧深色渐变蒙层是必选项，不得省略：面板约占画面宽度 38% 至 46%，最左侧为明显的深炭灰/深棕半透明（约 65% 至 80% 不透明度），向右平滑渐变至完全透明并保留实景纹理，禁止整张图使用同一色块，也禁止没有蒙层。' : '蒙层方向和比例要根据当前画幅自然适配，仍然必须保留明显的深色半透明到透明柔和渐变，不要出现生硬色块。'} 所有标题、正文和卖点必须放在蒙层保护区域内，统一使用高对比的象牙白、暖白或浅金色，禁止深棕色/黑色文字落在沙发、床品、墙面等亮实景上。整体使用米白、奶油色、原木色和暖金色氛围光。左侧或文字区域排版自上而下：主标题两行、字距舒展；副标题一行；正文 3 至 4 行；底部可有四个等距卖点。只有用户提供的文字才允许显示，未提供的副标题、卖点和图标必须隐藏，不得自行编造。生成前请先完成“蒙层存在、文字区域对比度足够、文字没有落在实景亮部”的版式检查。`,
    midnight: '版式锁定：左侧为深蓝黑色渐变蒙层，向右逐渐透明并融入实景，配少量金色细节；不能做成边界生硬的纯色矩形。',
    parchment: '版式锁定：左侧为温暖米白/浅棕的柔和渐变蒙层，向右逐渐透明并融入实景，保留雅致留白。',
    business: '版式锁定：右侧文字区域使用深蓝黑色的柔和渐变蒙层，向左或向右自然融入实景，保持商务、克制的构图。',
    family: '版式锁定：右侧文字区域使用暖白/浅米色的柔和渐变蒙层，向实景自然过渡，保持亲和、明亮的构图。'
  }[style] || '版式锁定：严格参考风格图中的蒙层方向、渐变过渡和文字区域比例，不得改成边界生硬的纯色块。';

  return [
    '用途：酒店运营海报。请直接输出一张完整、扁平化、可发布的成品图，不要输出图层、设计文件、模板预览图或 UI 截图。',
    sceneUploaded
      ? '输入图片职责必须严格区分：图1仅用于参考风格、构图、蒙层、留白和装饰关系；图2是用户酒店实景，是唯一的主场景，必须保持图2的真实空间、主要家具和摄影视角，不要把它改造成另一间房。'
      : '本次仅提供图1作为风格参考，没有上传酒店实景图。请根据用户文字需求生成合适的酒店场景；图1只用于参考风格、构图、蒙层、留白和装饰关系，不要复制图1的原场景或原文字。',
    `输出比例：${ratioLabel}。${styleDirections}`,
    `文字规则非常重要：只使用下方用户提供的文字，标题和介绍必须逐字保留，不得改写、翻译、增删、乱码或替换。禁止从图1${sceneUploaded ? '或图2' : ''}读取并生成任何未提供的房号、价格、年份、评分、数字或品牌字样。`,
    `【主标题，必须逐字使用】${title}`,
    `【介绍文案，必须逐字使用】${description}`,
    brief ? `【用户对话需求，请结合画面执行】${brief}` : '',
    '文字需要清晰、可读、具有高级酒店宣传物料的排版层级；主标题、说明文字和装饰元素的位置关系要尽量贴近图1，但不能复制图1中的原文字。',
    logoUploaded ? '图3是用户上传的 Logo。保留其原始形状、颜色和比例，清晰放置，不要重新设计或生成另一个 Logo。' : '未上传 Logo：禁止生成、复制或预留 Logo，也不要留下空白占位。',
    qrUploaded ? '图4是用户上传的二维码。保留其原始黑白结构和比例，清晰放置，不要重新绘制。' : '未上传二维码：禁止生成、复制或预留二维码，也不要留下空白占位。',
    `不要复制图1中的文字、Logo、二维码或原场景${sceneUploaded ? '，也不要改变图2的真实场景' : ''}；没有提供的元素必须缺省并自然平衡布局。禁止水印、额外品牌名、未提供数字、边框和 UI。若模型无法同时满足场景主体与文字清晰度，优先保留明显的渐变蒙层和可读文字，不要取消蒙层来扩大照片面积。`
  ].join('\n');
}

function imageDataUri(part, fallbackType = 'image/png') {
  const contentType = part.contentType?.startsWith('image/') ? part.contentType : fallbackType;
  return `data:${contentType};base64,${part.data.toString('base64')}`;
}

function imageMimeFromBytes(bytes) {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';
  if (bytes.slice(0, 6).toString('ascii') === 'GIF87a' || bytes.slice(0, 6).toString('ascii') === 'GIF89a') return 'image/gif';
  return 'image/png';
}

function companyImagePermissionMessage(payload, response) {
  const upstreamMessage = payload?.error?.message || payload?.message || payload?.error || '';
  const restricted = response?.status === 403 && (
    payload?.code === 1308 ||
    /restricted to codex requests|image api.*codex|codex requests/i.test(upstreamMessage)
  );
  if (restricted) {
    return '公司网关已识别到 GPT‑Image，但当前密钥仅允许 Codex 请求，尚未开通「酒店素材工坊」图片 API 调用权限。请联系公司模型平台管理员开通图片 API 客户端权限后重试。';
  }
  return upstreamMessage;
}

async function readDoubaoImagePayload(payload) {
  const item = payload?.data?.[0];
  if (item?.b64_json) return Buffer.from(item.b64_json, 'base64');
  if (item?.url) {
    const imageResponse = await fetch(item.url);
    if (!imageResponse.ok) throw new Error(`豆包图片下载失败：${imageResponse.status}`);
    return Buffer.from(await imageResponse.arrayBuffer());
  }
  return null;
}

async function readCompanyImagePayload(payload) {
  const item = payload?.data?.[0];
  if (item?.b64_json) return Buffer.from(item.b64_json, 'base64');
  if (item?.url) {
    const imageResponse = await fetch(item.url);
    if (!imageResponse.ok) throw new Error(`公司模型图片下载失败：${imageResponse.status}`);
    return Buffer.from(await imageResponse.arrayBuffer());
  }
  return null;
}

function videoAssetParts(parts) {
  return parts.filter(part => ['asset', 'asset[]', 'image', 'image[]', 'video', 'video[]', 'input', 'input[]'].includes(part.name) && part.data?.length);
}

function findVideoUrl(payload) {
  const candidates = [
    payload?.video_uri, payload?.items?.[0]?.video_uri, payload?.data?.video_uri, payload?.data?.items?.[0]?.video_uri,
    payload?.video?.url, payload?.video?.video_url, payload?.video_url, payload?.video_download_url, payload?.output_video_url,
    payload?.output?.video_url, payload?.output?.url, payload?.result?.video_url, payload?.result?.url,
    payload?.result?.video?.url, payload?.result?.video_download_url,
    payload?.data?.video_url, payload?.data?.video_download_url, payload?.data?.url,
    payload?.data?.video?.url, payload?.data?.output?.video_url,
    payload?.data?.[0]?.video_url, payload?.data?.[0]?.url, payload?.data?.[0]?.video?.url,
    payload?.content?.video_url, payload?.content?.url
  ];
  return candidates.find(value => typeof value === 'string' && value.trim()) || '';
}

function findPortalFileId(payload) {
  const candidates = [
    payload?.file_id, payload?.items?.[0]?.file_id, payload?.data?.file_id,
    payload?.data?.items?.[0]?.file_id
  ];
  return candidates.find(value => (typeof value === 'string' && value.trim()) || Number.isFinite(value)) || '';
}

function findPortalDownloadUri(payload) {
  const candidates = [
    payload?.data?.value?.data?.download_uri,
    payload?.data?.data?.download_uri,
    payload?.data?.download_uri,
    payload?.download_uri
  ];
  return candidates.find(value => typeof value === 'string' && value.trim()) || '';
}

async function fetchCompanyPortalVideoFile(fileId, apiKey) {
  const endpoint = `${COMPANY_VIDEO_API_BASE_URL}/files/${encodeURIComponent(fileId)}/download-uri`;
  const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${apiKey}` } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`公司 Seedance 下载地址查询失败：${response.status}`);
  const downloadUri = findPortalDownloadUri(payload);
  if (!downloadUri) throw new Error('公司 Seedance 门户没有返回可下载地址');
  const videoResponse = await fetch(downloadUri);
  if (!videoResponse.ok) throw new Error(`公司 Seedance 视频下载失败：${videoResponse.status}`);
  return Buffer.from(await videoResponse.arrayBuffer());
}

function findVideoBytes(payload) {
  const encoded = [payload?.video?.b64_json, payload?.b64_json, payload?.data?.[0]?.b64_json,
    payload?.data?.video?.b64_json, payload?.output?.b64_json, payload?.result?.b64_json].find(value => typeof value === 'string' && value.length);
  return encoded ? Buffer.from(encoded, 'base64') : null;
}

function findTaskId(payload) {
  const candidates = [payload?.portal_video_id, payload?.id, payload?.task_id, payload?.taskId,
    payload?.portalVideoId, payload?.video_id, payload?.data?.portal_video_id, payload?.data?.portalVideoId, payload?.data?.id, payload?.data?.task_id,
    payload?.items?.[0]?.portal_video_id, payload?.items?.[0]?.id,
    payload?.data?.items?.[0]?.portal_video_id, payload?.data?.items?.[0]?.id,
    payload?.data?.taskId, payload?.data?.task?.id, payload?.task?.id,
    payload?.result?.portal_video_id, payload?.result?.portalVideoId, payload?.result?.video_id, payload?.result?.id];
  const value = candidates.find(item => (typeof item === 'string' && item.trim()) || Number.isFinite(item));
  return value === undefined ? '' : String(value);
}

function videoState(payload) {
  const item = payload?.items?.[0] || (Array.isArray(payload?.data) ? payload.data[0] : payload?.data);
  if (payload?.completed === true || payload?.is_completed === true || item?.completed === true || item?.is_completed === true) return 'completed';
  const value = String(payload?.status || payload?.state || payload?.task_status || payload?.video_status || item?.status || item?.state || item?.task_status || '').toLowerCase();
  if (/(^|[_ -])(fail|failed|failure|error|cancel|cancelled|canceled|reject|rejected|expire|expired)([_ -]|$)/.test(value)) return 'failed';
  if (/(^|[_ -])(success|succeeded|complete|completed|done|finished|ready)([_ -]|$)/.test(value)) return 'completed';
  return value ? 'pending' : (findVideoUrl(payload) || findVideoBytes(payload) ? 'completed' : 'pending');
}

async function fetchCompanyVideoResult(payload, apiKey = sharedApiKey()) {
  const directBytes = findVideoBytes(payload);
  if (directBytes?.length) return directBytes;
  const portalFileId = findPortalFileId(payload);
  if (portalFileId) {
    try {
      const portalBytes = await fetchCompanyPortalVideoFile(portalFileId, apiKey);
      if (portalBytes.length) return portalBytes;
    } catch (error) {
      if (!findVideoUrl(payload)) throw error;
      console.warn(`[公司 Seedance] Portal 下载地址不可用，改用视频预览地址：${error.message}`);
    }
  }
  const directUrl = findVideoUrl(payload);
  if (directUrl) {
    const response = await fetch(directUrl);
    if (!response.ok) throw new Error(`公司 Seedance 视频下载失败：${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  }
  const taskId = findTaskId(payload);
  if (!taskId) throw new Error('公司 Seedance 未返回任务 ID 或视频地址');
  const statusUrl = COMPANY_VIDEO_STATUS_URL
    ? COMPANY_VIDEO_STATUS_URL.replace(/\{id\}|\{task_id\}/g, encodeURIComponent(taskId))
    : `${COMPANY_VIDEO_API_BASE_URL}${COMPANY_VIDEO_TASK_PATH}?portal_video_id=${encodeURIComponent(taskId)}`;
  const deadline = Date.now() + 20 * 60 * 1000;
  let lastPayload = payload;
  while (Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, VIDEO_POLL_INTERVAL_MS));
    const response = await fetch(statusUrl, { headers: { Authorization: `Bearer ${apiKey}` } });
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (response.ok && contentType.includes('video/mp4')) return Buffer.from(await response.arrayBuffer());
    lastPayload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(companyImagePermissionMessage(lastPayload, response) || `公司 Seedance 查询失败：${response.status}`);
    const state = videoState(lastPayload);
    if (state === 'failed') {
      const item = lastPayload?.items?.[0] || lastPayload?.data?.[0] || lastPayload?.data;
      throw new Error(lastPayload?.error?.message || item?.error_message || item?.failure_reason || lastPayload?.message || '公司 Seedance 视频生成失败');
    }
    if (state === 'completed') {
      const bytes = findVideoBytes(lastPayload);
      if (bytes?.length) return bytes;
      const completedFileId = findPortalFileId(lastPayload);
      if (completedFileId) {
        try {
          const portalBytes = await fetchCompanyPortalVideoFile(completedFileId, apiKey);
          if (portalBytes.length) return portalBytes;
        } catch (error) {
          if (!findVideoUrl(lastPayload)) throw error;
          console.warn(`[公司 Seedance] Portal 下载地址不可用，改用视频预览地址：${error.message}`);
        }
      }
      const completedVideoUrl = findVideoUrl(lastPayload);
      if (completedVideoUrl) {
        const videoResponse = await fetch(completedVideoUrl);
        if (!videoResponse.ok) throw new Error(`公司 Seedance 视频下载失败：${videoResponse.status}`);
        return Buffer.from(await videoResponse.arrayBuffer());
      }
      // The public Turing video API exposes a dedicated authenticated content
      // route. Portal status responses may omit a signed video URL.
      const contentUrl = `${COMPANY_VIDEO_API_BASE_URL}/videos/${encodeURIComponent(taskId)}/content`;
      const contentResponse = await fetch(contentUrl, { headers: { Authorization: `Bearer ${apiKey}` } });
      if (!contentResponse.ok) {
        const detail = (await contentResponse.text().catch(() => '')).slice(0, 240);
        throw new Error(detail || `公司 Seedance 视频下载失败：${contentResponse.status}`);
      }
      const contentBytes = Buffer.from(await contentResponse.arrayBuffer());
      if (contentBytes.length) return contentBytes;
      throw new Error('公司 Seedance 任务已完成，但没有返回视频文件');
    }
  }
  throw new Error(`公司 Seedance 视频生成超时（任务 ${findTaskId(lastPayload) || '未知'}）`);
}

async function generateWithCompanyVideo(parts) {
  const apiKey = sharedApiKey();
  if (!apiKey) {
    const error = new Error('公司模型服务未配置 API Key。请点击页面右上角「配置 API」输入公司 API Key。');
    error.status = 503; error.code = 'MODEL_NOT_CONFIGURED'; throw error;
  }
  const prompt = textPart(parts, 'prompt') || textPart(parts, 'brief');
  if (!prompt) throw Object.assign(new Error('请先填写视频文案或提示词'), { status: 400 });
  const duration = Number(textPart(parts, 'duration')) || 15;
  const ratio = textPart(parts, 'ratio') || '9:16';
  const resolution = '720p';
  // This authenticated Portal endpoint uses its own body contract, distinct
  // from the public /videos route. These dimensions match the Portal composer.
  const portalVideoSizes = {
    '480p': { '16:9': '864x496', '4:3': '752x560', '1:1': '640x640', '3:4': '560x752', '9:16': '496x864', '21:9': '992x432' },
    '720p': { '16:9': '1280x720', '4:3': '1112x834', '1:1': '960x960', '3:4': '834x1112', '9:16': '720x1280', '21:9': '1470x630' },
    '1080p': { '16:9': '1920x1080', '4:3': '1664x1248', '1:1': '1440x1440', '3:4': '1248x1664', '9:16': '1080x1920', '21:9': '2206x946' }
  };
  const size = portalVideoSizes[resolution]?.[ratio];
  if (!size) throw Object.assign(new Error(`Seedance 门户接口不支持 ${resolution} / ${ratio} 画幅`), { status: 400 });
  const requestBody = {
    model: COMPANY_VIDEO_MODEL,
    size,
    seconds: String(duration),
    resolution,
    ratio,
    message: [{ type: 'text', text: prompt }],
    // Voiceover is generated separately through the Turing OpenAI-compatible
    // audio endpoint. Keep Seedance focused on the visual source video.
    generate_audio: false,
    seed: 42
  };
  const endpoint = `${COMPANY_VIDEO_API_BASE_URL}${COMPANY_VIDEO_TASK_PATH}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(companyImagePermissionMessage(payload, response) || payload?.error?.message || payload?.message || `公司 Seedance 接口返回 ${response.status}`);
    error.status = response.status; error.traceId = payload?.trace_id || response.headers.get('x-turing-trace-id') || '';
    throw error;
  }
  const imageBytes = await fetchCompanyVideoResult(payload, apiKey);
  if (!imageBytes?.length) throw new Error('公司 Seedance 没有返回视频数据');
  return { videoBytes: imageBytes, model: COMPANY_VIDEO_MODEL };
}

async function generateVideo(req, res) {
  const body = await readRequestBody(req);
  const parts = parseMultipart(body, req.headers['content-type']);
  try {
    const result = await generateWithCompanyVideo(parts);
    res.writeHead(200, {
      'Content-Type': 'video/mp4', 'Content-Length': result.videoBytes.length,
      'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*',
      'X-Hotel-Model': result.model, 'X-Hotel-Provider': 'company-gateway'
    });
    res.end(result.videoBytes);
  } catch (error) {
    const status = error.status || (error.code === 'MODEL_NOT_CONFIGURED' ? 503 : 502);
    const message = status === 401 ? '公司模型 API Key 无效或已过期。' : status === 403
      ? (error.message || '当前公司账号或 Seedance 模型没有视频生成权限。')
      : error.message || '公司 Seedance 视频服务异常';
    console.error(`[公司 Seedance] 请求失败 HTTP ${status}${error.traceId ? ` · trace ${error.traceId}` : ''}：${message}`);
    json(res, status, { error: message, code: error.code || (status === 503 ? 'MODEL_NOT_CONFIGURED' : ''), traceId: error.traceId || '' });
  }
}

// The Turing docs list the full OpenAI voice set, but some deployed gateways
// currently validate only this six-voice subset. Keep the UI aliases while
// sending a voice that the stricter gateway accepts.
const TTS_VOICE_ALIASES = Object.freeze({
  alloy: 'alloy',
  echo: 'echo',
  fable: 'fable',
  onyx: 'onyx',
  nova: 'nova',
  shimmer: 'shimmer',
  ash: 'onyx',
  ballad: 'fable',
  coral: 'shimmer',
  sage: 'echo',
  verse: 'alloy'
});
const TTS_VOICES = new Set(Object.keys(TTS_VOICE_ALIASES));

function ttsModelCandidates(model) {
  const value = String(model || '').trim();
  const candidates = [value];
  // A few OpenAI-compatible gateways expose the same model as `tts-1` while
  // the Turing catalog names it `turing/tts-1`.
  if (/^turing\/tts-1$/i.test(value)) candidates.push('tts-1');
  return [...new Set(candidates.filter(Boolean))];
}

function ttsErrorText(payload) {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  return String(payload?.error?.message || payload?.message || payload?.error || '');
}

function shouldRetryTtsRequest(status, payload) {
  if ([401, 429].includes(status)) return false;
  return /model|voice|unsupported|not supported|invalid/i.test(ttsErrorText(payload));
}

async function generateAudio(req, res) {
  let input;
  try {
    const raw = await readRequestBody(req);
    input = JSON.parse(raw.toString('utf8') || '{}');
  } catch (error) {
    json(res, 400, { error: error.message || '配音请求不是有效的 JSON' });
    return;
  }

  const apiKey = sharedApiKey();
  if (!apiKey) {
    json(res, 503, { error: '公司音频模型服务未配置 API Key。请点击页面右上角「配置 API」输入公司 API Key。', code: 'MODEL_NOT_CONFIGURED' });
    return;
  }

  const text = String(input.input || '').trim().slice(0, 4096);
  const requestedVoice = String(input.voice || 'verse').trim().toLowerCase();
  const voice = TTS_VOICE_ALIASES[requestedVoice] || '';
  const model = cleanConfigText(input.model, COMPANY_AUDIO_MODEL, 120);
  const responseFormat = ['mp3', 'wav', 'flac', 'opus', 'pcm', 'aac'].includes(String(input.response_format || '').toLowerCase())
    ? String(input.response_format).toLowerCase()
    : 'mp3';
  const speed = Number(input.speed);
  if (!text) {
    json(res, 400, { error: '配音文案为空。' });
    return;
  }
  if (!TTS_VOICES.has(requestedVoice)) {
    json(res, 400, { error: `不支持的音色：${requestedVoice}。请从 Turing 音频模型支持的 OpenAI 音色中选择。` });
    return;
  }
  if (Number.isFinite(speed) && (speed < 0.25 || speed > 4)) {
    json(res, 400, { error: '语速必须在 0.25 到 4.0 之间。' });
    return;
  }

  const modelCandidates = ttsModelCandidates(model);
  const requestVariants = [
    ...modelCandidates.map((candidate) => ({ model: candidate, voice })),
    // Some gateway revisions supply the default TTS model server-side. This
    // final variant avoids passing a model string through a buggy voice parser.
    { voice }
  ];
  let response = null;
  let contentType = '';
  let successfulModel = model;
  let lastFailure = null;
  for (const [index, variant] of requestVariants.entries()) {
    const requestBody = { ...variant, input: text, response_format: responseFormat };
    if (Number.isFinite(speed)) requestBody.speed = speed;
    try {
      response = await fetch(`${COMPANY_VIDEO_API_BASE_URL}/audio/speech`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(120000)
      });
    } catch (error) {
      const status = error?.name === 'TimeoutError' || error?.name === 'AbortError' ? 504 : 502;
      json(res, status, { error: status === 504 ? '公司音频模型响应超时，请稍后重试。' : '无法连接公司音频模型接口。' });
      return;
    }
    contentType = (response.headers.get('content-type') || '').split(';')[0].toLowerCase();
    if (response.ok) {
      successfulModel = variant.model || model;
      break;
    }
    const payload = contentType.includes('json') ? await response.json().catch(() => ({})) : {};
    const traceId = payload?.trace_id || payload?.request_id || response.headers.get('x-turing-trace-id') || response.headers.get('x-request-id') || '';
    lastFailure = { status: response.status, payload, traceId };
    if (index >= requestVariants.length - 1 || !shouldRetryTtsRequest(response.status, payload)) break;
    console.warn(`[公司音频模型] 请求格式被网关拒绝，尝试兼容格式（${index + 1}/${requestVariants.length}）：${ttsErrorText(payload)}`);
  }
  if (!response?.ok) {
    const { status, payload, traceId } = lastFailure || { status: 502, payload: {}, traceId: '' };
    const message = status === 401
      ? '公司音频模型 API Key 无效或已过期。'
      : status === 403
        ? `当前 API Key 或网关权限未开通音频模型 ${model}。`
        : ttsErrorText(payload) || `公司音频模型接口返回 ${status}`;
    json(res, status, { error: message, traceId });
    return;
  }

  const audioBytes = Buffer.from(await response.arrayBuffer());
  if (audioBytes.length < 1024) {
    json(res, 502, { error: '公司音频模型没有返回有效音频。' });
    return;
  }
  const audioMime = {
    mp3: 'audio/mpeg', wav: 'audio/wav', flac: 'audio/flac', opus: 'audio/ogg', pcm: 'audio/pcm', aac: 'audio/aac'
  }[responseFormat] || contentType || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': audioMime,
    'Content-Length': audioBytes.length,
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'X-Hotel-Audio-Model': successfulModel,
    'X-Hotel-Audio-Voice': voice
  });
  res.end(audioBytes);
}

function extractJsonObject(value) {
  const text = Array.isArray(value)
    ? value.map(item => item?.text || '').join('')
    : String(value || '');
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1] || text;
  const first = fenced.indexOf('{');
  const last = fenced.lastIndexOf('}');
  if (first < 0 || last <= first) throw new Error('剪辑模型没有返回有效的 EDL JSON');
  return JSON.parse(fenced.slice(first, last + 1));
}

function modelContentText(payload) {
  const content = payload?.choices?.[0]?.message?.content ?? payload?.output_text ?? payload?.output ?? '';
  if (Array.isArray(content)) return content.map(item => typeof item === 'string' ? item : item?.text || '').join('');
  return String(content || '');
}

function copyCharCount(value) {
  return Array.from(String(value || '').replace(/\s+/g, '')).length;
}

function copyEnrichmentClauses({ highlights = [], audience = '', offer = '', scenes = [] }) {
  const facts = [...highlights, ...scenes].map(item => String(item || '').trim()).filter(Boolean).join('、');
  const clauses = [];
  if (/泳池|水上/.test(facts)) clauses.push('白天可以在泳池放松，晚上回到客房好好休息，旅途节奏也会更轻松。');
  if (/客房|房间|套房/.test(facts)) clauses.push('客房适合住下来慢慢休息，把旅途中的疲惫一点点放下来。');
  if (/地理位置|位置|交通|出行|周边|市中心|附近|临近/.test(facts)) clauses.push('酒店位置方便，前往周边时更省心。');
  if (audience) clauses.push(String(audience) + '入住时，可以把活动和休息安排得更从容。');
  if (offer) clauses.push(String(offer) + '，有出行计划的话可以提前留意。');
  clauses.push('不必把行程排得太满，留一点时间给自己，才能真正放松下来。');
  clauses.push('选一个舒服的地方住下，让这次出发多一些从容。');
  return clauses;
}

function lengthenCopy(value, context) {
  let result = cleanGeneratedCopy(value);
  if (!result) return '';
  for (const clause of copyEnrichmentClauses(context)) {
    if (copyCharCount(result) >= 130) break;
    if (result.includes(clause.slice(0, 8))) continue;
    const candidate = result.replace(/[。！？!?]+$/, '') + '。' + clause;
    if (copyCharCount(candidate) <= 190) result = candidate;
  }
  return result;
}

function extractJsonValue(value) {
  const text = String(value || '').trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1]?.trim() || text;
  try { return JSON.parse(fenced); } catch { /* try the first JSON object/array below */ }
  const objectStart = fenced.indexOf('{');
  const arrayStart = fenced.indexOf('[');
  const starts = [objectStart, arrayStart].filter(index => index >= 0);
  if (!starts.length) throw new Error('文本模型没有返回有效的 JSON');
  const start = Math.min(...starts);
  const end = Math.max(fenced.lastIndexOf('}'), fenced.lastIndexOf(']'));
  if (end <= start) throw new Error('文本模型没有返回完整的 JSON');
  return JSON.parse(fenced.slice(start, end + 1));
}

function cleanGeneratedCopy(value) {
  const text = String(value || '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\s*(?:文案|版本|方案)\s*[：:]\s*/i, '')
    .replace(/^["“”「」]+|["“”「」]+$/g, '')
    .trim();
  if (text.length < 18 || text.length > 400) return '';
  if (/[`*_#<>]/.test(text)) return '';
  if (/根据你的需求|你补充的|你提供的|用户提供的|作为AI|以下是|文案如下|位置去哪都方便|有地理位置[^。！？]{0,30}[、，]|这里有[^。！？]{0,50}从入住到离店|无论是[^，。！？]{1,24}[，,]\s*(?:都|也)|安排进这次(?:入住|体验)|安排一场轻松的入住/.test(text)) return '';
  return /[。！？!?]$/.test(text) ? text : `${text}。`;
}

async function generateCopy(req, res) {
  let payload;
  try {
    const raw = await readRequestBody(req);
    payload = JSON.parse(raw.toString('utf8') || '{}');
  } catch (error) {
    json(res, 400, { error: error.message || '文案请求不是有效的 JSON' });
    return;
  }

  const textConfig = textModelSettings();
  const apiKey = textConfig.apiKey;
  if (!apiKey) {
    json(res, 503, { error: '文本模型未配置 API Key，请先在「配置 API」中保存可用的公司或豆包 Key。', code: 'TEXT_MODEL_NOT_CONFIGURED' });
    return;
  }
  const topic = String(payload.topic || '').trim().slice(0, 120);
  const highlights = Array.isArray(payload.highlights)
    ? payload.highlights.map(item => String(item || '').trim()).filter(Boolean).slice(0, 12)
    : [];
  const audience = String(payload.audience || '').trim().slice(0, 80);
  const offer = String(payload.offer || '').trim().slice(0, 120);
  const scenes = Array.isArray(payload.sceneLabels)
    ? payload.sceneLabels.map(item => String(item || '').trim()).filter(Boolean).slice(0, 8)
    : [];
  if (!topic || !highlights.length) {
    json(res, 400, { error: '请先填写酒店主题和至少一个亮点。' });
    return;
  }

  const prompt = [
    '你是中文酒店短视频口播文案编辑，负责把用户提供的碎片整理成自然、准确、能直接配音的成稿。',
    '请严格只返回 JSON：{"variants":["文案1","文案2","文案3","文案4","文案5"]}，不要 Markdown、编号、引号或解释。',
    '生成 5 条不同写法；每条控制在 130 至 170 个中文字符，目标约 150 字，分成 4 至 6 句。围绕已有亮点展开完整的入住体验和适用人群，不要用重复套话凑字数。',
    '必须把亮点自然放进句子里，不要把形容词、设施和时间线硬拼在一起。禁止写出类似“这里有地理位置优越、泳池和客房，从入住到离店……”“你补充的地理位置优越，也被安排进这次体验”或“位置去哪都方便”的病句；涉及位置时请说“出行方便”或“去周边很方便”。',
    '可以调整语序、补充必要的连接词和标点，但不得新增用户没有提供的酒店设施、距离、价格、优惠、交通、服务承诺、品牌或事实。',
    '主题如果是酒店名或地点要原样保留；受众和优惠为空时不要自行补写。语气自然、克制、有画面感，不要浮夸，不要重复同一个句式。',
    JSON.stringify({ topic, highlights, audience, offer, sceneLabels: scenes })
  ].join('\n');

  let response;
  try {
    response = await fetch(`${textConfig.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: textConfig.model,
        temperature: 0.45,
        max_tokens: 1800,
        thinking: textConfig.provider === 'doubao' ? { type: 'disabled' } : undefined,
        messages: [
          { role: 'system', content: '你只输出经过中文病句检查的酒店短视频文案 JSON。' },
          { role: 'user', content: prompt }
        ]
      }),
      signal: AbortSignal.timeout(60000)
    });
  } catch (error) {
    json(res, 502, { error: error?.name === 'TimeoutError' ? '文本模型响应超时，请稍后重试。' : '无法连接文本模型。', code: 'TEXT_MODEL_UNAVAILABLE' });
    return;
  }

  const upstream = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = upstream?.error?.message || upstream?.message || upstream?.error || `文本模型接口返回 ${response.status}`;
    json(res, response.status, { error: message, code: response.status === 403 ? 'TEXT_MODEL_FORBIDDEN' : 'TEXT_MODEL_FAILED' });
    return;
  }
  let draftVariants;
  try {
    const parsed = extractJsonValue(modelContentText(upstream));
    const rawVariants = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.variants) ? parsed.variants : [];
    draftVariants = [...new Set(rawVariants.map(cleanGeneratedCopy).filter(Boolean))].slice(0, 5);
    if (draftVariants.length < 3) throw new Error('文本模型返回的合格文案少于 3 条，请重试。');
  } catch (error) {
    json(res, 502, { error: error.message || '文本模型返回内容无法解析，请重试。', code: 'INVALID_COPY_RESULT' });
    return;
  }

  const proofreadPrompt = [
    '你是最后一道中文校对编辑。请把待校对的酒店短视频文案逐条改成自然、准确、能直接配音的中文成稿。',
    '严格只返回 JSON：{"variants":["文案1","文案2","文案3","文案4","文案5"]}，不要 Markdown、编号、引号或解释。',
    '每条最终控制在 120 至 190 个中文字符，目标约 150 字，分成 4 至 6 句；如果初稿太短，请围绕输入中已有的亮点补足体验、节奏和受众表达，但不要重复同一句话。',
    '保留原文的真实信息和营销重点，但可以彻底重写病句。不得出现“你补充的”“你提供的”“用户提供的”“根据你的需求”等模型口吻。',
    '不得把形容词和设施硬拼成名词列表；“地理位置优越”要改成完整表达，例如“出行方便”或“去周边很方便”。',
    '不要写“无论是亲子家庭，都……”这类残缺比较句；直接写“适合亲子家庭”或补齐“无论是……还是……”。',
    '不要写“把……安排进这次入住/体验”“安排一场轻松的入住”等不自然表达。不要新增输入中没有的设施、距离、价格、优惠、交通、服务承诺或品牌事实。',
    '输入事实：',
    JSON.stringify({ topic, highlights, audience, offer, sceneLabels: scenes }),
    '待校对文案：',
    JSON.stringify({ variants: draftVariants })
  ].join('\n');

  let proofreadResponse;
  try {
    proofreadResponse = await fetch(`${textConfig.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: textConfig.model,
        temperature: 0.15,
        max_tokens: 2200,
        thinking: textConfig.provider === 'doubao' ? { type: 'disabled' } : undefined,
        messages: [
          { role: 'system', content: '你只输出经过人工级中文病句校对的酒店短视频文案 JSON。' },
          { role: 'user', content: proofreadPrompt }
        ]
      }),
      signal: AbortSignal.timeout(60000)
    });
  } catch (error) {
    json(res, 502, { error: error?.name === 'TimeoutError' ? '文本模型校对超时，请稍后重试。' : '无法连接文本模型进行校对。', code: 'TEXT_MODEL_UNAVAILABLE' });
    return;
  }

  const proofreadUpstream = await proofreadResponse.json().catch(() => ({}));
  if (!proofreadResponse.ok) {
    const message = proofreadUpstream?.error?.message || proofreadUpstream?.message || proofreadUpstream?.error || `文本模型校对接口返回 ${proofreadResponse.status}`;
    json(res, proofreadResponse.status, { error: message, code: proofreadResponse.status === 403 ? 'TEXT_MODEL_FORBIDDEN' : 'TEXT_MODEL_FAILED' });
    return;
  }
  let proofreadCandidates;
  try {
    const parsed = extractJsonValue(modelContentText(proofreadUpstream));
    const rawVariants = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.variants) ? parsed.variants : [];
    proofreadCandidates = [...new Set(rawVariants.map(cleanGeneratedCopy).filter(Boolean))].slice(0, 5);
  } catch (error) {
    json(res, 502, { error: error.message || '文本模型校对结果无法解析，请重试。', code: 'INVALID_COPY_RESULT' });
    return;
  }

  let variants = proofreadCandidates
    .map(item => lengthenCopy(item, { highlights, audience, offer, scenes }))
    .filter(item => copyCharCount(item) >= 120 && copyCharCount(item) <= 190)
    .slice(0, 5);
  if (variants.length < 3) {
    const expandPrompt = [
      '请把下面的酒店短视频文案扩写并润色成最终成稿。',
      '这次最重要的是长度：必须逐条控制在 130 至 170 个中文字符，目标约 150 字，不能只返回四十几个字的短句。每条分成 4 至 6 句，信息要完整、自然、适合配音。',
      '只能围绕输入事实中的主题、亮点、受众和优惠展开；可以补充体验顺序、场景连接和受众感受，但不得新增设施、距离、价格、交通或服务承诺。',
      '禁止出现“你补充的”“你提供的”“用户提供的”“根据你的需求”“无论是亲子家庭，都……”以及“安排进这次入住/体验”等病句。',
      '严格只返回 JSON：{"variants":["文案1","文案2","文案3","文案4","文案5"]}，不要 Markdown、编号、引号或解释。',
      '输入事实：',
      JSON.stringify({ topic, highlights, audience, offer, sceneLabels: scenes }),
      '待扩写文案：',
      JSON.stringify({ variants: proofreadCandidates.length ? proofreadCandidates : draftVariants })
    ].join('\n');
    let expandResponse;
    try {
      expandResponse = await fetch(`${textConfig.apiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: textConfig.model,
          temperature: 0.2,
          max_tokens: 2400,
          thinking: textConfig.provider === 'doubao' ? { type: 'disabled' } : undefined,
          messages: [
            { role: 'system', content: '你只输出达到指定字数并经过中文病句校对的酒店短视频文案 JSON。' },
            { role: 'user', content: expandPrompt }
          ]
        }),
        signal: AbortSignal.timeout(60000)
      });
    } catch (error) {
      json(res, 502, { error: error?.name === 'TimeoutError' ? '文本模型扩写超时，请稍后重试。' : '无法连接文本模型进行扩写。', code: 'TEXT_MODEL_UNAVAILABLE' });
      return;
    }
    const expandUpstream = await expandResponse.json().catch(() => ({}));
    if (!expandResponse.ok) {
      const message = expandUpstream?.error?.message || expandUpstream?.message || expandUpstream?.error || `文本模型扩写接口返回 ${expandResponse.status}`;
      json(res, expandResponse.status, { error: message, code: expandResponse.status === 403 ? 'TEXT_MODEL_FORBIDDEN' : 'TEXT_MODEL_FAILED' });
      return;
    }
    try {
      const parsed = extractJsonValue(modelContentText(expandUpstream));
      const rawVariants = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.variants) ? parsed.variants : [];
      variants = [...new Set(rawVariants
        .map(item => lengthenCopy(item, { highlights, audience, offer, scenes }))
        .filter(item => item && copyCharCount(item) >= 120 && copyCharCount(item) <= 190))].slice(0, 5);
    } catch (error) {
      json(res, 502, { error: error.message || '文本模型扩写结果无法解析，请重试。', code: 'INVALID_COPY_RESULT' });
      return;
    }
  }
  if (variants.length < 3) {
    json(res, 502, { error: '文本模型生成的文案仍未达到约 150 字，请重新生成。', code: 'COPY_LENGTH_NOT_MET' });
    return;
  }
  while (variants.length < 5) variants.push(variants[variants.length % Math.max(1, variants.length)]);
  json(res, 200, { variants, source: textConfig.provider === 'doubao' ? 'doubao-text-proofread' : 'turing-text-proofread', model: textConfig.model });
}

async function analyzeAssetTags(req, res) {
  let payload;
  try {
    const raw = await readRequestBody(req);
    payload = JSON.parse(raw.toString('utf8') || '{}');
  } catch (error) {
    json(res, 400, { error: error.message || '自动标签请求不是有效的 JSON' });
    return;
  }

  const apiKey = sharedApiKey();
  const model = cleanConfigText(payload.model, COMPANY_EDIT_MODEL, 120);
  const assets = Array.isArray(payload.assets) ? payload.assets.slice(0, 30) : [];
  if (!assets.length) {
    json(res, 200, { results: [], source: 'llm', model });
    return;
  }
  if (!apiKey) {
    json(res, 503, { error: '自动标签需要配置视觉模型 API Key。', code: 'MODEL_NOT_CONFIGURED' });
    return;
  }
  if (!model) {
    json(res, 503, { error: '自动标签需要配置支持图片输入的视觉模型 ID。', code: 'VISION_MODEL_NOT_CONFIGURED' });
    return;
  }

  const sceneGuide = [
    'room = 客房：床、卧室、套房、客房内部',
    'pool = 泳池：游泳池、水上设施、泳池休闲区',
    'dining = 餐饮：餐厅、早餐、菜品、下午茶、咖啡',
    'lobby = 大堂：前台、门厅、接待区、酒店公共大厅',
    'exterior = 周边：酒店外观、城市、景点、交通和周边环境',
    'other = 其他：无法归入以上类别或画面内容不明确'
  ].join('\n');
  const assetSummary = assets.map((asset, index) => ({
    id: Number.isFinite(Number(asset.id)) ? Number(asset.id) : index,
    name: String(asset.name || `素材 ${index + 1}`).slice(0, 120),
    type: asset.type === 'video' ? 'video' : 'image',
    width: Number(asset.width || 0),
    height: Number(asset.height || 0),
    duration: Number(asset.duration || 0)
  }));
  const instruction = [
    '你是酒店素材管理助手。请逐一查看后续提供的素材缩略图，为每个素材推荐一个最合适的镜头标签。',
    '只能从 room、pool、dining、lobby、exterior、other 中选择一个 sceneType。不要根据文件名臆测设施；如果画面不清楚，选择 other 并降低 confidence。',
    'confidence 是 0 到 1 的数字。rationale 用简短中文说明画面依据，不要超过 40 字。',
    '必须为每个素材返回一个结果，id 要与输入素材一致。只返回 JSON，不要 Markdown，不要解释。',
    `标签定义：\n${sceneGuide}`,
    JSON.stringify({ assets: assetSummary })
  ].join('\n');

  const content = [{ type: 'text', text: instruction }];
  assets.forEach(asset => {
    const thumbnails = Array.isArray(asset.thumbnails) && asset.thumbnails.length
      ? asset.thumbnails
      : [asset.thumbnail];
    content.push({ type: 'text', text: `下面是素材 ${asset.id} 的缩略图；如果有多张，按视频时间顺序排列。` });
    thumbnails.forEach(thumbnail => {
      if (typeof thumbnail === 'string' && thumbnail.startsWith('data:image/')) {
        content.push({ type: 'image_url', image_url: { url: thumbnail, detail: 'low' } });
      }
    });
  });

  let response;
  try {
    response = await fetch(`${COMPANY_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          { role: 'system', content: '你只负责输出严格的酒店素材标签 JSON。' },
          { role: 'user', content }
        ]
      }),
      signal: AbortSignal.timeout(120000)
    });
  } catch (error) {
    json(res, 502, { error: error?.name === 'TimeoutError' ? '自动标签模型响应超时。' : '无法连接自动标签模型。' });
    return;
  }

  const upstream = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = upstream?.error?.message || upstream?.message || upstream?.error || `自动标签模型接口返回 ${response.status}`;
    json(res, response.status, { error: message, code: response.status === 403 ? 'VISION_MODEL_FORBIDDEN' : '' });
    return;
  }

  try {
    const parsed = extractJsonObject(upstream?.choices?.[0]?.message?.content || upstream?.output_text || upstream?.output);
    // Some OpenAI-compatible models mirror the input key and return
    // { assets: [...] } even when the prompt asks for { results: [...] }.
    // Accept both shapes so the UI is not dependent on one provider's JSON
    // formatting preference.
    const rawResults = Array.isArray(parsed?.results)
      ? parsed.results
      : Array.isArray(parsed?.assets)
        ? parsed.assets
        : [];
    const allowed = new Set(['room', 'pool', 'dining', 'lobby', 'exterior', 'other']);
    const aliases = {
      '客房': 'room', '泳池': 'pool', '餐饮': 'dining', '大堂': 'lobby', '周边': 'exterior', '其他': 'other'
    };
    const normalizeType = value => {
      const raw = String(value || '').trim().toLowerCase();
      const normalized = aliases[String(value || '').trim()] || raw;
      return allowed.has(normalized) ? normalized : 'other';
    };
    const results = assets.map((asset, index) => {
      const id = Number.isFinite(Number(asset.id)) ? Number(asset.id) : index;
      const item = rawResults.find(candidate => Number(candidate?.id) === id) || rawResults[index] || {};
      const confidenceValue = Number(item.confidence);
      const confidence = Number.isFinite(confidenceValue) ? Math.max(0, Math.min(1, confidenceValue)) : 0.25;
      return {
        id,
        sceneType: normalizeType(item.sceneType || item.sceneTag || item.tag || item.label),
        confidence,
        tagSource: confidence >= 0.72 ? 'ai' : 'review',
        rationale: String(item.rationale || '模型未提供明确的画面依据').slice(0, 80)
      };
    });
    json(res, 200, { results, source: 'llm', model });
  } catch (error) {
    json(res, 502, { error: error.message || '自动标签模型返回内容无法解析。', code: 'INVALID_TAG_RESULT' });
  }
}

async function analyzeSmartEdit(req, res) {
  let payload;
  try {
    const raw = await readRequestBody(req);
    payload = JSON.parse(raw.toString('utf8') || '{}');
  } catch (error) {
    json(res, 400, { error: error.message || '智能剪辑请求不是有效的 JSON' });
    return;
  }

  const apiKey = sharedApiKey();
  const model = cleanConfigText(payload.model, COMPANY_EDIT_MODEL, 120);
  if (!apiKey) {
    json(res, 503, { error: '智能剪辑模型未配置 API Key。', code: 'MODEL_NOT_CONFIGURED' });
    return;
  }
  if (!model) {
    json(res, 503, { error: '智能剪辑模型未配置。请在 API 配置中填写支持图片输入的模型 ID。', code: 'EDIT_MODEL_NOT_CONFIGURED' });
    return;
  }

  const assets = Array.isArray(payload.assets) ? payload.assets.slice(0, 30) : [];
  const narration = Array.isArray(payload.narration) ? payload.narration.slice(0, 12) : [];
  const assetSummary = assets.map(asset => ({
    id: asset.id,
    name: asset.name,
    type: asset.type,
    sceneTag: asset.sceneTag || '',
    width: asset.width || 0,
    height: asset.height || 0,
    duration: asset.duration || 0
  }));
  const instruction = [
    '你是酒店短视频剪辑师。请根据旁白时间轴和素材缩略图，生成严格 JSON 格式的自动剪辑 EDL。',
    '每个旁白段必须匹配一个最合适的素材；优先使用画面语义匹配，其次考虑画面质量、构图和镜头变化。必须返回与 narration 数量完全相同的 ranges，并按 narration 顺序排列。',
    '不要虚构素材中不存在的设施、价格、权益或品牌。不要生成新的素材。',
    '每个 range 必须包含 narrationIndex、assetIndex、sourceStart、sourceEnd、voiceStart、voiceEnd、text、headline、beat、reason；narrationIndex 必须指向对应的旁白段。text 必须逐字复制对应 narration[index].text，禁止写入画面分析、剪辑理由或新的句子。headline 只能从该 text 中拆出 lead、keyword、tail，不能新增文案。sourceStart/sourceEnd 是素材源时间，voiceStart/voiceEnd 是成片时间，图片素材从 0 开始。',
    '输出总时长应覆盖旁白，允许在段落之间保留 0.1 到 0.3 秒的视觉呼吸，但不要让画面早于旁白或晚于旁白超过 0.5 秒。',
    '只返回 JSON，不要 Markdown，不要解释。',
    JSON.stringify({
      ratio: payload.ratio || '9:16',
      targetDuration: payload.targetDuration || 15,
      copy: payload.copy || '',
      narration,
      assets: assetSummary
    })
  ].join('\n');

  const content = [{ type: 'text', text: instruction }];
  assets.forEach(asset => {
    if (typeof asset.thumbnail === 'string' && asset.thumbnail.startsWith('data:image/')) {
      content.push({ type: 'image_url', image_url: { url: asset.thumbnail, detail: 'low' } });
    }
  });

  let response;
  try {
    response = await fetch(`${COMPANY_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: '你只负责输出可执行的酒店视频 EDL JSON。' },
          { role: 'user', content }
        ]
      }),
      signal: AbortSignal.timeout(120000)
    });
  } catch (error) {
    json(res, 502, { error: error?.name === 'TimeoutError' ? '智能剪辑模型响应超时。' : '无法连接智能剪辑模型。' });
    return;
  }

  const upstream = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = upstream?.error?.message || upstream?.message || upstream?.error || `智能剪辑模型接口返回 ${response.status}`;
    json(res, response.status, { error: message, code: response.status === 403 ? 'EDIT_MODEL_FORBIDDEN' : '' });
    return;
  }
  try {
    const result = extractJsonObject(upstream?.choices?.[0]?.message?.content || upstream?.output_text || upstream?.output);
    json(res, 200, { ...result, source: 'llm', model });
  } catch (error) {
    json(res, 502, { error: error.message || '智能剪辑模型返回内容无法解析。', code: 'INVALID_EDIT_PLAN' });
  }
}

async function alignSmartAudio(req, res) {
  const body = await readRequestBody(req);
  const parts = parseMultipart(body, req.headers['content-type']);
  const audio = partByName(parts, 'audio') || partByName(parts, 'voiceover');
  const apiKey = sharedApiKey();
  const model = cleanConfigText(textPart(parts, 'model'), COMPANY_ASR_MODEL, 120);
  if (!audio?.data?.length) {
    json(res, 400, { error: '缺少待对齐的旁白音频。' });
    return;
  }
  if (!apiKey || !model) {
    json(res, 503, { error: '未配置可用的 ASR/语音对齐模型。', code: 'ASR_NOT_CONFIGURED' });
    return;
  }

  const endpoints = [
    `${COMPANY_VIDEO_API_BASE_URL}/audio/transcriptions/runs`,
    `${COMPANY_VIDEO_API_BASE_URL}/audio/transcriptions`
  ];
  let response;
  let payload = {};
  try {
    for (const endpoint of endpoints) {
      const form = new FormData();
      form.append('file', new Blob([audio.data], { type: audio.contentType || 'audio/mpeg' }), audio.filename || 'voiceover.mp3');
      form.append('model', model);
      form.append('response_format', 'verbose_json');
      form.append('timestamp_granularities[]', 'word');
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
        signal: AbortSignal.timeout(120000)
      });
      payload = await response.json().catch(() => ({}));
      if (response.ok || ![404, 405, 501].includes(response.status)) break;
    }
  } catch (error) {
    json(res, 502, { error: error?.name === 'TimeoutError' ? '语音对齐模型响应超时。' : '无法连接语音对齐模型。' });
    return;
  }
  if (!response.ok) {
    json(res, response.status, { error: payload?.error?.message || payload?.message || payload?.error || `语音对齐模型返回 ${response.status}` });
    return;
  }
  json(res, 200, payload);
}

async function renderSmartEdit(req, res) {
  const body = await readRequestBody(req);
  const parts = parseMultipart(body, req.headers['content-type']);
  const audio = partByName(parts, 'voiceover') || partByName(parts, 'audio');
  const backgroundMusic = partByName(parts, 'backgroundMusic') || partByName(parts, 'music');
  let edl;
  try { edl = JSON.parse(textPart(parts, 'edl') || '{}'); } catch { json(res, 400, { error: 'EDL 不是有效的 JSON。' }); return; }
  const segments = normalizeEditSegments(edl);
  if (!segments.length || !audio?.data?.length) {
    json(res, 400, { error: '智能剪辑缺少有效分镜或旁白。' });
    return;
  }

  const root = await mkdtemp(join(tmpdir(), 'hotel-smart-edit-'));
  const width = edl.ratio === '16:9' ? 1280 : 720;
  const height = edl.ratio === '16:9' ? 720 : 1280;
  const assetParts = new Map(parts.filter(part => /^asset-\d+$/.test(part.name)).map(part => [Number(part.name.slice(6)), part]));
  try {
    const assetPaths = new Map();
    for (const [assetIndex, asset] of assetParts) {
      const path = join(root, `asset-${assetIndex}${safeFileExtension(asset.filename, asset.contentType?.startsWith('image/') ? '.jpg' : '.mp4')}`);
      await writeFile(path, asset.data);
      assetPaths.set(assetIndex, { path, image: asset.contentType?.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(path) });
    }
    const renderedSegments = [];
    const filter = `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},format=yuv420p,setsar=1`;
    for (const segment of segments) {
      const asset = assetPaths.get(segment.assetIndex) || assetPaths.get(0);
      if (!asset) throw new Error(`EDL 找不到素材 ${segment.assetIndex}`);
      const output = join(root, `segment-${String(segment.index).padStart(3, '0')}.mp4`);
      const args = asset.image
        ? ['-y', '-loop', '1', '-i', asset.path, '-t', String(segment.duration), '-vf', filter, '-r', '30', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', output]
        : ['-y', '-ss', String(segment.start), '-i', asset.path, '-t', String(segment.duration), '-vf', filter, '-r', '30', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', output];
      await runProcess(ffmpegBinary(), args);
      renderedSegments.push(output);
    }

    const concatPath = join(root, 'concat.txt');
    await writeFile(concatPath, renderedSegments.map(path => `file '${path.replace(/'/g, "'\\''")}'`).join('\n'));
    const stitchedPath = join(root, 'stitched.mp4');
    await runProcess(ffmpegBinary(), ['-y', '-f', 'concat', '-safe', '0', '-i', concatPath, '-c', 'copy', stitchedPath]);

    const audioPath = join(root, `voiceover${safeFileExtension(audio.filename, '.mp3')}`);
    await writeFile(audioPath, audio.data);
    let musicPath = '';
    if (backgroundMusic?.data?.length && edl?.backgroundMusic !== false) {
      musicPath = join(root, `background-music${safeFileExtension(backgroundMusic.filename, '.wav')}`);
      await writeFile(musicPath, backgroundMusic.data);
    }
    const assPath = join(root, 'captions.ass');
    if (edl.subtitles !== false) await writeFile(assPath, buildAssCaptions(edl, segments, width, height), 'utf8');

    const finalPath = join(root, 'final.mp4');
    const narrationVolume = Math.max(0, Math.min(2, Number(edl.narrationVolume) || 1));
    const musicVolume = Math.max(0, Math.min(1, Number(edl.musicVolume) || .18));
    const audioFilter = [`[1:a]aresample=async=1:first_pts=0,volume=${narrationVolume.toFixed(3)}[voice]`];
    const inputArgs = ['-y', '-i', stitchedPath, '-i', audioPath];
    if (musicPath) {
      inputArgs.push('-stream_loop', '-1', '-i', musicPath);
      audioFilter.push(`[2:a]aresample=async=1:first_pts=0,volume=${musicVolume.toFixed(3)}[bg]`);
      audioFilter.push('[voice][bg]amix=inputs=2:duration=first:dropout_transition=2:normalize=0[a]');
    } else {
      audioFilter.push('[voice]anull[a]');
    }
    const subtitleFilter = edl.subtitles === false
      ? '[0:v]null[v]'
      : `[0:v]subtitles=${ffmpegPathEscape(assPath)}:original_size=${width}x${height}[v]`;
    const finalArgs = [...inputArgs, '-filter_complex', `${subtitleFilter};${audioFilter.join(';')}`, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', finalPath];
    try {
      await runProcess(ffmpegBinary(), finalArgs);
    } catch (subtitleError) {
      // If a local FFmpeg build has no libass, keep the audio mix and the
      // selected background music instead of silently dropping the narration.
      const audioOnlyArgs = [...inputArgs, '-filter_complex', audioFilter.join(';'), '-map', '0:v:0', '-map', '[a]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', finalPath];
      await runProcess(ffmpegBinary(), audioOnlyArgs);
      console.warn(`[智能剪辑] 设计字幕烧录失败，已保留画面、旁白和背景音乐：${subtitleError.message}`);
    }
    const verifyPoints = [0];
    let verifyCursor = 0;
    segments.forEach(segment => { verifyCursor += segment.duration; verifyPoints.push(Math.max(0, verifyCursor - .05)); });
    for (const point of [...new Set(verifyPoints)].slice(0, 10)) {
      await runProcess(ffmpegBinary(), ['-v', 'error', '-ss', String(point), '-i', finalPath, '-frames:v', '1', '-f', 'null', '-']);
    }
    await runProcess(ffmpegBinary(), ['-v', 'error', '-i', finalPath, '-map', '0:a:0', '-t', '0.5', '-f', 'null', '-']);
    const bytes = await readFile(finalPath);
    res.writeHead(200, { 'Content-Type': 'video/mp4', 'Content-Length': bytes.length, 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*', 'X-Hotel-Render': 'video-use-edl', 'X-Hotel-BGM': musicPath ? 'mixed' : 'absent', 'X-Hotel-Verify': 'decode-pass' });
    res.end(bytes);
  } catch (error) {
    const message = /ENOENT|spawn ffmpeg/i.test(String(error?.message || ''))
      ? '找不到 FFmpeg。请先在 demo 目录执行 npm install，或设置 FFMPEG_PATH。'
      : error.message || '智能剪辑渲染失败';
    json(res, 502, { error: message, code: 'SMART_RENDER_FAILED' });
  } finally {
    await rm(root, { recursive: true, force: true }).catch(() => {});
  }
}

async function generateWithDoubao(parts) {
  const apiKey = sharedApiKey();
  if (!apiKey) {
    const error = new Error('未配置图片、视频和音频共用的 API Key。请点击页面右上角「配置 API」。');
    error.status = 503;
    throw error;
  }

  const reference = partByName(parts, 'style_reference');
  const scene = partByName(parts, 'scene_image');
  const logo = partByName(parts, 'logo');
  const qr = partByName(parts, 'qr_code');
  const images = [imageDataUri(reference)];
  if (scene?.data?.length) images.push(imageDataUri(scene));
  if (logo?.data?.length) images.push(imageDataUri(logo));
  if (qr?.data?.length) images.push(imageDataUri(qr));

  const model = DOUBAO_IMAGE_MODEL;
  const requestBody = {
    model,
    prompt: buildPrompt(parts),
    image: images,
    size: '2K',
    sequential_image_generation: 'disabled',
    stream: false,
    response_format: 'b64_json',
    watermark: false
  };
  // output_format is currently supported by Seedream 5.0-lite. Seedream 4.0
  // returns its default image format, so omit the field for that model.
  if (/seedream[-_. ]?5[-_. ]?0[-_. ]?lite/i.test(model)) requestBody.output_format = 'png';

  const response = await fetch(`${DOUBAO_API_BASE_URL}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const upstreamMessage = payload?.error?.message || payload?.message || payload?.error || '';
    const error = new Error(upstreamMessage || `豆包 Seedream 接口返回 ${response.status}`);
    error.status = response.status;
    error.traceId = payload?.request_id || payload?.trace_id || response.headers.get('x-request-id') || '';
    throw error;
  }
  const imageBytes = await readDoubaoImagePayload(payload);
  if (!imageBytes?.length) throw new Error('豆包 Seedream 没有返回图片数据');
  return { imageBytes, model };
}

async function generatePoster(req, res) {
  const body = await readRequestBody(req);
  const parts = parseMultipart(body, req.headers['content-type']);
  const reference = partByName(parts, 'style_reference');
  const scene = partByName(parts, 'scene_image');
  if (!reference?.data?.length) {
    json(res, 400, { error: '缺少风格参考图' });
    return;
  }

  if (MODEL_PROVIDER === 'doubao') {
    try {
      const { imageBytes, model } = await generateWithDoubao(parts);
      res.writeHead(200, {
        'Content-Type': imageMimeFromBytes(imageBytes),
        'Content-Length': imageBytes.length,
        'Cache-Control': 'no-store',
        'X-Hotel-Model': model,
        'X-Hotel-Provider': 'doubao'
      });
      res.end(imageBytes);
    } catch (error) {
      console.error(`[豆包] 请求失败 HTTP ${error.status || 502}${error.traceId ? ` · trace ${error.traceId}` : ''}：${error.message || '未知错误'}`);
      const message = error.status === 401
        ? '豆包 API Key 无效、已过期或粘贴格式不正确。请只输入 ark- 开头的 Key 本体，不要包含 Bearer。'
        : error.status === 403
          ? `豆包 API Key 有效，但当前账号、项目或密钥没有 ${DOUBAO_IMAGE_MODEL} 的调用权限，请在火山方舟控制台开通该模型后重试。`
          : error.status === 404
            ? `豆包模型或接口不存在：${DOUBAO_IMAGE_MODEL}。请检查模型 ID 是否与火山方舟控制台显示的一致。`
            : error.message || '豆包 Seedream 服务异常';
      json(res, error.status || 502, { error: message, traceId: error.traceId || '' });
    }
    return;
  }

  if (!COMPANY_API_KEY) {
    json(res, 503, { error: '公司模型服务未配置 API Key。请点击页面右上角「配置 API」输入公司 GPT API Key。', code: 'MODEL_NOT_CONFIGURED' });
    return;
  }

  const form = new FormData();
  form.append('model', COMPANY_IMAGE_MODEL);
  form.append('image[]', imageFile(reference, 'style-reference.png'), reference.filename || 'style-reference.png');
  if (scene?.data?.length) form.append('image[]', imageFile(scene, 'hotel-scene.png'), scene.filename || 'hotel-scene.png');
  const logo = partByName(parts, 'logo');
  const qr = partByName(parts, 'qr_code');
  if (logo?.data?.length) form.append('image[]', imageFile(logo, 'logo.png'), logo.filename || 'logo.png');
  if (qr?.data?.length) form.append('image[]', imageFile(qr, 'qr-code.png'), qr.filename || 'qr-code.png');
  form.append('prompt', buildPrompt(parts));
  form.append('size', outputSize(textPart(parts, 'ratio')));
  form.append('quality', COMPANY_IMAGE_QUALITY);
  form.append('output_format', 'png');

  const response = await fetch(`${COMPANY_API_BASE_URL}/images/edits`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${COMPANY_API_KEY}`,
      'x-openai-actor-authorization': COMPANY_ACTOR_AUTHORIZATION
    },
    body: form
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const upstreamMessage = companyImagePermissionMessage(payload, response);
    const traceId = payload?.trace_id || response.headers.get('x-turing-trace-id') || '';
    const message = upstreamMessage || `公司 GPT-Image 接口返回 ${response.status}`;
    json(res, response.status, { error: message, traceId });
    return;
  }
  const imageBytes = await readCompanyImagePayload(payload);
  if (!imageBytes?.length) {
    json(res, 502, { error: '模型没有返回图片数据' });
    return;
  }
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': imageBytes.length,
    'Cache-Control': 'no-store',
    'X-Hotel-Model': COMPANY_IMAGE_MODEL,
    'X-Hotel-Provider': 'company-gateway'
  });
  res.end(imageBytes);
}

function retouchPrompt() {
  return [
    '用途：酒店实景照片精修。只输出一张与原图相同尺寸和视角的干净照片，不要海报、文字、Logo、边框或重新设计。',
    '请保留原房间、家具、材质、透视、光线方向和主体位置，不要改变房间布局，不要新增或删除家具。',
    '进行自然、克制的商业摄影级修图：清除洗手台和台面水渍、玻璃上的污点/指纹、镜面脏点、地面小污迹和明显的手机噪点；把床单、被套和窗帘的细碎褶皱适度整理平整；修复区域必须延续周围真实纹理，不能出现糊块、重复纹理、塑料感或过度磨皮。',
    '提升清晰度、通透感和白平衡，保持真实暖光与原有颜色，不要过度锐化，不要改变墙面、木饰面、床头、卫浴五金的形状。',
    '如果某个污渍无法可靠判断，请保留原始细节，不要凭空重绘。禁止输出任何水印或 AI 标识。'
  ].join('\n');
}

async function retouchSceneWithDoubao(parts) {
  if (!DOUBAO_API_KEY) {
    const error = new Error('未配置豆包 API Key。请点击页面右上角「配置 API」输入 ARK API Key。');
    error.status = 503;
    throw error;
  }
  const scene = partByName(parts, 'image') || partByName(parts, 'scene_image');
  if (!scene?.data?.length) throw new Error('缺少酒店场景图');
  const model = DOUBAO_IMAGE_MODEL;
  const requestBody = {
    model,
    prompt: retouchPrompt(),
    image: [imageDataUri(scene)],
    size: '2K',
    sequential_image_generation: 'disabled',
    stream: false,
    response_format: 'b64_json',
    watermark: false
  };
  if (/seedream[-_. ]?5[-_. ]?0[-_. ]?lite/i.test(model)) requestBody.output_format = 'png';
  const response = await fetch(`${DOUBAO_API_BASE_URL}/images/generations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${DOUBAO_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.error?.message || payload?.message || `豆包 Seedream 接口返回 ${response.status}`);
    error.status = response.status;
    error.traceId = payload?.request_id || payload?.trace_id || response.headers.get('x-request-id') || '';
    throw error;
  }
  const imageBytes = await readDoubaoImagePayload(payload);
  if (!imageBytes?.length) throw new Error('豆包没有返回精修图片');
  return { imageBytes, model };
}

async function retouchSceneWithCompany(parts) {
  if (!COMPANY_API_KEY) {
    const error = new Error('未配置公司模型服务 API Key。请点击页面右上角「配置 API」输入公司 GPT API Key。');
    error.status = 503;
    throw error;
  }
  const scene = partByName(parts, 'image') || partByName(parts, 'scene_image');
  if (!scene?.data?.length) throw new Error('缺少酒店场景图');
  const form = new FormData();
  form.append('model', COMPANY_IMAGE_MODEL);
  form.append('image[]', imageFile(scene, scene.filename || 'hotel-scene.png'), scene.filename || 'hotel-scene.png');
  form.append('prompt', retouchPrompt());
  form.append('quality', COMPANY_IMAGE_QUALITY);
  form.append('output_format', 'png');
  const response = await fetch(`${COMPANY_API_BASE_URL}/images/edits`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${COMPANY_API_KEY}`, 'x-openai-actor-authorization': COMPANY_ACTOR_AUTHORIZATION },
    body: form
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(companyImagePermissionMessage(payload, response) || `公司 GPT-Image 接口返回 ${response.status}`);
    error.status = response.status;
    if (response.status === 502 || response.status === 503) error.code = 'MODEL_UNAVAILABLE';
    error.traceId = payload?.trace_id || response.headers.get('x-turing-trace-id') || '';
    throw error;
  }
  const imageBytes = await readCompanyImagePayload(payload);
  if (!imageBytes?.length) throw new Error('公司模型没有返回精修图片');
  return { imageBytes, model: COMPANY_IMAGE_MODEL };
}

function paidImagePrompt(parts) {
  const operation = textPart(parts, 'operation') || 'enhance';
  const ratio = textPart(parts, 'ratio') || 'landscape';
  const userPrompt = textPart(parts, 'prompt');
  const watermarkMode = textPart(parts, 'watermarkMode') || 'full';
  const hasWatermarkMask = operation === 'watermark-removal' && Boolean(partByName(parts, 'mask')?.data?.length);
  const enhanceStrength = Math.max(1, Math.min(3, Number(textPart(parts, 'enhanceStrength')) || 2));
  const ratioLabel = ratio === 'portrait' ? '3:4 竖版' : ratio === 'square' ? '1:1 方版' : '16:9 横版';
  const watermarkPrompt = watermarkMode === 'full' && !hasWatermarkMask
    ? [
      '这是一个已经完成设计排版的宣传海报，不是纯照片。原图中的品牌 Logo、YOUR LOGO、标题、副标题、商品名称、价格、日期、活动信息、说明文字和装饰排版都属于有效内容，必须逐字逐像素保留，不能删除、改写、翻译、模糊或重新生成。',
      '只删除明确属于水印的内容：在画面上重复出现、半透明、规则间隔排列的同一组文字/Logo，或覆盖全画面的重复斜线/菱形网格。不得因为某段文字是白色、灰色、浅色、Logo 或位于背景上就判定为水印。只出现一次或只出现在固定版式位置的文字一律保留。',
      '水印与有效文字重叠时，先完整恢复被斜线覆盖的原文字笔画、产品轮廓和装饰细节，再自然补齐背景；严禁把标题、正文、价格、日期、Logo、瓶身、罐身、芦苇、白鹤或水珠擦出缺口。无法可靠区分时保留原内容，不要扩大修复区域，不要重绘整张海报。只修复水印覆盖的最小区域，画幅、构图、产品、色彩和光线保持不变。'
    ].join('\n')
    : [
      '这是一个已经完成设计排版的宣传海报。透明遮罩是用户明确指定的水印区域，只修复遮罩内的水印，遮罩外所有品牌 Logo、标题、副标题、商品名称、价格、日期、活动信息、说明文字和装饰排版必须逐字逐像素保留。',
      '不要删除、改写、翻译或重新生成任何未被遮罩覆盖的文字；不要因为文字颜色浅或像 Logo 就把它当成水印。修复遮罩时只处理最小必要区域，无法判断时保留原内容。'
    ].join('\n');
  const prompts = {
    'ai-cutout': '请只保留图片中的主要主体并移除全部背景，输出透明背景 PNG。保留主体真实颜色、轮廓、毛发/细线和自然阴影，不要重绘主体，不要新增文字、Logo、水印或边框。',
    erase: '请移除用户在遮罩中标记的杂物、污渍、文字或不需要的元素，并用周围真实纹理自然修复。除标记区域外不要改变原图的房间结构、家具、透视、光线和颜色，不要新增物体、文字、Logo 或水印。',
    'mark-edit': `请只根据用户在遮罩中标记的区域完成局部修改。用户修改说明：${userPrompt || '清理标记区域并自然修复'}。除标记区域外保持原图完全不变，不要新增文字、Logo、水印或边框。`,
    expand: `请将原图自然扩展为 ${ratioLabel} 画布，保留原图主体、透视和光线方向，只在画布外补足与周围环境连续的真实背景，不要拉伸主体、重复纹理或生成文字、Logo、水印。`,
    'watermark-removal': watermarkPrompt,
    'scene-retouch': retouchPrompt(),
    enhance: '请对这张酒店实景照片进行克制的商业摄影级清晰度增强：减少手机噪点和轻微模糊，提升细节、通透感和白平衡，保持原始空间、家具、材质、透视和尺寸不变。不要过度磨皮、改变布局或新增任何元素。'
  };
  return [
    '你是酒店图片后期处理助手。只输出一张处理后的图片，不要解释过程。',
    prompts[operation] || prompts.enhance,
    operation === 'expand' ? `输出比例必须是 ${ratioLabel}。` : '',
    operation === 'enhance' ? `增强强度为${enhanceStrength === 1 ? '轻度' : enhanceStrength === 3 ? '强度' : '标准'}，请克制处理，避免过度锐化。` : '',
    '如果无法可靠判断某个区域，请保留原始细节，不要凭空重绘。禁止 AI 标识和水印。'
  ].filter(Boolean).join('\n');
}

async function paidImageWithCompany(parts) {
  if (!COMPANY_API_KEY) {
    const error = new Error('公司模型服务未配置 API Key。请点击页面右上角「配置 API」输入公司 GPT API Key。');
    error.status = 503;
    throw error;
  }
  const image = partByName(parts, 'image');
  if (!image?.data?.length) throw new Error('缺少待处理图片');
  const operation = textPart(parts, 'operation') || 'enhance';
  const form = new FormData();
  form.append('model', COMPANY_IMAGE_MODEL);
  form.append('image[]', imageFile(image, image.filename || 'hotel-image.png'), image.filename || 'hotel-image.png');
  const mask = partByName(parts, 'mask');
  if (mask?.data?.length) form.append('mask', imageFile(mask, 'edit-mask.png'), mask.filename || 'edit-mask.png');
  form.append('prompt', paidImagePrompt(parts));
  // `auto` preserves the uploaded poster orientation; explicit ratios remain
  // reserved for expansion and other fixed-canvas operations.
  form.append('size', outputSize(textPart(parts, 'ratio')));
  // Full-screen poster cleanup needs the best preservation/detail setting;
  // other tools continue to honor the user's configured quality.
  form.append('quality', operation === 'watermark-removal' ? 'high' : COMPANY_IMAGE_QUALITY);
  form.append('output_format', operation === 'ai-cutout' ? 'png' : 'png');
  if (operation === 'ai-cutout') form.append('background', 'transparent');
  const response = await fetch(`${COMPANY_API_BASE_URL}/images/edits`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${COMPANY_API_KEY}`, 'x-openai-actor-authorization': COMPANY_ACTOR_AUTHORIZATION },
    body: form
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(companyImagePermissionMessage(payload, response) || `公司 GPT-Image 接口返回 ${response.status}`);
    error.status = response.status;
    if (response.status === 502 || response.status === 503) error.code = 'MODEL_UNAVAILABLE';
    error.traceId = payload?.trace_id || response.headers.get('x-turing-trace-id') || '';
    throw error;
  }
  const imageBytes = await readCompanyImagePayload(payload);
  if (!imageBytes?.length) throw new Error('公司模型没有返回图片数据');
  return { imageBytes, model: COMPANY_IMAGE_MODEL };
}

async function generatePaidImage(req, res) {
  const body = await readRequestBody(req);
  const parts = parseMultipart(body, req.headers['content-type']);
  try {
    const result = await paidImageWithCompany(parts);
    res.writeHead(200, {
      'Content-Type': imageMimeFromBytes(result.imageBytes),
      'Content-Length': result.imageBytes.length,
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'X-Hotel-Model': result.model,
      'X-Hotel-Provider': 'company'
    });
    res.end(result.imageBytes);
  } catch (error) {
    const message = error.status === 401
      ? '公司模型 API Key 无效或已过期。'
      : error.status === 403
        ? (error.message || '当前公司账号或模型没有图片编辑权限。')
        : error.message || '公司图片模型服务异常';
    console.error(`[付费图片工具] 请求失败 HTTP ${error.status || 502}：${message}`);
    const status = error.status || 502;
    const code = error.code || (status === 503 ? 'MODEL_NOT_CONFIGURED' : status === 502 ? 'MODEL_UNAVAILABLE' : '');
    json(res, status, { error: message, code, traceId: error.traceId || '' });
  }
}

async function generateSceneRetouch(req, res) {
  const body = await readRequestBody(req);
  const parts = parseMultipart(body, req.headers['content-type']);
  const scene = partByName(parts, 'image') || partByName(parts, 'scene_image');
  if (!scene?.data?.length) {
    json(res, 400, { error: '缺少酒店场景图' });
    return;
  }
  try {
    // The hotel cleanup tools are intentionally pinned to the company
    // gateway. The provider switch remains available for poster generation,
    // but paid image tools must use the company's GPT‑Image entitlement.
    const result = await retouchSceneWithCompany(parts);
    res.writeHead(200, {
      'Content-Type': imageMimeFromBytes(result.imageBytes),
      'Content-Length': result.imageBytes.length,
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'X-Hotel-Model': result.model,
      'X-Hotel-Provider': 'company'
    });
    res.end(result.imageBytes);
  } catch (error) {
    const message = error.status === 401
      ? '模型 API Key 无效或已过期。'
      : error.status === 403
        ? (error.message || '当前账号或模型没有图片编辑权限。')
        : error.message || '场景精修模型服务异常';
    console.error(`[场景精修] 请求失败 HTTP ${error.status || 502}：${message}`);
    json(res, error.status || 502, { error: message, traceId: error.traceId || '' });
  }
}

function activeProvider() {
  return MODEL_PROVIDER === 'doubao' ? 'doubao' : 'company';
}

function configStatus() {
  const provider = activeProvider();
  const configured = Boolean(sharedApiKey());
  const textConfig = textModelSettings();
  return {
    ok: true,
    provider,
    configured,
    model: provider === 'doubao' ? DOUBAO_IMAGE_MODEL : COMPANY_IMAGE_MODEL,
    apiBaseUrl: provider === 'doubao' ? DOUBAO_API_BASE_URL : COMPANY_API_BASE_URL,
    videoApiBaseUrl: COMPANY_VIDEO_API_BASE_URL,
    videoModel: COMPANY_VIDEO_MODEL,
    audioModel: COMPANY_AUDIO_MODEL,
    textProvider: textConfig.provider,
    textApiBaseUrl: textConfig.apiBaseUrl,
    textModel: textConfig.model,
    editModel: COMPANY_EDIT_MODEL,
    asrModel: COMPANY_ASR_MODEL,
    actorAuthorization: provider === 'company' ? COMPANY_ACTOR_AUTHORIZATION : '',
    quality: provider === 'company' ? COMPANY_IMAGE_QUALITY : '',
    storage: CONFIG_STORAGE,
    persistent: CONFIG_STORAGE !== 'process-memory'
  };
}

function validHttpUrl(value, fallback) {
  const candidate = String(value || fallback || '').trim().replace(/\/+$/, '');
  if (!candidate) return fallback;
  try {
    const parsed = new URL(candidate);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('协议不受支持');
    return candidate;
  } catch {
    const error = new Error('API 地址必须是 http:// 或 https:// 开头的完整地址');
    error.status = 400;
    throw error;
  }
}

function cleanConfigText(value, fallback, maxLength = 180) {
  const text = String(value ?? fallback ?? '').trim();
  if (text.length > maxLength) {
    const error = new Error('配置内容过长，请检查输入');
    error.status = 400;
    throw error;
  }
  return text || fallback;
}

async function configureModel(req, res) {
  let payload;
  try {
    const raw = await readRequestBody(req);
    payload = JSON.parse(raw.toString('utf8') || '{}');
  } catch (error) {
    json(res, 400, { error: error.message || '配置内容不是有效的 JSON' });
    return;
  }

  const provider = String(payload.provider || '').toLowerCase();
  if (!['company', 'doubao'].includes(provider)) {
    json(res, 400, { error: '请选择公司 GPT-Image 或豆包 Seedream' });
    return;
  }
  const suppliedKey = Object.prototype.hasOwnProperty.call(payload, 'apiKey')
    ? String(payload.apiKey || '').trim()
    : '';
  const currentKey = sharedApiKey();
  const apiKey = suppliedKey || currentKey;
  if (!apiKey) {
    json(res, 400, { error: '请输入图片、视频和音频共用的公司 API Key' });
    return;
  }
  if (/\s/.test(apiKey)) {
    json(res, 400, { error: 'API Key 不能包含空格或换行，请粘贴 Key 本体' });
    return;
  }

  try {
    const nextVideoBaseUrl = validHttpUrl(payload.videoApiBaseUrl, COMPANY_VIDEO_API_BASE_URL);
    const nextVideoModel = cleanConfigText(payload.videoModel, COMPANY_VIDEO_MODEL, 120);
    const nextAudioModel = cleanConfigText(payload.audioModel, COMPANY_AUDIO_MODEL, 120);
    const nextTextBaseUrl = validHttpUrl(payload.textApiBaseUrl, COMPANY_TEXT_API_BASE_URL);
    const nextTextModel = cleanConfigText(payload.textModel, COMPANY_TEXT_MODEL, 120);
    const nextEditModel = cleanConfigText(payload.editModel, COMPANY_EDIT_MODEL, 120);
    const nextAsrModel = cleanConfigText(payload.asrModel, COMPANY_ASR_MODEL, 120);
    if (provider === 'company') {
      const nextBaseUrl = validHttpUrl(payload.apiBaseUrl, COMPANY_API_BASE_URL);
      const nextModel = cleanConfigText(payload.model, COMPANY_IMAGE_MODEL, 120);
      const nextActor = cleanConfigText(payload.actorAuthorization, COMPANY_ACTOR_AUTHORIZATION, 120);
      const nextQuality = cleanConfigText(payload.quality, COMPANY_IMAGE_QUALITY, 30);
      // The same company key serves both media types. Keep both provider paths
      // aligned when the user saves or replaces the single shared key.
      COMPANY_API_KEY = apiKey;
      DOUBAO_API_KEY = apiKey;
      COMPANY_API_BASE_URL = nextBaseUrl;
      COMPANY_IMAGE_MODEL = nextModel;
      COMPANY_ACTOR_AUTHORIZATION = nextActor;
      COMPANY_IMAGE_QUALITY = nextQuality;
    } else {
      const nextBaseUrl = validHttpUrl(payload.apiBaseUrl, DOUBAO_API_BASE_URL);
      const nextModel = cleanConfigText(payload.model, DOUBAO_IMAGE_MODEL, 120);
      // Store the one configured key for both image and video API calls.
      COMPANY_API_KEY = apiKey;
      DOUBAO_API_KEY = apiKey;
      DOUBAO_API_BASE_URL = nextBaseUrl;
      DOUBAO_IMAGE_MODEL = nextModel;
    }
    COMPANY_VIDEO_API_BASE_URL = nextVideoBaseUrl;
    COMPANY_VIDEO_MODEL = nextVideoModel;
    COMPANY_AUDIO_MODEL = nextAudioModel;
    COMPANY_TEXT_API_BASE_URL = nextTextBaseUrl;
    COMPANY_TEXT_MODEL = nextTextModel;
    COMPANY_EDIT_MODEL = nextEditModel;
    COMPANY_ASR_MODEL = nextAsrModel;
    MODEL_PROVIDER = provider;
    CONFIG_STORAGE = persistConfig({
      apiKey,
      provider,
      model: COMPANY_IMAGE_MODEL,
      apiBaseUrl: COMPANY_API_BASE_URL,
      doubaoModel: DOUBAO_IMAGE_MODEL,
      doubaoApiBaseUrl: DOUBAO_API_BASE_URL,
      videoModel: COMPANY_VIDEO_MODEL,
      videoApiBaseUrl: COMPANY_VIDEO_API_BASE_URL,
      audioModel: COMPANY_AUDIO_MODEL,
      textProvider: TEXT_MODEL_PROVIDER,
      textModel: COMPANY_TEXT_MODEL,
      doubaoTextModel: DOUBAO_TEXT_MODEL,
      textApiBaseUrl: COMPANY_TEXT_API_BASE_URL,
      editModel: COMPANY_EDIT_MODEL,
      asrModel: COMPANY_ASR_MODEL,
      actorAuthorization: COMPANY_ACTOR_AUTHORIZATION,
      quality: COMPANY_IMAGE_QUALITY
    });
    json(res, 200, configStatus());
  } catch (error) {
    json(res, error.status || 400, { error: error.message || 'API 配置保存失败' });
  }
}

function clearModelConfig(_req, res) {
  // 用户明确点击“清除当前配置”时，同时移除钥匙串和本地非敏感配置。
  COMPANY_API_KEY = '';
  DOUBAO_API_KEY = '';
  clearPersistentConfig();
  CONFIG_STORAGE = 'process-memory';
  json(res, 200, configStatus());
}

async function serveStatic(pathname, res) {
  let relativePath;
  try {
    relativePath = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
  } catch {
    json(res, 400, { error: '无效路径' });
    return;
  }
  const filePath = normalize(join(DEMO_ROOT, relativePath));
  if (!filePath.startsWith(`${DEMO_ROOT}/`) || !existsSync(filePath)) {
    json(res, 404, { error: '文件不存在' });
    return;
  }
  try {
    const content = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
      // Allow a page opened via file:// (Origin: null) to fetch local assets
      // as Blob URLs before drawing them to an export canvas.
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  } catch (error) {
    json(res, 500, { error: error.message });
  }
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
      res.end();
      return;
    }
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (req.method === 'GET' && url.pathname === '/api/health') {
      const status = configStatus();
      json(res, 200, { ...status, provider: status.provider === 'doubao' ? 'doubao' : 'company-gateway' });
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/config') {
      json(res, 200, configStatus());
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/config') {
      await configureModel(req, res);
      return;
    }
    if (req.method === 'DELETE' && url.pathname === '/api/config') {
      clearModelConfig(req, res);
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/generate-poster') {
      await generatePoster(req, res);
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/retouch-scene') {
      await generateSceneRetouch(req, res);
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/paid-image') {
      await generatePaidImage(req, res);
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/generate-video') {
      await generateVideo(req, res);
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/analyze-edit') {
      await analyzeSmartEdit(req, res);
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/analyze-tags') {
      await analyzeAssetTags(req, res);
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/align-audio') {
      await alignSmartAudio(req, res);
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/render-smart-edit') {
      await renderSmartEdit(req, res);
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/generate-audio') {
      await generateAudio(req, res);
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/generate-copy') {
      await generateCopy(req, res);
      return;
    }
    if (req.method === 'GET') {
      await serveStatic(url.pathname, res);
      return;
    }
    json(res, 405, { error: 'Method Not Allowed' });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) json(res, error.status || 500, { error: error.message || '模型服务异常' });
  }
});

server.listen(PORT, () => {
  console.log(`酒店素材工坊模型服务已启动：http://127.0.0.1:${PORT}`);
  if (MODEL_PROVIDER === 'doubao') {
    console.log(`豆包 Seedream：${DOUBAO_IMAGE_MODEL} · API Key：${DOUBAO_API_KEY ? '已配置' : '未配置'}`);
  } else {
    console.log(`公司 GPT-Image：${COMPANY_IMAGE_MODEL} · 网关密钥：${COMPANY_API_KEY ? '已配置' : '未配置'}`);
  }
  const textConfig = textModelSettings();
  console.log(`文本模型：${textConfig.model} · ${textConfig.provider === 'doubao' ? '豆包 API' : 'Turing 网关'}：${textConfig.apiKey ? '已配置' : '未配置'}`);
});
