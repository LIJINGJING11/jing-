import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEMO_ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4174);
// 启动脚本可以通过环境变量提供默认配置；配置弹窗则会在运行时更新这些
// 值。API Key 始终只留在当前 Node 进程内，不会写入前端代码或项目文件。
let MODEL_PROVIDER = (process.env.MODEL_PROVIDER || (process.env.ARK_API_KEY ? 'doubao' : 'company')).toLowerCase();
let COMPANY_API_BASE_URL = (process.env.COMPANY_API_BASE_URL || 'https://coding.efficient.center/api/v1').replace(/\/+$/, '');
let COMPANY_API_KEY = process.env.API_GATEWAY_KEY || '';
let COMPANY_IMAGE_MODEL = process.env.COMPANY_IMAGE_MODEL || 'gpt-image-2';
let COMPANY_ACTOR_AUTHORIZATION = process.env.COMPANY_ACTOR_AUTHORIZATION || 'image-generation';
let COMPANY_IMAGE_QUALITY = process.env.COMPANY_IMAGE_QUALITY || 'medium';
// The company gateway shares one key across image, video, and audio, but the
// API hosts and routes differ. Turing's portal task API is configured independently.
let COMPANY_VIDEO_API_BASE_URL = (process.env.COMPANY_VIDEO_API_BASE_URL || 'https://live-turing.cn.llm.tcljd.com/api/v1').replace(/\/+$/, '');
let COMPANY_VIDEO_MODEL = process.env.COMPANY_VIDEO_MODEL || 'doubao-seedance-2-5-260628';
let COMPANY_AUDIO_MODEL = process.env.COMPANY_AUDIO_MODEL || 'turing/tts-1';
let COMPANY_VIDEO_STATUS_URL = (process.env.COMPANY_VIDEO_STATUS_URL || '').replace(/\/+$/, '');
const COMPANY_VIDEO_TASK_PATH = '/portal/me/videos';
const VIDEO_POLL_INTERVAL_MS = Math.max(1000, Number(process.env.COMPANY_VIDEO_POLL_INTERVAL_MS) || 20000);
let DOUBAO_API_BASE_URL = (process.env.DOUBAO_API_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3').replace(/\/+$/, '');
let DOUBAO_API_KEY = process.env.ARK_API_KEY || '';
let DOUBAO_IMAGE_MODEL = process.env.DOUBAO_MODEL || 'doubao-seedream-5-0-260128';
const MAX_BODY_BYTES = 128 * 1024 * 1024;

function sharedApiKey() {
  return MODEL_PROVIDER === 'doubao'
    ? (DOUBAO_API_KEY || COMPANY_API_KEY)
    : (COMPANY_API_KEY || DOUBAO_API_KEY);
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

const TTS_VOICES = new Set(['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse']);

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
  const voice = String(input.voice || 'verse').trim().toLowerCase();
  const model = cleanConfigText(input.model, COMPANY_AUDIO_MODEL, 120);
  const responseFormat = ['mp3', 'wav', 'flac', 'opus', 'pcm', 'aac'].includes(String(input.response_format || '').toLowerCase())
    ? String(input.response_format).toLowerCase()
    : 'mp3';
  const speed = Number(input.speed);
  if (!text) {
    json(res, 400, { error: '配音文案为空。' });
    return;
  }
  if (!TTS_VOICES.has(voice)) {
    json(res, 400, { error: `不支持的音色：${voice}。请从 Turing 音频模型支持的 OpenAI 音色中选择。` });
    return;
  }
  if (Number.isFinite(speed) && (speed < 0.25 || speed > 4)) {
    json(res, 400, { error: '语速必须在 0.25 到 4.0 之间。' });
    return;
  }

  const requestBody = {
    model,
    voice,
    input: text,
    response_format: responseFormat
  };
  if (Number.isFinite(speed)) requestBody.speed = speed;

  let response;
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

  const contentType = (response.headers.get('content-type') || '').split(';')[0].toLowerCase();
  if (!response.ok) {
    const payload = contentType.includes('json') ? await response.json().catch(() => ({})) : {};
    const traceId = payload?.trace_id || payload?.request_id || response.headers.get('x-turing-trace-id') || response.headers.get('x-request-id') || '';
    const message = response.status === 401
      ? '公司音频模型 API Key 无效或已过期。'
      : response.status === 403
        ? `当前 API Key 或网关权限未开通音频模型 ${model}。`
        : payload?.error?.message || payload?.message || payload?.error || `公司音频模型接口返回 ${response.status}`;
    json(res, response.status, { error: message, traceId });
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
    'X-Hotel-Audio-Model': model,
    'X-Hotel-Audio-Voice': voice
  });
  res.end(audioBytes);
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
  return {
    ok: true,
    provider,
    configured,
    model: provider === 'doubao' ? DOUBAO_IMAGE_MODEL : COMPANY_IMAGE_MODEL,
    apiBaseUrl: provider === 'doubao' ? DOUBAO_API_BASE_URL : COMPANY_API_BASE_URL,
    videoApiBaseUrl: COMPANY_VIDEO_API_BASE_URL,
    videoModel: COMPANY_VIDEO_MODEL,
    audioModel: COMPANY_AUDIO_MODEL,
    actorAuthorization: provider === 'company' ? COMPANY_ACTOR_AUTHORIZATION : '',
    quality: provider === 'company' ? COMPANY_IMAGE_QUALITY : '',
    storage: 'process-memory'
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
    MODEL_PROVIDER = provider;
    json(res, 200, configStatus());
  } catch (error) {
    json(res, error.status || 400, { error: error.message || 'API 配置保存失败' });
  }
}

function clearModelConfig(_req, res) {
  // 只清除运行时输入，不修改启动脚本、项目文件或系统钥匙串。
  COMPANY_API_KEY = '';
  DOUBAO_API_KEY = '';
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
    if (req.method === 'POST' && url.pathname === '/api/generate-audio') {
      await generateAudio(req, res);
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
});
