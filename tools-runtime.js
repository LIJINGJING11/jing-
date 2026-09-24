/*
 * Runtime for the standalone tools.  This is the browser-facing adapter
 * for the implementation shipped in the original Electron installer.  When
 * window.bootframe is available we call the bundled sharp/FFmpeg processors;
 * model-backed image tools first go through the local company gateway. When
 * the page is opened directly in a browser, the same gateway is tried first,
 * with a deterministic Canvas fallback only when the gateway is unavailable.
 */
(function () {
  'use strict';

  const root = document.querySelector('#toolWorkspaceView');
  if (!root) return;

  const bridge = window.bootframe || null;
  const toolState = {
    currentTool: null,
    files: { image: null, video: null, logo: null, 'image-crop': [], 'video-compress': null, 'watermark-removal': null, 'scene-retouch': null, 'ai-cutout': null, erase: null, 'mark-edit': null, expand: null, enhance: null },
    outputDirs: { image: null, video: null, logo: null, 'image-crop': null, 'video-compress': null, 'watermark-removal': null, 'scene-retouch': null, 'ai-cutout': null, erase: null, 'mark-edit': null, expand: null, enhance: null },
    background: 'auto',
    imageMaterialMode: 'cover',
    watermarkMode: 'local',
    watermarkSelection: null,
    watermarkBrushStrokes: [],
    watermarkPreview: null,
    paidBrushStrokes: { erase: [], 'mark-edit': [] },
    paidPreviews: {},
    expandRatio: 'landscape',
    enhanceStrength: 2,
    result: null
  };
  const paidImageKinds = new Set(['ai-cutout', 'erase', 'mark-edit', 'expand', 'enhance']);
  const modelImageKinds = new Set([...paidImageKinds, 'watermark-removal']);

  const $ = (selector, scope = root) => scope.querySelector(selector);
  const $$ = (selector, scope = root) => [...scope.querySelectorAll(selector)];
  const pageFor = (kind) => $(`#tool-${kind}`);
  const fileName = (value) => value instanceof File ? value.name : String(value || '').split(/[\\/]/).pop() || '素材';
  const extension = (value) => fileName(value).split('.').pop().toLowerCase();

  function showToast(message) {
    const toast = $('#tool-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 4600);
  }

  function setProgress(stage, percent, detail = '') {
    $('#progress-stage').textContent = stage;
    $('#progress-percent').textContent = `${Math.round(percent)}%`;
    $('#progress-detail').textContent = detail;
    $('#progress-bar').style.width = `${Math.max(0, Math.min(100, percent))}%`;
  }

  function updateReady(kind) {
    const page = pageFor(kind);
    if (!page) return;
    const value = toolState.files[kind];
    const hasFile = Array.isArray(value) ? value.length > 0 : Boolean(value);
    const hasOutput = Boolean(toolState.outputDirs[kind]);
    const hasWatermarkSelection = kind !== 'watermark-removal' || toolState.watermarkMode === 'full' || Boolean(toolState.watermarkSelection);
    const hasPaidMarks = !['erase', 'mark-edit'].includes(kind) || toolState.paidBrushStrokes[kind]?.some((stroke) => stroke?.length);
    const hasPaidPrompt = kind !== 'mark-edit' || Boolean($('#paidPrompt-mark-edit')?.value.trim());
    const output = $('.output-picker', page);
    const run = $('.run-button', page);
    page.classList.toggle('has-file', hasFile);
    page.classList.toggle('has-output', hasOutput);
    output?.classList.toggle('needs-attention', hasFile && !hasOutput);
    run?.classList.toggle('needs-attention', hasFile && hasOutput);
    run && (run.disabled = !(hasFile && hasOutput && hasWatermarkSelection && hasPaidMarks && hasPaidPrompt));
  }

  function prepareBrowserOutput(kind) {
    if (bridge) return;
    toolState.outputDirs[kind] = 'browser-downloads';
    const picker = $('.output-picker', pageFor(kind));
    if (!picker) return;
    $('b', picker).textContent = '浏览器下载文件夹';
    $('strong', picker).textContent = '已准备下载 ✓';
  }

  function setSelected(kind, value) {
    if (!value) return;
    toolState.files[kind] = value;
    if (kind === 'watermark-removal') {
      toolState.watermarkSelection = null;
      toolState.watermarkBrushStrokes = [];
      toolState.watermarkPreview = null;
      renderWatermarkPreview(value);
    }
    if (['erase', 'mark-edit'].includes(kind)) {
      toolState.paidBrushStrokes[kind] = [];
      renderPaidPreview(kind, value);
    }
    const selected = $('.selected-file', pageFor(kind));
    if (selected) {
      const label = $('b', selected);
      if (label) { label.textContent = fileName(value); label.title = fileName(value); }
      selected.hidden = false;
    }
    // Browser downloads do not need a directory permission.  Keep the same
    // visual step but mark it ready so the fallback can download immediately.
    prepareBrowserOutput(kind);
    updateReady(kind);
  }

  function setSelectedBatch(values) {
    const valid = (Array.isArray(values) ? values : []).filter((value) => ['jpg', 'jpeg', 'png'].includes(extension(value)));
    if (!valid.length) { showToast('批量图片裁剪仅支持 JPG、PNG 文件。'); return; }
    toolState.files['image-crop'] = valid.slice(0, 10);
    if (valid.length > 10) showToast('一次最多处理 10 张图片，已保留前 10 张。');
    const selected = $('.selected-file', pageFor('image-crop'));
    if (selected) {
      $('b', selected).textContent = `已选择 ${toolState.files['image-crop'].length} 张图片`;
      $('.batch-names', selected).textContent = toolState.files['image-crop'].map(fileName).join('　·　');
      selected.hidden = false;
    }
    prepareBrowserOutput('image-crop');
    updateReady('image-crop');
  }

  function openBrowserPicker(kind) {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = kind === 'image-crop';
      input.accept = kind === 'video' || kind === 'video-compress'
        ? 'video/mp4,.mp4'
        : ['image-crop', 'watermark-removal', 'scene-retouch', 'ai-cutout', 'erase', 'mark-edit', 'expand', 'enhance'].includes(kind)
          ? 'image/jpeg,image/png,.jpg,.jpeg,.png'
          : 'image/jpeg,image/png,image/svg+xml,.jpg,.jpeg,.png,.svg,.ai,.eps,.cdr';
      input.addEventListener('change', () => resolve(input.multiple ? [...input.files] : input.files[0] || null), { once: true });
      input.click();
    });
  }

  async function chooseFile(kind) {
    if (bridge?.chooseFile) {
      const selected = await bridge.chooseFile(kind === 'video' || kind === 'video-compress' ? 'video' : kind === 'image-crop' ? 'batch-image' : 'image');
      if (kind === 'image-crop') setSelectedBatch(selected);
      else setSelected(kind, selected);
      return;
    }
    const selected = await openBrowserPicker(kind);
    if (kind === 'image-crop') setSelectedBatch(selected);
    else if (selected) {
      const ext = extension(selected);
      const allowed = kind === 'video' || kind === 'video-compress' ? ['mp4'] : ['image-crop', 'watermark-removal', 'scene-retouch', 'ai-cutout', 'erase', 'mark-edit', 'expand', 'enhance'].includes(kind) ? ['jpg', 'jpeg', 'png'] : ['jpg', 'jpeg', 'png', 'svg', 'ai', 'eps', 'cdr'];
      if (!allowed.includes(ext)) { showToast(`不支持 .${ext} 文件，请选择 ${allowed.join(' / ').toUpperCase()}`); return; }
      setSelected(kind, selected);
    }
  }

  function bindUploadPanels() {
    $$('.upload-button, .replace-file').forEach((button) => button.addEventListener('click', () => chooseFile(button.closest('.tool-page').dataset.kind)));
    $$('.upload-panel').forEach((panel) => {
      ['dragenter', 'dragover'].forEach((eventName) => panel.addEventListener(eventName, (event) => { event.preventDefault(); panel.classList.add('dragover'); }));
      ['dragleave', 'drop'].forEach((eventName) => panel.addEventListener(eventName, (event) => { event.preventDefault(); panel.classList.remove('dragover'); }));
      panel.addEventListener('drop', (event) => {
        const files = [...(event.dataTransfer?.files || [])];
        const kind = panel.closest('.tool-page').dataset.kind;
        if (panel.dataset.multiple === 'true') { setSelectedBatch(files); return; }
        const file = files[0];
        if (!file) return;
        const allowed = panel.dataset.accept === 'video' ? ['mp4'] : panel.dataset.accept === 'basic-image' ? ['jpg', 'jpeg', 'png'] : ['jpg', 'jpeg', 'png', 'svg', 'ai', 'eps', 'cdr'];
        if (!allowed.includes(extension(file))) { showToast(`不支持 .${extension(file)} 文件，请选择 ${allowed.join(' / ').toUpperCase()}`); return; }
        setSelected(kind, bridge?.filePath ? bridge.filePath(file) : file);
      });
    });
  }

  function bindOutputPickers() {
    $$('.output-picker').forEach((button) => button.addEventListener('click', async () => {
      const kind = button.closest('.tool-page').dataset.kind;
      if (bridge?.chooseOutput) {
        const selected = await bridge.chooseOutput();
        if (!selected) return;
        toolState.outputDirs[kind] = selected;
        $('b', button).textContent = selected;
        $('strong', button).textContent = '点击更改 →';
      } else {
        toolState.outputDirs[kind] = 'browser-downloads';
        $('b', button).textContent = '浏览器下载文件夹';
        $('strong', button).textContent = '已准备下载 ✓';
      }
      updateReady(kind);
    }));
  }

  function bindImageOptions() {
    $$('.mode-option').forEach((button) => button.addEventListener('click', () => {
      toolState.imageMaterialMode = button.dataset.materialMode === 'logo' ? 'logo' : 'cover';
      const page = pageFor('image');
      page.classList.toggle('logo-material', toolState.imageMaterialMode === 'logo');
      $$('.mode-option', page).forEach((item) => { const selected = item === button; item.classList.toggle('selected', selected); item.setAttribute('aria-checked', selected ? 'true' : 'false'); });
      $$('.background-card .swatch', page).forEach((item) => { item.disabled = toolState.imageMaterialMode !== 'logo'; });
    }));
    $$('.swatch:not(.custom)').forEach((button) => button.addEventListener('click', () => {
      $$('.swatch').forEach((item) => item.classList.remove('selected'));
      button.classList.add('selected');
      toolState.background = button.dataset.color;
    }));
    const customButton = $('#custom-background-button');
    const colorInput = $('#custom-background-color');
    const applyCustom = (color) => { const value = String(color).toUpperCase(); customButton.dataset.color = value; customButton.style.setProperty('--custom-background', value); colorInput.value = value; $$('.swatch').forEach((item) => item.classList.remove('selected')); customButton.classList.add('selected'); toolState.background = value; };
    customButton?.addEventListener('click', async () => {
      if ('EyeDropper' in window) { try { customButton.classList.add('picking'); applyCustom((await new window.EyeDropper().open()).sRGBHex); return; } catch (error) { if (error?.name === 'AbortError') return; } finally { customButton.classList.remove('picking'); } }
      colorInput?.click();
    });
    colorInput?.addEventListener('input', () => applyCustom(colorInput.value));
    const sensitivity = $('#sensitivity');
    const sensitivityOutput = $('#sensitivity-output');
    sensitivity?.addEventListener('input', () => { if (sensitivityOutput) sensitivityOutput.value = sensitivity.value; });
  }

  function openTool(requestedKind) {
    const kind = ({ 'boot-kit': 'image', 'boot-video': 'video', 'logo-cutout': 'logo', 'image-compress': 'image-crop', 'video-compress': 'video-compress', 'watermark-removal': 'watermark-removal', 'scene-retouch': 'scene-retouch', 'ai-cutout': 'ai-cutout', erase: 'erase', 'mark-edit': 'mark-edit', expand: 'expand', enhance: 'enhance', 'ai-video': 'ai-video' })[requestedKind] || requestedKind;
    if (!pageFor(kind)) return;
    toolState.currentTool = kind;
    if (typeof window.showWorkspace === 'function') {
      // The workspace switch owns the landing/navigation state; reopen only
      // the selected processor after it has applied that state.
      window.showWorkspace(kind === 'ai-video' ? 'ai-video' : 'tools');
    }
    document.querySelector('#toolsView')?.classList.add('hidden');
    document.querySelector('#libraryView')?.classList.add('hidden');
    document.querySelector('#editorView')?.classList.add('hidden');
    root.classList.remove('hidden');
    $$('.tool-page').forEach((page) => { page.hidden = page.dataset.kind !== kind; });
    const title = document.querySelector('#workspaceTitle');
    if (title) title.textContent = '本地工具 · ' + ({ image: '开机三件套', video: '开机视频转换', logo: 'Logo 黑白扣取', 'image-crop': '图片裁剪压缩', 'video-compress': '视频压缩', 'watermark-removal': '一键去水印', 'scene-retouch': '一键精修场景图', 'ai-cutout': 'AI 抠图', erase: '擦除', 'mark-edit': '标记改图', expand: '扩图', enhance: '变清晰', 'ai-video': 'AI 自动成片' }[kind] || '工具');
    const privacy = document.querySelector('#privacyStatus');
    const modelBacked = kind === 'scene-retouch' || modelImageKinds.has(kind);
    if (privacy) privacy.textContent = modelBacked ? '公司模型优先 · 未配置时本机回退' : bridge ? '本地处理 · 素材不上传' : '浏览器本地预览 · 点击导出下载';
    updateReady(kind);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.openLocalTool = openTool;

  function backHome() { toolState.currentTool = null; root.classList.add('hidden'); $$('.tool-page').forEach((page) => { page.hidden = true; }); window.showWorkspace?.('tools'); }

  function readBlob(value) {
    if (value instanceof File || value instanceof Blob) return Promise.resolve(value);
    return Promise.reject(new Error('当前页面无法读取文件路径，请使用文件选择器重新上传。'));
  }

  async function decodeImage(value) {
    const blob = await readBlob(value);
    if ('createImageBitmap' in window) return { image: await createImageBitmap(blob), close: true };
    const url = URL.createObjectURL(blob);
    const image = await new Promise((resolve, reject) => { const item = new Image(); item.onload = () => resolve(item); item.onerror = reject; item.src = url; });
    return { image, close: false, url };
  }

  function releaseImage(decoded) { decoded?.close && decoded.image.close(); if (decoded?.url) URL.revokeObjectURL(decoded.url); }
  function makeCanvas(width, height) { const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; return canvas; }
  function drawCover(ctx, image, width, height) {
    const scale = Math.max(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  }
  function parseColor(value) { const match = /^#?([0-9a-f]{6})$/i.exec(value || ''); if (!match) return [255, 255, 255]; return [parseInt(match[1].slice(0, 2), 16), parseInt(match[1].slice(2, 4), 16), parseInt(match[1].slice(4, 6), 16)]; }
  function median(values) { const sorted = values.slice().sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)] || 255; }
  function borderColor(data, width, height) {
    const values = [[], [], []];
    const sample = (x, y) => { const index = (y * width + x) * 4; for (let c = 0; c < 3; c += 1) values[c].push(data[index + c]); };
    for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 40))) { sample(x, 0); sample(x, height - 1); }
    for (let y = 0; y < height; y += Math.max(1, Math.floor(height / 40))) { sample(0, y); sample(width - 1, y); }
    return values.map(median);
  }
  function trimAlpha(data, width, height) {
    let minX = width, minY = height, maxX = -1, maxY = -1;
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) { if (data[(y * width + x) * 4 + 3] > 4) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); } }
    if (maxX < 0) return { data, width, height };
    const out = new Uint8ClampedArray((maxX - minX + 1) * (maxY - minY + 1) * 4);
    for (let y = minY; y <= maxY; y += 1) for (let x = minX; x <= maxX; x += 1) { const from = (y * width + x) * 4; const to = ((y - minY) * (maxX - minX + 1) + x - minX) * 4; out.set(data.slice(from, from + 4), to); }
    return { data: out, width: maxX - minX + 1, height: maxY - minY + 1 };
  }
  function logoMatte(decoded, sensitivity) {
    const source = decoded.image;
    const max = 1800;
    const scale = Math.min(1, max / Math.max(source.width, source.height));
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    const canvas = makeCanvas(width, height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, width, height);
    const image = ctx.getImageData(0, 0, width, height);
    const bg = borderColor(image.data, width, height);
    const threshold = 14 + (100 - Number(sensitivity || 68)) * 0.55;
    for (let i = 0; i < image.data.length; i += 4) {
      const distance = Math.hypot(image.data[i] - bg[0], image.data[i + 1] - bg[1], image.data[i + 2] - bg[2]);
      const alpha = Math.max(0, Math.min(255, Math.round((distance - threshold) * 12)));
      image.data[i + 3] = Math.min(image.data[i + 3], alpha);
      if (!image.data[i + 3]) image.data[i] = image.data[i + 1] = image.data[i + 2] = 0;
    }
    return trimAlpha(image.data, width, height);
  }
  function canvasBlob(canvas, type, quality) { return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('浏览器无法生成输出文件')), type, quality)); }
  async function compressedJpeg(canvas, limit) { for (const quality of [.92, .84, .74, .64, .54, .44]) { const blob = await canvasBlob(canvas, 'image/jpeg', quality); if (blob.size < limit) return blob; } return canvasBlob(canvas, 'image/jpeg', .34); }
  function encodeBmp(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const { width, height } = canvas;
    const rgba = ctx.getImageData(0, 0, width, height).data;
    const rowSize = Math.ceil((width * 3) / 4) * 4;
    const buffer = new ArrayBuffer(54 + rowSize * height);
    const view = new DataView(buffer);
    view.setUint16(0, 0x4d42, true); view.setUint32(2, buffer.byteLength, true); view.setUint32(10, 54, true); view.setUint32(14, 40, true); view.setInt32(18, width, true); view.setInt32(22, -height, true); view.setUint16(26, 1, true); view.setUint16(28, 24, true); view.setUint32(34, rowSize * height, true);
    const bytes = new Uint8Array(buffer);
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) { const src = (y * width + x) * 4; const dst = 54 + y * rowSize + x * 3; bytes[dst] = rgba[src + 2]; bytes[dst + 1] = rgba[src + 1]; bytes[dst + 2] = rgba[src]; }
    return new Blob([buffer], { type: 'image/bmp' });
  }
  function fitImageCanvas(decoded, maxSize = 2400) {
    const source = decoded.image;
    const scale = Math.min(1, maxSize / Math.max(source.width, source.height));
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    const canvas = makeCanvas(width, height);
    canvas.getContext('2d').drawImage(source, 0, 0, width, height);
    return canvas;
  }
  function renderWatermarkSelection() {
    const preview = toolState.watermarkPreview;
    const selection = toolState.watermarkSelection;
    const editor = $('#watermark-editor');
    const box = $('#watermarkSelection');
    const brushCanvas = $('#watermarkBrushCanvas');
    const meta = $('#watermarkSelectionMeta');
    if (!preview || !box || !meta) return;
    if (!selection) {
      box.hidden = true;
      editor?.classList.remove('has-selection');
      meta.textContent = toolState.watermarkMode === 'full'
        ? (toolState.watermarkBrushStrokes.length ? '已完成安全的重复纹理识别，可继续沿水印拖动涂抹残留标记' : '满屏模式只自动处理重复、半透明的斜线或网格；正常标题、价格、日期和 Logo 会保留，其他水印请沿其拖动涂抹')
        : '尚未选择区域，请在图片上拖动框选水印';
      if (brushCanvas) {
        const brushContext = brushCanvas.getContext('2d');
        brushContext.clearRect(0, 0, brushCanvas.width, brushCanvas.height);
        if (toolState.watermarkMode === 'full' && toolState.watermarkBrushStrokes.length) {
          brushContext.strokeStyle = 'rgba(212,135,67,.78)';
          brushContext.fillStyle = 'rgba(212,135,67,.16)';
          brushContext.lineWidth = Math.max(18, Math.round(brushCanvas.width * 0.018));
          brushContext.lineCap = 'round'; brushContext.lineJoin = 'round';
          for (const stroke of toolState.watermarkBrushStrokes) {
            if (!stroke.length) continue;
            brushContext.beginPath();
            stroke.forEach((point, index) => { const x = point.x / preview.sourceWidth * preview.width; const y = point.y / preview.sourceHeight * preview.height; if (!index) brushContext.moveTo(x, y); else brushContext.lineTo(x, y); });
            brushContext.stroke();
          }
        }
      }
      return;
    }
    const left = Math.max(0, Math.min(100, selection.x / preview.sourceWidth * 100));
    const top = Math.max(0, Math.min(100, selection.y / preview.sourceHeight * 100));
    const width = Math.max(0, Math.min(100 - left, selection.width / preview.sourceWidth * 100));
    const height = Math.max(0, Math.min(100 - top, selection.height / preview.sourceHeight * 100));
    box.style.left = `${left}%`;
    box.style.top = `${top}%`;
    box.style.width = `${width}%`;
    box.style.height = `${height}%`;
    box.hidden = false;
    editor?.classList.add('has-selection');
    meta.textContent = `已框选 ${Math.round(selection.width)} × ${Math.round(selection.height)} px 水印区域，可拖动重新选择`;
  }
  async function renderWatermarkPreview(value) {
    const editor = $('#watermark-editor');
    const canvas = $('#watermarkCanvas');
    if (!editor || !canvas) return;
    editor.hidden = true;
    toolState.watermarkPreview = null;
    toolState.watermarkSelection = null;
    renderWatermarkSelection();
    if (!(value instanceof Blob)) {
      updateReady('watermark-removal');
      return;
    }
    try {
      const decoded = await decodeImage(value);
      const source = decoded.image;
      const maxPreview = 1400;
      const previewScale = Math.min(1, maxPreview / Math.max(source.width, source.height));
      const width = Math.max(1, Math.round(source.width * previewScale));
      const height = Math.max(1, Math.round(source.height * previewScale));
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(source, 0, 0, width, height);
      const brushCanvas = $('#watermarkBrushCanvas');
      if (brushCanvas) { brushCanvas.width = width; brushCanvas.height = height; }
      toolState.watermarkPreview = { sourceWidth: source.width, sourceHeight: source.height, width, height };
      editor.hidden = false;
      renderWatermarkSelection();
      releaseImage(decoded);
      updateReady('watermark-removal');
    } catch (error) {
      editor.hidden = true;
      showToast('图片预览失败，请重新选择 JPG 或 PNG 文件。');
      updateReady('watermark-removal');
    }
  }
  function bindWatermarkEditor() {
    const canvas = $('#watermarkCanvas');
    if (!canvas) return;
    let drag = null;
    const pointFromEvent = (event) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(canvas.width, (event.clientX - rect.left) * canvas.width / Math.max(1, rect.width))),
        y: Math.max(0, Math.min(canvas.height, (event.clientY - rect.top) * canvas.height / Math.max(1, rect.height)))
      };
    };
    const addBrushPoint = (event) => {
      if (!drag || !toolState.watermarkPreview || toolState.watermarkMode !== 'full') return;
      const point = pointFromEvent(event);
      const preview = toolState.watermarkPreview;
      const converted = { x: point.x / preview.width * preview.sourceWidth, y: point.y / preview.height * preview.sourceHeight };
      const stroke = toolState.watermarkBrushStrokes[toolState.watermarkBrushStrokes.length - 1];
      if (stroke && (!stroke.length || Math.hypot(converted.x - stroke[stroke.length - 1].x, converted.y - stroke[stroke.length - 1].y) > 4)) stroke.push(converted);
      renderWatermarkSelection();
    };
    const updateDrag = (event) => {
      if (drag?.brush) { addBrushPoint(event); return; }
      if (!drag || !toolState.watermarkPreview) return;
      const point = pointFromEvent(event);
      const x = Math.min(drag.start.x, point.x);
      const y = Math.min(drag.start.y, point.y);
      const width = Math.abs(point.x - drag.start.x);
      const height = Math.abs(point.y - drag.start.y);
      if (width < 2 || height < 2) {
        toolState.watermarkSelection = null;
      } else {
        const preview = toolState.watermarkPreview;
        toolState.watermarkSelection = {
          x: Math.round(x / preview.width * preview.sourceWidth),
          y: Math.round(y / preview.height * preview.sourceHeight),
          width: Math.max(1, Math.round(width / preview.width * preview.sourceWidth)),
          height: Math.max(1, Math.round(height / preview.height * preview.sourceHeight))
        };
      }
      renderWatermarkSelection();
      updateReady('watermark-removal');
    };
    canvas.addEventListener('pointerdown', (event) => {
      if (!toolState.watermarkPreview) return;
      event.preventDefault();
      canvas.setPointerCapture?.(event.pointerId);
      if (toolState.watermarkMode === 'full') {
        drag = { brush: true };
        toolState.watermarkBrushStrokes.push([]);
        addBrushPoint(event);
        updateReady('watermark-removal');
        return;
      }
      drag = { start: pointFromEvent(event) };
      toolState.watermarkSelection = null;
      renderWatermarkSelection();
      updateReady('watermark-removal');
    });
    canvas.addEventListener('pointermove', (event) => { if (drag) { event.preventDefault(); updateDrag(event); } });
    const stopDrag = (event) => {
      if (!drag) return;
      updateDrag(event);
      if (drag.brush) {
        const lastStroke = toolState.watermarkBrushStrokes[toolState.watermarkBrushStrokes.length - 1];
        if (!lastStroke?.length) toolState.watermarkBrushStrokes.pop();
        showToast('已添加涂抹区域，点击“开始去水印”生成结果。');
      } else if (!toolState.watermarkSelection) showToast('请框选水印区域后再开始处理。');
      drag = null;
      canvas.releasePointerCapture?.(event.pointerId);
    };
    canvas.addEventListener('pointerup', stopDrag);
    canvas.addEventListener('pointercancel', (event) => { const lastStroke = toolState.watermarkBrushStrokes[toolState.watermarkBrushStrokes.length - 1]; if (drag?.brush && !lastStroke?.length) toolState.watermarkBrushStrokes.pop(); drag = null; canvas.releasePointerCapture?.(event.pointerId); });
  }
  function setWatermarkMode(mode) {
    const nextMode = mode === 'full' ? 'full' : 'local';
    if (nextMode !== toolState.watermarkMode) toolState.watermarkBrushStrokes = [];
    toolState.watermarkMode = nextMode;
    const page = pageFor('watermark-removal');
    page?.classList.toggle('full-watermark-mode', toolState.watermarkMode === 'full');
    const heading = $('.watermark-editor-heading b', page);
    if (heading) heading.textContent = toolState.watermarkMode === 'full' ? '预览满屏水印（可涂抹残留标记）' : '框选水印区域';
    $$('.watermark-mode-option', page).forEach((button) => {
      const selected = button.dataset.watermarkMode === toolState.watermarkMode;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-checked', selected ? 'true' : 'false');
    });
    if (toolState.watermarkMode === 'full') toolState.watermarkSelection = null;
    renderWatermarkSelection();
    updateReady('watermark-removal');
  }
  function bindWatermarkMode() {
    const page = pageFor('watermark-removal');
    $$('.watermark-mode-option', page).forEach((button) => button.addEventListener('click', () => setWatermarkMode(button.dataset.watermarkMode)));
    setWatermarkMode(toolState.watermarkMode);
  }
  function sceneRetouchCanvas(decoded) {
    const canvas = fitImageCanvas(decoded, 2600);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const source = image.data;
    const width = canvas.width;
    const height = canvas.height;
    const pixelCount = width * height;
    const luminance = new Uint8Array(pixelCount);
    const histogram = new Uint32Array(256);
    let sums = [0, 0, 0];
    for (let i = 0, p = 0; i < source.length; i += 4, p += 1) {
      const r = source[i]; const g = source[i + 1]; const b = source[i + 2];
      luminance[p] = Math.max(0, Math.min(255, Math.round(r * 0.2126 + g * 0.7152 + b * 0.0722)));
      histogram[luminance[p]] += 1;
      sums[0] += r; sums[1] += g; sums[2] += b;
    }
    const percentile = (ratio) => {
      const target = pixelCount * ratio;
      let total = 0;
      for (let value = 0; value < histogram.length; value += 1) { total += histogram[value]; if (total >= target) return value; }
      return 255;
    };
    const low = percentile(0.02);
    const high = Math.max(low + 1, percentile(0.98));
    const average = sums.map((value) => value / pixelCount);
    // Keep the original warm hotel ambience while correcting only a modest
    // green/magenta or blue/yellow cast (gray-world gains are capped tightly).
    const neutral = (average[0] + average[1] + average[2]) / 3;
    const gains = average.map((value) => Math.max(0.94, Math.min(1.06, neutral / Math.max(1, value))));
    const enhanced = new Uint8ClampedArray(source);
    const clampByte = (value) => Math.max(0, Math.min(255, Math.round(value)));
    for (let i = 0, p = 0; i < source.length; i += 4, p += 1) {
      const luma = luminance[p];
      const tone = Math.max(0, Math.min(1, (luma - low) / (high - low)));
      // A restrained lift opens underexposed phone photos without washing out
      // warm lamps or the neutral whites common in hotel bathrooms.
      const exposure = 0.9 + tone * 0.16;
      const r = source[i] * gains[0] * exposure;
      const g = source[i + 1] * gains[1] * exposure;
      const b = source[i + 2] * gains[2] * exposure;
      const nextLuma = r * 0.2126 + g * 0.7152 + b * 0.0722;
      const saturation = 1.08;
      enhanced[i] = clampByte(nextLuma + (r - nextLuma) * saturation);
      enhanced[i + 1] = clampByte(nextLuma + (g - nextLuma) * saturation);
      enhanced[i + 2] = clampByte(nextLuma + (b - nextLuma) * saturation);
      enhanced[i + 3] = source[i + 3];
    }
    /*
     * Local clean-up pass. A small Gaussian reference is used only where the
     * source is a low-texture surface. This suppresses water spots, glass
     * specks and fine bedding creases, while the edge test protects grout,
     * taps, furniture silhouettes and printed details from being blurred.
     */
    const softCanvas = makeCanvas(width, height);
    const softContext = softCanvas.getContext('2d', { willReadFrequently: true });
    const enhancedCanvas = makeCanvas(width, height);
    enhancedCanvas.getContext('2d').putImageData(new ImageData(enhanced, width, height), 0, 0);
    softContext.filter = 'blur(1.8px)';
    softContext.drawImage(enhancedCanvas, 0, 0);
    const softened = softContext.getImageData(0, 0, width, height).data;
    const cleaned = new Uint8ClampedArray(enhanced);
    const lumaFrom = (data, index) => data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
    for (let y = 1; y < height - 1; y += 1) for (let x = 1; x < width - 1; x += 1) {
      const index = (y * width + x) * 4;
      const centerLuma = lumaFrom(enhanced, index);
      const softLuma = lumaFrom(softened, index);
      const texture = Math.abs(centerLuma - softLuma);
      const left = lumaFrom(enhanced, index - 4);
      const right = lumaFrom(enhanced, index + 4);
      const top = lumaFrom(enhanced, index - width * 4);
      const bottom = lumaFrom(enhanced, index + width * 4);
      const edge = Math.max(Math.abs(centerLuma - left), Math.abs(centerLuma - right), Math.abs(centerLuma - top), Math.abs(centerLuma - bottom));
      const chroma = Math.max(enhanced[index], enhanced[index + 1], enhanced[index + 2]) - Math.min(enhanced[index], enhanced[index + 1], enhanced[index + 2]);
      // Neutral/light surfaces (countertops, glass, white bedding) receive a
      // little more smoothing because their stains and creases are easiest to
      // identify as local luminance deviations.
      const neutralSurface = chroma < 58 && centerLuma > 92;
      if (texture < (neutralSurface ? 7 : 10) || edge > (neutralSurface ? 48 : 38)) continue;
      const strength = Math.max(0.16, Math.min(neutralSurface ? 0.58 : 0.42, (texture - 5) / 34));
      cleaned[index] = clampByte(enhanced[index] * (1 - strength) + softened[index] * strength);
      cleaned[index + 1] = clampByte(enhanced[index + 1] * (1 - strength) + softened[index + 1] * strength);
      cleaned[index + 2] = clampByte(enhanced[index + 2] * (1 - strength) + softened[index + 2] * strength);
    }
    // Median cleanup targets isolated dark/light flecks left by phone noise,
    // water droplets and dusty glass. It is applied only on even surfaces.
    const denoised = new Uint8ClampedArray(cleaned);
    const cleanedLuma = new Uint8Array(pixelCount);
    for (let i = 0, p = 0; i < cleaned.length; i += 4, p += 1) cleanedLuma[p] = clampByte(lumaFrom(cleaned, i));
    for (let y = 1; y < height - 1; y += 1) for (let x = 1; x < width - 1; x += 1) {
      const p = y * width + x;
      const neighbors = [cleanedLuma[p - width - 1], cleanedLuma[p - width], cleanedLuma[p - width + 1], cleanedLuma[p - 1], cleanedLuma[p + 1], cleanedLuma[p + width - 1], cleanedLuma[p + width], cleanedLuma[p + width + 1]];
      neighbors.sort((a, b) => a - b);
      const middle = neighbors[3];
      const spread = neighbors[6] - neighbors[1];
      if (spread > 42 || Math.abs(cleanedLuma[p] - middle) < 18) continue;
      const index = p * 4;
      let red = 0; let green = 0; let blue = 0;
      for (let oy = -1; oy <= 1; oy += 1) for (let ox = -1; ox <= 1; ox += 1) {
        if (!ox && !oy) continue;
        const neighbor = ((y + oy) * width + x + ox) * 4;
        red += cleaned[neighbor]; green += cleaned[neighbor + 1]; blue += cleaned[neighbor + 2];
      }
      const blend = Math.min(0.78, 0.48 + Math.abs(cleanedLuma[p] - middle) / 100);
      denoised[index] = clampByte(cleaned[index] * (1 - blend) + red / 8 * blend);
      denoised[index + 1] = clampByte(cleaned[index + 1] * (1 - blend) + green / 8 * blend);
      denoised[index + 2] = clampByte(cleaned[index + 2] * (1 - blend) + blue / 8 * blend);
    }
    // A restrained unsharp pass restores crisp edges after stain/crease
    // suppression without introducing halos around furniture or text.
    const sharpened = new Uint8ClampedArray(denoised);
    for (let y = 1; y < height - 1; y += 1) for (let x = 1; x < width - 1; x += 1) {
      const center = (y * width + x) * 4;
      const centerLuma = lumaFrom(denoised, center);
      const averageLuma = (lumaFrom(denoised, center - width * 4) + lumaFrom(denoised, center + width * 4) + lumaFrom(denoised, center - 4) + lumaFrom(denoised, center + 4)) / 4;
      const amount = Math.abs(centerLuma - averageLuma) > 18 ? 0.24 : 0.12;
      for (let channel = 0; channel < 3; channel += 1) {
        const average = (denoised[center - width * 4 + channel] + denoised[center + width * 4 + channel] + denoised[center - 4 + channel] + denoised[center + 4 + channel]) / 4;
        sharpened[center + channel] = clampByte(denoised[center + channel] + (denoised[center + channel] - average) * amount);
      }
    }
    context.putImageData(new ImageData(sharpened, width, height), 0, 0);
    return canvas;
  }
  function removeWatermarkCanvas(decoded, selection) {
    if (!selection) throw new Error('请先在图片上框选水印区域。');
    const canvas = fitImageCanvas(decoded, 3200);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = image.data;
    const scale = Math.min(canvas.width / decoded.image.width, canvas.height / decoded.image.height);
    // Slightly include the edge of the selection so antialiased watermark
    // pixels are not left behind.  The untouched image is never modified.
    const x0 = Math.max(0, Math.min(canvas.width - 1, Math.floor(selection.x * scale) - 1));
    const y0 = Math.max(0, Math.min(canvas.height - 1, Math.floor(selection.y * scale) - 1));
    const x1 = Math.max(x0, Math.min(canvas.width - 1, Math.ceil((selection.x + selection.width) * scale) + 1));
    const y1 = Math.max(y0, Math.min(canvas.height - 1, Math.ceil((selection.y + selection.height) * scale) + 1));
    const sample = (x, y, channel) => pixels[(y * canvas.width + x) * 4 + channel];
    const colorDistance = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
    const repaired = new Uint8ClampedArray(pixels);
    const put = (x, y, rgb) => {
      const index = (y * canvas.width + x) * 4;
      repaired[index] = Math.max(0, Math.min(255, Math.round(rgb[0])));
      repaired[index + 1] = Math.max(0, Math.min(255, Math.round(rgb[1])));
      repaired[index + 2] = Math.max(0, Math.min(255, Math.round(rgb[2])));
      repaired[index + 3] = pixels[index + 3];
    };
    for (let y = y0; y <= y1; y += 1) for (let x = x0; x <= x1; x += 1) {
      const horizontal = [];
      const vertical = [];
      if (x0 > 0 && x1 < canvas.width - 1) {
        const left = [sample(x0 - 1, y, 0), sample(x0 - 1, y, 1), sample(x0 - 1, y, 2)];
        const right = [sample(x1 + 1, y, 0), sample(x1 + 1, y, 1), sample(x1 + 1, y, 2)];
        const t = (x - x0 + 1) / (x1 - x0 + 2);
        horizontal.push([left[0] * (1 - t) + right[0] * t, left[1] * (1 - t) + right[1] * t, left[2] * (1 - t) + right[2] * t], colorDistance(left, right));
      }
      if (y0 > 0 && y1 < canvas.height - 1) {
        const top = [sample(x, y0 - 1, 0), sample(x, y0 - 1, 1), sample(x, y0 - 1, 2)];
        const bottom = [sample(x, y1 + 1, 0), sample(x, y1 + 1, 1), sample(x, y1 + 1, 2)];
        const t = (y - y0 + 1) / (y1 - y0 + 2);
        vertical.push([top[0] * (1 - t) + bottom[0] * t, top[1] * (1 - t) + bottom[1] * t, top[2] * (1 - t) + bottom[2] * t], colorDistance(top, bottom));
      }
      let candidate;
      if (horizontal.length && vertical.length) candidate = horizontal[1] <= vertical[1] ? horizontal[0] : vertical[0];
      else if (horizontal.length) candidate = horizontal[0];
      else if (vertical.length) candidate = vertical[0];
      else {
        const nearestX = x0 > 0 ? x0 - 1 : Math.min(canvas.width - 1, x1 + 1);
        const nearestY = y0 > 0 ? y0 - 1 : Math.min(canvas.height - 1, y1 + 1);
        candidate = [sample(nearestX, y, 0), sample(nearestX, y, 1), sample(nearestX, y, 2)];
        if (x0 === x1 && y0 === y1) candidate = [sample(nearestX, nearestY, 0), sample(nearestX, nearestY, 1), sample(nearestX, nearestY, 2)];
      }
      put(x, y, candidate);
    }
    context.putImageData(new ImageData(repaired, canvas.width, canvas.height), 0, 0);
    return canvas;
  }

  // Lightweight, dependency-free equivalent of the consensus stage used by
  // the open-source watermark removers.  A full-screen mark is normally a
  // repeated glyph/logo (often laid out on a grid) rather than a single line.
  // We look for neutral high-frequency pixels that recur at the same x/y
  // period, then only repair those pixels.  This keeps real hotel details out
  // of the mask and works in the browser/Electron build without OpenCV or a
  // downloaded model.
  function detectRepeatedWatermarkMask(canvas, sourceData) {
    const sourceWidth = canvas.width;
    const sourceHeight = canvas.height;
    const analysisMax = 560;
    const scale = Math.min(1, analysisMax / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const probe = makeCanvas(width, height);
    probe.getContext('2d').drawImage(canvas, 0, 0, width, height);
    const rgba = probe.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, width, height).data;
    const count = width * height;
    const highpass = new Float32Array(count);
    const feature = new Float32Array(count);
    const candidate = new Uint8Array(count);
    for (let y = 1; y < height - 1; y += 1) for (let x = 1; x < width - 1; x += 1) {
      const p = y * width + x;
      const index = p * 4;
      const lum = rgba[index] * 0.2126 + rgba[index + 1] * 0.7152 + rgba[index + 2] * 0.0722;
      const left = (p - 1) * 4;
      const right = (p + 1) * 4;
      const top = (p - width) * 4;
      const bottom = (p + width) * 4;
      const cross = (rgba[left] * 0.2126 + rgba[left + 1] * 0.7152 + rgba[left + 2] * 0.0722
        + rgba[right] * 0.2126 + rgba[right + 1] * 0.7152 + rgba[right + 2] * 0.0722
        + rgba[top] * 0.2126 + rgba[top + 1] * 0.7152 + rgba[top + 2] * 0.0722
        + rgba[bottom] * 0.2126 + rgba[bottom + 1] * 0.7152 + rgba[bottom + 2] * 0.0722) / 4;
      const hp = lum - cross;
      const gx = Math.abs((rgba[right] * 0.2126 + rgba[right + 1] * 0.7152 + rgba[right + 2] * 0.0722)
        - (rgba[left] * 0.2126 + rgba[left + 1] * 0.7152 + rgba[left + 2] * 0.0722));
      const gy = Math.abs((rgba[bottom] * 0.2126 + rgba[bottom + 1] * 0.7152 + rgba[bottom + 2] * 0.0722)
        - (rgba[top] * 0.2126 + rgba[top + 1] * 0.7152 + rgba[top + 2] * 0.0722));
      const chroma = Math.max(rgba[index], rgba[index + 1], rgba[index + 2]) - Math.min(rgba[index], rgba[index + 1], rgba[index + 2]);
      const magnitude = Math.abs(hp);
      // Semi-transparent stock marks are commonly neutral white/grey.  The
      // luminance range keeps very dark, highly saturated room objects out.
      const neutral = chroma < 58;
      const edge = Math.max(gx, gy, magnitude);
      if (neutral && edge > 3.2 && magnitude > 2.6 && lum > 42 && lum < 252) {
        candidate[p] = 1;
        highpass[p] = hp;
        feature[p] = Math.min(48, magnitude + (gx + gy) * 0.22);
      }
    }
    const morph = (input, radius, dilate) => {
      const output = new Uint8Array(count);
      const r = Math.max(0, Math.round(radius));
      if (!r) return input.slice();
      for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
        let hit = dilate ? 0 : 1;
        for (let oy = -r; oy <= r; oy += 1) for (let ox = -r; ox <= r; ox += 1) {
          if (ox * ox + oy * oy > r * r) continue;
          const nx = x + ox; const ny = y + oy;
          const inside = nx >= 0 && nx < width && ny >= 0 && ny < height;
          const value = inside ? input[ny * width + nx] : 0;
          if (dilate) { if (value) { hit = 1; break; } }
          else if (!value) { hit = 0; break; }
        }
        output[y * width + x] = hit;
      }
      return output;
    };
    const autocorrelation = (axis) => {
      const diagonal = axis === 'diag-down' || axis === 'diag-up';
      const dimension = diagonal ? Math.min(width, height) : axis === 'x' ? width : height;
      const other = axis === 'x' ? height : width;
      const minLag = Math.max(18, Math.round(dimension * 0.065));
      const maxLag = Math.max(minLag + 4, Math.floor(dimension * 0.72));
      const stride = 2;
      const scores = [];
      for (let lag = minLag; lag <= maxLag; lag += 2) {
        let dot = 0; let energyA = 0; let energyB = 0; let overlap = 0;
        if (axis === 'x') {
          for (let y = 1; y < height - 1; y += stride) for (let x = 1; x + lag < width - 1; x += stride) {
            const a = feature[y * width + x]; const b = feature[y * width + x + lag];
            if (!a || !b) continue;
            dot += a * b; energyA += a * a; energyB += b * b; overlap += 1;
          }
        } else if (axis === 'y') {
          for (let y = 1; y + lag < height - 1; y += stride) for (let x = 1; x < width - 1; x += stride) {
            const a = feature[y * width + x]; const b = feature[(y + lag) * width + x];
            if (!a || !b) continue;
            dot += a * b; energyA += a * a; energyB += b * b; overlap += 1;
          }
        } else {
          const directionY = axis === 'diag-down' ? 1 : -1;
          for (let y = 1; y + lag * directionY < height - 1 && y + lag * directionY > 0; y += stride) for (let x = 1; x + lag < width - 1; x += stride) {
            const nx = x + lag; const ny = y + lag * directionY;
            if (ny < 1 || ny >= height - 1) continue;
            const a = feature[y * width + x]; const b = feature[ny * width + nx];
            if (!a || !b) continue;
            dot += a * b; energyA += a * a; energyB += b * b; overlap += 1;
          }
        }
        const score = overlap > 20 ? dot / Math.sqrt(Math.max(1, energyA * energyB)) : 0;
        scores.push({ lag, score, overlap });
      }
      if (!scores.length) return [];
      const baselineValues = scores.map((item) => item.score).sort((a, b) => a - b);
      const baseline = baselineValues[Math.floor(baselineValues.length * 0.5)] || 0;
      const peaks = scores.filter((item, index) => item.score >= (scores[index - 1]?.score || 0)
        && item.score >= (scores[index + 1]?.score || 0)
        && item.score > Math.max(0.09, baseline * 1.32, baseline + 0.012)
        && item.overlap > 24).sort((a, b) => b.score - a.score);
      const selected = [];
      for (const peak of peaks) {
        if (selected.some((item) => Math.abs(item.lag - peak.lag) < minLag * 0.22
          || Math.abs(item.lag - peak.lag * 2) < minLag * 0.18
          || Math.abs(item.lag * 2 - peak.lag) < minLag * 0.18)) continue;
        selected.push(peak);
        if (selected.length >= 2) break;
      }
      return selected;
    };
    const xPeriods = autocorrelation('x');
    const yPeriods = autocorrelation('y');
    const diagonalDownPeriods = autocorrelation('diag-down');
    const diagonalUpPeriods = autocorrelation('diag-up');
    const periods = [];
    xPeriods.forEach((item) => periods.push({ axis: 'x', ...item }));
    yPeriods.forEach((item) => periods.push({ axis: 'y', ...item }));
    diagonalDownPeriods.forEach((item) => periods.push({ axis: 'diag-down', ...item }));
    diagonalUpPeriods.forEach((item) => periods.push({ axis: 'diag-up', ...item }));
    const lowMask = new Uint8Array(count);
    for (const period of periods) {
      const lag = period.lag;
      for (let y = 1; y < height - 1; y += 1) for (let x = 1; x < width - 1; x += 1) {
        const p = y * width + x;
        if (!candidate[p] || feature[p] < 3) continue;
        let support = 0;
        const directionY = period.axis === 'diag-up' ? -1 : 1;
        const offsets = period.axis === 'x' ? [[-lag, 0], [lag, 0], [-lag * 2, 0], [lag * 2, 0]]
          : period.axis === 'y' ? [[0, -lag], [0, lag], [0, -lag * 2], [0, lag * 2]]
            : [[-lag, -directionY * lag], [lag, directionY * lag], [-lag * 2, -directionY * lag * 2], [lag * 2, directionY * lag * 2]];
        for (const [ox, oy] of offsets) {
          const nx = x + ox; const ny = y + oy;
          if (nx < 1 || nx >= width - 1 || ny < 1 || ny >= height - 1) continue;
          const neighbor = ny * width + nx;
          if (!candidate[neighbor] || !feature[neighbor]) continue;
          const signAgree = highpass[p] * highpass[neighbor] >= -1.5;
          const similar = Math.abs(feature[p] - feature[neighbor]) < Math.max(5, Math.max(feature[p], feature[neighbor]) * 0.72);
          if (signAgree && similar) support += 1;
        }
        if (support >= 1) lowMask[p] = 1;
      }
    }
    // Connect anti-aliased glyph strokes, but keep the radius small relative
    // to the detected repeat period so neighbouring objects are not merged.
    const expanded = morph(lowMask, Math.max(1, Math.min(3, Math.round(2.5 * scale))), true);
    const closed = morph(morph(expanded, 1, false), 1, true);
    let marked = 0;
    for (let i = 0; i < closed.length; i += 1) marked += closed[i];
    const coverage = marked / Math.max(1, count);
    // A natural photograph can contain isolated periodic edges by chance;
    // require a meaningful repeated area before changing any pixels.
    if (!periods.length || coverage < 0.0012) return { mask: null, coverage: 0, periods: [] };
    const mask = new Uint8Array(sourceWidth * sourceHeight);
    for (let y = 0; y < sourceHeight; y += 1) {
      const ly = Math.min(height - 1, Math.floor(y * scale));
      for (let x = 0; x < sourceWidth; x += 1) {
        const lx = Math.min(width - 1, Math.floor(x * scale));
        if (closed[ly * width + lx]) mask[y * sourceWidth + x] = 1;
      }
    }
    let fullMarked = 0;
    for (let i = 0; i < mask.length; i += 1) fullMarked += mask[i];
    return { mask, coverage: fullMarked / Math.max(1, mask.length), periods };
  }

  function repairWatermarkMask(working, mask, width, height) {
    if (!mask) return working;
    const source = new Uint8ClampedArray(working);
    const output = new Uint8ClampedArray(working);
    const maxRadius = Math.max(18, Math.min(110, Math.round(Math.min(width, height) * 0.055)));
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
    const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));
    const pixelDistance = (a, b) => Math.abs(source[a] - source[b]) + Math.abs(source[a + 1] - source[b + 1]) + Math.abs(source[a + 2] - source[b + 2]);
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
      const p = y * width + x;
      if (!mask[p]) continue;
      const pairs = [];
      const directionPairs = [
        [[1, 0], [-1, 0]],
        [[0, 1], [0, -1]],
        [[1, 1], [-1, -1]],
        [[1, -1], [-1, 1]]
      ];
      for (const [[dx, dy], opposite] of directionPairs) {
        let first = -1; let second = -1;
        for (let radius = 5; radius <= maxRadius; radius += 5) {
          const nx = x + dx * radius; const ny = y + dy * radius;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const np = ny * width + nx;
            if (!mask[np]) { first = np * 4; break; }
          }
        }
        for (let radius = 5; radius <= maxRadius; radius += 5) {
          const nx = x + opposite[0] * radius; const ny = y + opposite[1] * radius;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const np = ny * width + nx;
            if (!mask[np]) { second = np * 4; break; }
          }
        }
        if (first >= 0 && second >= 0) {
          pairs.push({ score: pixelDistance(first, second), rgb: [(source[first] + source[second]) / 2, (source[first + 1] + source[second + 1]) / 2, (source[first + 2] + source[second + 2]) / 2] });
        }
      }
      let rgb;
      if (pairs.length) {
        pairs.sort((a, b) => a.score - b.score);
        const chosen = pairs.slice(0, Math.min(3, pairs.length));
        rgb = chosen.reduce((sum, item) => [sum[0] + item.rgb[0], sum[1] + item.rgb[1], sum[2] + item.rgb[2]], [0, 0, 0]).map((value) => value / chosen.length);
      } else {
        const samples = [];
        for (const [dx, dy] of directions) {
          const nx = Math.max(0, Math.min(width - 1, x + dx * 8)); const ny = Math.max(0, Math.min(height - 1, y + dy * 8));
          const np = ny * width + nx;
          if (!mask[np]) { const index = np * 4; samples.push([source[index], source[index + 1], source[index + 2]]); }
        }
        if (!samples.length) continue;
        rgb = samples.reduce((sum, item) => [sum[0] + item[0], sum[1] + item[1], sum[2] + item[2]], [0, 0, 0]).map((value) => value / samples.length);
      }
      const index = p * 4;
      output[index] = clamp(rgb[0]); output[index + 1] = clamp(rgb[1]); output[index + 2] = clamp(rgb[2]);
    }
    return output;
  }

  function removeFullScreenWatermarkCanvas(decoded, manualStrokes = []) {
    const canvas = fitImageCanvas(decoded, 2600);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;
    /*
     * Full-screen stock watermarks are usually a transparent, repeated
     * diagonal grid.  The previous implementation median-filtered every
     * pixel in two directions, which was both slow and unable to lock onto
     * the grid phase (so faint lines remained).  We first run a small Hough-
     * style accumulator on a 620px analysis copy.  Only lines that have the
     * same angle and repeat at least three times are accepted.  The accepted
     * lines are then repaired with a short cross-line interpolation on the
     * original-size canvas; text, products and scenery away from the detected
     * lines are left untouched.
     */
    /*
     * The 620px Hough pass is intentionally conservative, but very pale
     * stock grids disappear after the browser resizes the image: their
     * individual gradient peaks are often only 1–4 levels above the local
     * background.  This companion detector scores complete candidate lines
     * instead of isolated pixels.  A real watermark line has support along a
     * large portion of the same diagonal, and several such lines share one
     * repeat period; furniture, text and product edges usually do not.
     */
    const detectFaintGridFamily = (sign) => {
      const detectMax = 620;
      const detectScale = Math.min(1, detectMax / Math.max(width, height));
      const dw = Math.max(1, Math.round(width * detectScale));
      const dh = Math.max(1, Math.round(height * detectScale));
      const probe = makeCanvas(dw, dh);
      const probeContext = probe.getContext('2d', { willReadFrequently: true });
      probeContext.drawImage(canvas, 0, 0, dw, dh);
      const rgba = probeContext.getImageData(0, 0, dw, dh).data;
      const gray = new Float32Array(dw * dh);
      for (let i = 0, p = 0; i < rgba.length; i += 4, p += 1) gray[p] = rgba[i] * 0.2126 + rgba[i + 1] * 0.7152 + rgba[i + 2] * 0.0722;
      const gx = new Float32Array(gray.length);
      const gy = new Float32Array(gray.length);
      for (let y = 1; y < dh - 1; y += 1) for (let x = 1; x < dw - 1; x += 1) {
        const p = y * dw + x;
        gx[p] = (gray[p + 1] - gray[p - 1]) * 0.5;
        gy[p] = (gray[p + dw] - gray[p - dw]) * 0.5;
      }
      const magAt = (x, y) => {
        const p = y * dw + x;
        return Math.hypot(gx[p], gy[p]);
      };
      let best = null;
      for (let m = 0.68; m <= 1.28; m += 0.02) {
        const normalLength = Math.hypot(m, 1);
        const normalX = -sign * m / normalLength;
        const normalY = 1 / normalLength;
        const minCoordinate = Math.floor(Math.min(0, -sign * m * (dw - 1))) + 2;
        const maxCoordinate = Math.ceil(Math.max(dh - 1, dh - 1 - sign * m * (dw - 1))) - 2;
        const lineScores = [];
        for (let coordinate = minCoordinate; coordinate <= maxCoordinate; coordinate += 1) {
          let supported = 0;
          let total = 0;
          let strength = 0;
          for (let x = 3; x < dw - 3; x += 3) {
            const y = Math.round(coordinate + sign * m * x);
            if (y < 2 || y >= dh - 2) continue;
            total += 1;
            const p = y * dw + x;
            const magnitude = magAt(x, y);
            const aligned = Math.abs(gx[p] * normalX + gy[p] * normalY);
            // Keep this below the old pixel threshold.  The repeat-period
            // check below supplies the false-positive guard for photographs.
            if (magnitude > 1.05 && aligned > magnitude * 0.58) {
              supported += 1;
              strength += Math.min(18, aligned);
            }
          }
          if (total >= 38 && supported >= 8) {
            const coverage = supported / total;
            const meanStrength = strength / supported;
            // Coverage is the primary signal; a small strength bonus helps
            // separate a faint continuous line from scattered texture.
            lineScores.push({ coordinate, coverage, meanStrength, score: coverage * (0.38 + Math.min(1, meanStrength / 4)) });
          } else lineScores.push({ coordinate, coverage: 0, meanStrength: 0, score: 0 });
        }
        const smooth = lineScores.map((item, index) => index > 0 && index + 1 < lineScores.length
          ? (lineScores[index - 1].score + item.score + lineScores[index + 1].score) / 3
          : item.score);
        const values = smooth.filter((value) => value > 0).sort((a, b) => a - b);
        if (values.length < 12) continue;
        const baseline = values[Math.floor(values.length * 0.5)] || 0;
        const threshold = Math.max(baseline * 2.05, baseline + 0.19);
        const peaks = [];
        for (let index = 2; index < smooth.length - 2; index += 1) {
          if (smooth[index] <= threshold || smooth[index] < smooth[index - 1] || smooth[index] < smooth[index + 1]) continue;
          peaks.push({
            coordinate: lineScores[index].coordinate,
            strength: smooth[index],
            coverage: lineScores[index].coverage,
            meanStrength: lineScores[index].meanStrength
          });
        }
        peaks.sort((a, b) => b.strength - a.strength);
        const selected = [];
        for (const peak of peaks) {
          if (selected.some((item) => Math.abs(item.coordinate - peak.coordinate) <= 8)) continue;
          selected.push(peak);
          if (selected.length >= 64) break;
        }
        if (selected.length < 3) continue;
        const ordered = selected.slice().sort((a, b) => a.coordinate - b.coordinate);
        const minPeriod = Math.max(150, Math.round(Math.min(dw, dh) * 0.24));
        const maxPeriod = Math.min(Math.round(Math.max(dw, dh) * 0.7), 360);
        let familyBest = null;
        for (let a = 0; a < ordered.length; a += 1) for (let b = a + 1; b < ordered.length; b += 1) {
          const period = ordered[b].coordinate - ordered[a].coordinate;
          if (period < minPeriod || period > maxPeriod) continue;
          const tolerance = Math.max(7, period * 0.045);
          const anchor = ordered[a].coordinate;
          const alignedCenters = ordered.filter((item) => {
            const remainder = Math.abs(((item.coordinate - anchor + period / 2) % period + period) % period - period / 2);
            return remainder <= tolerance;
          });
          if (alignedCenters.length < 3) continue;
          const averageStrength = alignedCenters.reduce((sum, item) => sum + item.strength, 0) / alignedCenters.length;
          const candidateScore = alignedCenters.length * 3 + averageStrength * 7;
          if (!familyBest || candidateScore > familyBest.score) familyBest = { period, anchor, alignedCenters, score: candidateScore, averageStrength };
        }
        if (!familyBest) continue;
        // Prefer the strongest repeated family across angles; this prevents
        // a single long product edge from winning over three faint grid lines.
        if (!best || familyBest.score > best.score) {
          best = {
            sign,
            slope: m,
            detectScale,
            period: familyBest.period,
            anchor: familyBest.anchor,
            support: familyBest.alignedCenters.length,
            score: familyBest.score,
            faint: true
          };
        }
      }
      return best && best.support >= 3 ? best : null;
    };
    const detectGridFamily = (sign) => {
      const faint = detectFaintGridFamily(sign);
      if (faint) return faint;
      const detectMax = 620;
      const detectScale = Math.min(1, detectMax / Math.max(width, height));
      const dw = Math.max(1, Math.round(width * detectScale));
      const dh = Math.max(1, Math.round(height * detectScale));
      const probe = makeCanvas(dw, dh);
      probe.getContext('2d').drawImage(canvas, 0, 0, dw, dh);
      const rgba = probe.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, dw, dh).data;
      const gray = new Float32Array(dw * dh);
      for (let i = 0, p = 0; i < rgba.length; i += 4, p += 1) gray[p] = rgba[i] * 0.2126 + rgba[i + 1] * 0.7152 + rgba[i + 2] * 0.0722;
      const gx = new Float32Array(gray.length);
      const gy = new Float32Array(gray.length);
      for (let y = 1; y < dh - 1; y += 1) for (let x = 1; x < dw - 1; x += 1) {
        const p = y * dw + x;
        gx[p] = (gray[p + 1] - gray[p - 1]) * 0.5;
        gy[p] = (gray[p + dw] - gray[p - dw]) * 0.5;
      }
      let best = null;
      // Stock watermark grids are commonly drawn between roughly 30° and
      // 55°; keep the detector broad enough for both portrait and landscape
      // exports instead of assuming a single 45° slope.
      for (let m = 0.58; m <= 1.18; m += 0.015) {
        const offset = Math.ceil(m * dw) + 4;
        const histogram = new Float32Array(dh + offset * 2 + 8);
        const normalLength = Math.hypot(m, 1);
        const normalX = -sign * m / normalLength;
        const normalY = 1 / normalLength;
        for (let y = 2; y < dh - 2; y += 1) for (let x = 2; x < dw - 2; x += 1) {
          const p = y * dw + x;
          const magnitude = Math.hypot(gx[p], gy[p]);
          const aligned = Math.abs(gx[p] * normalX + gy[p] * normalY);
          if (magnitude < 5 || aligned < magnitude * 0.78) continue;
          const bin = Math.round(y - sign * m * x) + offset;
          histogram[bin] += Math.min(50, aligned);
        }
        const smooth = new Float32Array(histogram.length);
        const values = [];
        for (let i = 1; i < histogram.length - 1; i += 1) {
          smooth[i] = (histogram[i - 1] + histogram[i] + histogram[i + 1]) / 3;
          if (smooth[i] > 0) values.push(smooth[i]);
        }
        if (values.length < 10) continue;
        values.sort((a, b) => a - b);
        const baseline = values[Math.floor(values.length * 0.5)] || 1;
        const peakThreshold = baseline * 5;
        const peaks = [];
        for (let i = 2; i < smooth.length - 2; i += 1) {
          if (smooth[i] >= smooth[i - 1] && smooth[i] >= smooth[i + 1] && smooth[i] > peakThreshold) peaks.push(i);
        }
        peaks.sort((a, b) => smooth[b] - smooth[a]);
        const selected = peaks.slice(0, 100).sort((a, b) => a - b);
        const centers = [];
        for (const index of selected) {
          const coordinate = index - offset;
          const existing = centers[centers.length - 1];
          if (existing && Math.abs(existing.coordinate - coordinate) <= 5) {
            if (smooth[index] > existing.strength) { existing.coordinate = coordinate; existing.strength = smooth[index]; }
          } else centers.push({ coordinate, strength: smooth[index] });
        }
        if (centers.length < 3) continue;
        const pairCounts = new Map();
        for (let a = 0; a < centers.length; a += 1) for (let b = a + 1; b < centers.length; b += 1) {
          const distance = centers[b].coordinate - centers[a].coordinate;
          if (distance < Math.max(40, Math.min(dw, dh) * 0.22) || distance > Math.max(dw, dh) * 0.7) continue;
          const bucket = Math.round(distance / 4) * 4;
          pairCounts.set(bucket, (pairCounts.get(bucket) || 0) + 1);
        }
        let period = 0; let support = 0;
        pairCounts.forEach((count, candidate) => { if (count > support) { support = count; period = candidate; } });
        if (!period || support < 2) continue;
        const anchor = centers.slice().sort((a, b) => b.strength - a.strength)[0].coordinate;
        const alignedCenters = centers.filter((item) => {
          const remainder = Math.abs(((item.coordinate - anchor + period / 2) % period + period) % period - period / 2);
          return remainder <= 7;
        });
        const score = alignedCenters.length * 3 + Math.min(12, Math.max(...centers.map((item) => item.strength)) / baseline);
        if (!best || score > best.score) best = { sign, slope: m, detectScale, period, anchor, support: alignedCenters.length, score };
      }
      return best && best.support >= 3 ? best : null;
    };
    const families = [detectGridFamily(1), detectGridFamily(-1)].filter(Boolean);
    const source = new Uint8ClampedArray(image.data);
    const lumaAt = (x, y) => {
      const px = Math.max(0, Math.min(width - 1, Math.round(x)));
      const py = Math.max(0, Math.min(height - 1, Math.round(y)));
      const index = (py * width + px) * 4;
      return source[index] * 0.2126 + source[index + 1] * 0.7152 + source[index + 2] * 0.0722;
    };
    // Downscaled accumulator bins are intentionally coarse. Refine the angle,
    // phase and period against the full-size pixels so a one-pixel slope error
    // does not leave a parallel grey seam at the edge of every watermark line.
    const refineGridFamily = (family) => {
      const basePeriod = family.period / family.detectScale;
      const baseAnchor = family.anchor / family.detectScale;
      const slopeSteps = [-0.012, -0.006, 0, 0.006, 0.012];
      const periodSteps = [-0.08, -0.04, 0, 0.04, 0.08];
      const anchorSteps = [-24, -16, -8, 0, 8, 16, 24];
      let best = { score: -Infinity, slope: family.slope, period: basePeriod, anchor: baseAnchor };
      for (const slopeDelta of slopeSteps) for (const periodFactor of periodSteps) for (const anchorDelta of anchorSteps) {
        const slope = Math.max(0.6, family.slope + slopeDelta);
        const period = Math.max(24, basePeriod * (1 + periodFactor));
        const anchor = baseAnchor + anchorDelta;
        const normalLength = Math.hypot(slope, 1);
        const normalX = -family.sign * slope / normalLength;
        const normalY = 1 / normalLength;
        let score = 0; let count = 0;
        const firstLine = Math.floor((-slope * width - anchor) / period) - 1;
        const lastLine = Math.ceil((height + slope * width - anchor) / period) + 1;
        for (let line = firstLine; line <= lastLine; line += 1) {
          const coordinate = anchor + line * period;
          for (let x = 0; x < width; x += 8) {
            const y = coordinate + family.sign * slope * x;
            if (y < 1 || y >= height - 1) continue;
            const center = lumaAt(x, y);
            const sideA = lumaAt(x + normalX * 7, y + normalY * 7);
            const sideB = lumaAt(x - normalX * 7, y - normalY * 7);
            score += Math.min(70, Math.abs(center - (sideA + sideB) / 2));
            count += 1;
          }
        }
        const average = count ? score / count : 0;
        if (average > best.score) best = { score: average, slope, period, anchor };
      }
      const lineOffsets = [];
      const firstLine = Math.floor((-best.slope * width - best.anchor) / best.period) - 1;
      const lastLine = Math.ceil((height + best.slope * width - best.anchor) / best.period) + 1;
      const normalLength = Math.hypot(best.slope, 1);
      const normalX = -family.sign * best.slope / normalLength;
      const normalY = 1 / normalLength;
      let signedSignal = 0;
      let signedSamples = 0;
      for (let line = firstLine; line <= lastLine; line += 1) {
        const expected = best.anchor + line * best.period;
        let lineBest = { score: -Infinity, coordinate: expected };
        for (let delta = -30; delta <= 30; delta += 2) {
          const coordinate = expected + delta;
          let score = 0; let count = 0;
          for (let x = 0; x < width; x += 8) {
            const y = coordinate + family.sign * best.slope * x;
            if (y < 1 || y >= height - 1) continue;
            const center = lumaAt(x, y);
            const sideA = lumaAt(x + normalX * 7, y + normalY * 7);
            const sideB = lumaAt(x - normalX * 7, y - normalY * 7);
            const response = center - (sideA + sideB) / 2;
            score += Math.min(70, Math.abs(response));
            count += 1;
          }
          const average = count ? score / count : 0;
          if (count > 20 && average > lineBest.score) lineBest = { score: average, coordinate };
        }
        if (lineBest.score > 3) {
          lineOffsets.push(lineBest.coordinate);
          // Estimate the dominant overlay polarity from the selected line,
          // rather than from every trial phase examined during refinement.
          for (let x = 0; x < width; x += 8) {
            const y = lineBest.coordinate + family.sign * best.slope * x;
            if (y < 1 || y >= height - 1) continue;
            const center = lumaAt(x, y);
            const sideA = lumaAt(x + normalX * 7, y + normalY * 7);
            const sideB = lumaAt(x - normalX * 7, y - normalY * 7);
            const response = center - (sideA + sideB) / 2;
            if (Math.abs(response) > 1.2) { signedSignal += response; signedSamples += 1; }
          }
        }
      }
      const polarity = signedSamples >= 24 && Math.abs(signedSignal) / signedSamples >= 0.55 ? (signedSignal >= 0 ? 1 : -1) : 0;
      return { ...family, slope: best.slope, period: best.period, anchor: best.anchor, lineOffsets, polarity };
    };
    const refinedFamilies = families.map(refineGridFamily);
    let working = new Uint8ClampedArray(image.data);
    const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));
    for (const family of refinedFamilies) {
      const next = new Uint8ClampedArray(working);
      const period = family.period;
      const anchor = family.anchor;
      const lineOffsets = family.lineOffsets || [];
      const slope = family.slope;
      const normalLength = Math.hypot(slope, 1);
      const normalX = -family.sign * slope / normalLength;
      const normalY = 1 / normalLength;
      const tangentX = 1 / normalLength;
      const tangentY = family.sign * slope / normalLength;
      // The grid has a light anti-aliased halo on both sides of its centre
      // stroke. Keep this band narrow. A wide band makes the interpolation
      // eat into letters, bottles and thin decorative lines when a watermark
      // crosses them (the common failure mode for full-screen stock marks).
      const band = Math.max(2, Math.min(6, 3.2 / family.detectScale));
      const samplePair = (x, y, distance) => {
        const x1 = Math.max(0, Math.min(width - 1, Math.round(x + normalX * distance)));
        const y1 = Math.max(0, Math.min(height - 1, Math.round(y + normalY * distance)));
        const x2 = Math.max(0, Math.min(width - 1, Math.round(x - normalX * distance)));
        const y2 = Math.max(0, Math.min(height - 1, Math.round(y - normalY * distance)));
        const a = (y1 * width + x1) * 4; const b = (y2 * width + x2) * 4;
        const difference = Math.abs(working[a] - working[b]) + Math.abs(working[a + 1] - working[b + 1]) + Math.abs(working[a + 2] - working[b + 2]);
        return {
          difference,
          rgb: [(working[a] + working[b]) / 2, (working[a + 1] + working[b + 1]) / 2, (working[a + 2] + working[b + 2]) / 2],
          luma: (working[a] * 0.2126 + working[a + 1] * 0.7152 + working[a + 2] * 0.0722 + working[b] * 0.2126 + working[b + 1] * 0.7152 + working[b + 2] * 0.0722) / 2
        };
      };
      for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
        const coordinate = y - family.sign * slope * x;
        const nearest = Math.round((coordinate - anchor) / period);
        const expected = anchor + nearest * period;
        const line = lineOffsets.length ? lineOffsets.reduce((closest, item) => Math.abs(item - coordinate) < Math.abs(closest - coordinate) ? item : closest, expected) : expected;
        const distance = coordinate - line;
        if (Math.abs(distance) > band) continue;
        // Sample beyond the anti-aliased halo. Very close samples can be the
        // two bright edges of the same watermark stroke and would merely
        // replace a grey centre line with a white parallel line.
        const candidates = [band + 10, band + 16, band + 22, band + 28].map((value) => samplePair(x, y, value));
        // Ignore the nearest pair: on a light watermark it can sample the
        // anti-aliased halo on both sides and faithfully reproduce that halo.
        // Prefer the more distant, mutually consistent context instead.
        const replacement = candidates.slice(1).reduce((bestCandidate, candidate) => candidate.difference < bestCandidate.difference ? candidate : bestCandidate);
        const index = (y * width + x) * 4;
        const centerLuma = working[index] * 0.2126 + working[index + 1] * 0.7152 + working[index + 2] * 0.0722;
        const signedWatermarkSignal = centerLuma - replacement.luma;
        // Anti-aliased watermark strokes have a light centre with a darker
        // fringe (or the reverse, depending on the underlying artwork), so
        // use the magnitude here.  The faint-family context and the upper
        // bound below keep strong product/text edges out of the repair.
        const watermarkSignal = Math.abs(signedWatermarkSignal);
        const tangentLuma = (lumaAt(x + tangentX * 9, y + tangentY * 9) + lumaAt(x - tangentX * 9, y - tangentY * 9)) / 2;
        const tangentVariation = Math.abs(centerLuma - tangentLuma);
        // Real image edges have dissimilar samples on opposite sides of the
        // line. Only repair pixels with a clear line signal and reasonably
        // similar context; otherwise leave the original pixel untouched.
        // This makes the automatic pass conservative and prevents holes in
        // typography or product silhouettes.
        // The grid in the supplied artwork is a light, semi-transparent
        // overlay.  Keep the repair directional (only the dominant light or
        // dark polarity is touched) and use a restrained blend so edges of
        // bottles, birds and typography are not washed out.
        const minimumSignal = family.faint ? 0.32 : 1.35;
        const maximumContextDifference = family.faint ? 58 : 76;
        // Strong, dark or saturated pixels are overwhelmingly more likely to
        // be real typography, a product edge or an ornament than a
        // semi-transparent stock watermark. Keep them byte-for-byte intact;
        // the user brush is available when a watermark genuinely overlaps
        // one of those elements.
        const centerChroma = Math.max(working[index], working[index + 1], working[index + 2])
          - Math.min(working[index], working[index + 1], working[index + 2]);
        if (watermarkSignal < minimumSignal
          || watermarkSignal > 34
          || replacement.difference > maximumContextDifference
          || tangentVariation > 18
          || centerChroma > 68
          || (family.polarity && signedWatermarkSignal * family.polarity < -0.5)) continue;
        if (family.faint) {
          const normalTexture = Math.max(
            Math.abs(centerLuma - lumaAt(x + normalX * 3, y + normalY * 3)),
            Math.abs(centerLuma - lumaAt(x - normalX * 3, y - normalY * 3))
          );
          // A faint grid is detectable in the quiet background but should not
          // overwrite high-contrast bottles, leaves or type that it crosses.
          // Those textured areas are left for the optional manual brush pass.
          if (centerChroma > 54 || normalTexture > 24 || tangentVariation > 9 || replacement.difference > 42) continue;
        }
        const blend = family.faint
          ? Math.max(0.24, Math.min(0.72, watermarkSignal / 6))
          : Math.max(0.34, Math.min(0.78, watermarkSignal / 13));
        next[index] = clamp(working[index] * (1 - blend) + replacement.rgb[0] * blend);
        next[index + 1] = clamp(working[index + 1] * (1 - blend) + replacement.rgb[1] * blend);
        next[index + 2] = clamp(working[index + 2] * (1 - blend) + replacement.rgb[2] * blend);
      }
      working = next;
    }
    const repeated = detectRepeatedWatermarkMask(canvas, working);
    // A poster can contain legitimate text that also repeats along rows or
    // columns. Only accept a low-coverage diagonal family automatically;
    // text-like marks are handled by the user's brush so normal titles,
    // prices, dates and brand copy are never erased by accident.
    const repeatedDiagonal = repeated.periods?.some((period) => period.axis === 'diag-down' || period.axis === 'diag-up');
    const safeRepeated = repeated.mask && repeatedDiagonal && repeated.coverage <= 0.028;
    if (safeRepeated) working = repairWatermarkMask(working, repeated.mask, width, height);
    // Optional brush pass for repeated text / copyright marks that are not
    // straight lines. The brush is deliberately local and small; it never
    // applies a global blur, so a user can paint only over the residual mark.
    if (Array.isArray(manualStrokes) && manualStrokes.length) {
      const repairCircle = (centerX, centerY, radius) => {
        const next = new Uint8ClampedArray(working);
        const left = Math.max(0, Math.floor(centerX - radius));
        const right = Math.min(width - 1, Math.ceil(centerX + radius));
        const top = Math.max(0, Math.floor(centerY - radius));
        const bottom = Math.min(height - 1, Math.ceil(centerY + radius));
        for (let y = top; y <= bottom; y += 1) for (let x = left; x <= right; x += 1) {
          const dx = x - centerX; const dy = y - centerY;
          if (dx * dx + dy * dy > radius * radius) continue;
          const pairs = [];
          for (const [ox, oy] of [[radius + 4, 0], [0, radius + 4], [radius + 7, 0], [0, radius + 7]]) {
            const ax = Math.max(0, Math.min(width - 1, Math.round(x + ox))); const ay = Math.max(0, Math.min(height - 1, Math.round(y + oy)));
            const bx = Math.max(0, Math.min(width - 1, Math.round(x - ox))); const by = Math.max(0, Math.min(height - 1, Math.round(y - oy)));
            const a = (ay * width + ax) * 4; const b = (by * width + bx) * 4;
            const difference = Math.abs(working[a] - working[b]) + Math.abs(working[a + 1] - working[b + 1]) + Math.abs(working[a + 2] - working[b + 2]);
            pairs.push({ difference, rgb: [(working[a] + working[b]) / 2, (working[a + 1] + working[b + 1]) / 2, (working[a + 2] + working[b + 2]) / 2] });
          }
          const replacement = pairs.reduce((bestPair, pair) => pair.difference < bestPair.difference ? pair : bestPair);
          const blend = Math.max(0.35, Math.min(1, 1 - replacement.difference / 170));
          const index = (y * width + x) * 4;
          next[index] = clamp(working[index] * (1 - blend) + replacement.rgb[0] * blend);
          next[index + 1] = clamp(working[index + 1] * (1 - blend) + replacement.rgb[1] * blend);
          next[index + 2] = clamp(working[index + 2] * (1 - blend) + replacement.rgb[2] * blend);
        }
        working = next;
      };
      const scaleX = width / Math.max(1, decoded.image.width);
      const scaleY = height / Math.max(1, decoded.image.height);
      const radius = Math.max(12, Math.round(Math.min(width, height) * 0.012));
      for (const stroke of manualStrokes) {
        if (!Array.isArray(stroke) || !stroke.length) continue;
        const points = stroke.map((point) => ({ x: point.x * scaleX, y: point.y * scaleY }));
        for (let i = 0; i < points.length; i += 1) {
          const from = points[Math.max(0, i - 1)]; const to = points[i];
          const distance = Math.hypot(to.x - from.x, to.y - from.y);
          const steps = Math.max(1, Math.ceil(distance / Math.max(3, radius * 0.35)));
          for (let step = 0; step <= steps; step += 1) repairCircle(from.x + (to.x - from.x) * step / steps, from.y + (to.y - from.y) * step / steps, radius);
        }
      }
    }
    context.putImageData(new ImageData(working, width, height), 0, 0);
    // Expose a small diagnostic for the UI/export path.  Detection is
    // deliberately considered successful only when a repeated pattern was
    // confirmed or the user painted a mask; never silently claim a clean
    // result for an untouched, unknown image.
    canvas.__watermarkDetection = {
      gridFamilies: refinedFamilies.length,
      repeatedCoverage: repeated.coverage,
      manualStrokes: Array.isArray(manualStrokes) ? manualStrokes.length : 0,
      detected: refinedFamilies.length > 0 || Boolean(safeRepeated)
    };
    return canvas;
  }
  function paintCanvasFor(kind) { return $(`#paidPreview-${kind}`); }
  function brushCanvasFor(kind) { return $(`#paidBrush-${kind}`); }

  function renderPaidBrush(kind) {
    const preview = toolState.paidPreviews[kind];
    const canvas = brushCanvasFor(kind);
    if (!preview || !canvas) return;
    canvas.width = preview.width;
    canvas.height = preview.height;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'rgba(212,135,67,.9)';
    context.fillStyle = 'rgba(212,135,67,.18)';
    context.lineWidth = Math.max(14, Math.round(Math.min(canvas.width, canvas.height) * .026));
    context.lineCap = 'round';
    context.lineJoin = 'round';
    for (const stroke of toolState.paidBrushStrokes[kind] || []) {
      if (!stroke?.length) continue;
      context.beginPath();
      stroke.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
      context.stroke();
    }
  }

  async function renderPaidPreview(kind, value) {
    const canvas = paintCanvasFor(kind);
    const editor = $(`.paid-paint-editor[data-paid-editor="${kind}"]`);
    if (!canvas || !editor || !value || !(value instanceof Blob)) return;
    editor.hidden = true;
    let decoded;
    try {
      decoded = await decodeImage(value);
      const previewCanvas = fitImageCanvas(decoded, 1400);
      canvas.width = previewCanvas.width;
      canvas.height = previewCanvas.height;
      canvas.getContext('2d').drawImage(previewCanvas, 0, 0);
      toolState.paidPreviews[kind] = { width: canvas.width, height: canvas.height };
      editor.hidden = false;
      renderPaidBrush(kind);
      const meta = $(`#paidPaintMeta-${kind}`);
      if (meta) meta.textContent = kind === 'erase' ? '已载入图片，沿要擦除的杂物或污渍拖动涂抹。' : '已载入图片，标记需要修改的位置后再填写说明。';
    } catch (error) {
      showToast('预览图片读取失败，请重新选择 JPG 或 PNG。');
    } finally {
      releaseImage(decoded);
    }
  }

  function paintPoint(shell, event) {
    const rect = shell.getBoundingClientRect();
    const preview = toolState.paidPreviews[shell.closest('.paid-paint-editor')?.dataset.paidEditor];
    if (!preview) return null;
    return {
      x: Math.max(0, Math.min(preview.width, (event.clientX - rect.left) * preview.width / rect.width)),
      y: Math.max(0, Math.min(preview.height, (event.clientY - rect.top) * preview.height / rect.height))
    };
  }

  function bindPaidImageEditors() {
    $$('.paid-paint-editor').forEach((editor) => {
      const kind = editor.dataset.paidEditor;
      const shell = $('.paid-paint-shell', editor);
      if (!shell) return;
      let active = null;
      const move = (event) => {
        if (!active) return;
        const point = paintPoint(shell, event);
        if (!point) return;
        active.push(point);
        renderPaidBrush(kind);
      };
      shell.addEventListener('pointerdown', (event) => {
        const point = paintPoint(shell, event);
        if (!point) return;
        active = [point];
        toolState.paidBrushStrokes[kind].push(active);
        shell.setPointerCapture?.(event.pointerId);
        renderPaidBrush(kind);
        updateReady(kind);
        event.preventDefault();
      });
      shell.addEventListener('pointermove', move);
      const finish = (event) => { active = null; shell.releasePointerCapture?.(event.pointerId); updateReady(kind); };
      shell.addEventListener('pointerup', finish);
      shell.addEventListener('pointercancel', finish);
      shell.addEventListener('pointerleave', (event) => { if (active && event.buttons === 0) finish(event); });
    });
    $('#paidPrompt-mark-edit')?.addEventListener('input', () => updateReady('mark-edit'));
  }

  function bindPaidOptions() {
    $$('.expand-ratio-option').forEach((button) => button.addEventListener('click', () => {
      toolState.expandRatio = button.dataset.expandRatio || 'landscape';
      $$('.expand-ratio-option').forEach((item) => {
        const selected = item === button;
        item.classList.toggle('selected', selected);
        item.setAttribute('aria-checked', selected ? 'true' : 'false');
      });
    }));
    const strength = $('#enhanceStrength');
    strength?.addEventListener('input', () => { toolState.enhanceStrength = Number(strength.value || 2); });
  }

  function drawContain(context, image, width, height) {
    const scale = Math.min(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  }

  function repairMarkedCanvas(decoded, kind) {
    const canvas = fitImageCanvas(decoded, 2400);
    if (!toolState.paidBrushStrokes[kind]?.some((stroke) => stroke?.length)) return canvas;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const source = image.data;
    const result = new Uint8ClampedArray(source);
    const preview = toolState.paidPreviews[kind] || { width: canvas.width, height: canvas.height };
    const scaleX = canvas.width / Math.max(1, preview.width);
    const scaleY = canvas.height / Math.max(1, preview.height);
    const radius = Math.max(10, Math.round(Math.min(canvas.width, canvas.height) * .018));
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const repairCircle = (centerX, centerY) => {
      const left = Math.max(0, Math.floor(centerX - radius));
      const right = Math.min(canvas.width - 1, Math.ceil(centerX + radius));
      const top = Math.max(0, Math.floor(centerY - radius));
      const bottom = Math.min(canvas.height - 1, Math.ceil(centerY + radius));
      for (let y = top; y <= bottom; y += 1) for (let x = left; x <= right; x += 1) {
        const dx = x - centerX; const dy = y - centerY;
        if (dx * dx + dy * dy > radius * radius) continue;
        const samples = [];
        for (const [ox, oy] of [[radius * 1.8, 0], [0, radius * 1.8], [radius * 2.4, 0], [0, radius * 2.4]]) {
          const ax = clamp(Math.round(x + ox), 0, canvas.width - 1); const ay = clamp(Math.round(y + oy), 0, canvas.height - 1);
          const bx = clamp(Math.round(x - ox), 0, canvas.width - 1); const by = clamp(Math.round(y - oy), 0, canvas.height - 1);
          const a = (ay * canvas.width + ax) * 4; const b = (by * canvas.width + bx) * 4;
          const difference = Math.abs(source[a] - source[b]) + Math.abs(source[a + 1] - source[b + 1]) + Math.abs(source[a + 2] - source[b + 2]);
          samples.push({ difference, rgb: [(source[a] + source[b]) / 2, (source[a + 1] + source[b + 1]) / 2, (source[a + 2] + source[b + 2]) / 2] });
        }
        const replacement = samples.reduce((best, item) => item.difference < best.difference ? item : best);
        const blend = .78;
        const index = (y * canvas.width + x) * 4;
        result[index] = Math.round(source[index] * (1 - blend) + replacement.rgb[0] * blend);
        result[index + 1] = Math.round(source[index + 1] * (1 - blend) + replacement.rgb[1] * blend);
        result[index + 2] = Math.round(source[index + 2] * (1 - blend) + replacement.rgb[2] * blend);
      }
    };
    for (const stroke of toolState.paidBrushStrokes[kind]) {
      if (!stroke?.length) continue;
      for (let index = 0; index < stroke.length; index += 1) {
        const from = stroke[Math.max(0, index - 1)]; const to = stroke[index];
        const x1 = from.x * scaleX; const y1 = from.y * scaleY; const x2 = to.x * scaleX; const y2 = to.y * scaleY;
        const distance = Math.hypot(x2 - x1, y2 - y1); const steps = Math.max(1, Math.ceil(distance / Math.max(3, radius * .35)));
        for (let step = 0; step <= steps; step += 1) repairCircle(x1 + (x2 - x1) * step / steps, y1 + (y2 - y1) * step / steps);
      }
    }
    context.putImageData(new ImageData(result, canvas.width, canvas.height), 0, 0);
    return canvas;
  }

  function expandImageCanvas(decoded, ratioName) {
    const ratio = ratioName === 'portrait' ? 3 / 4 : ratioName === 'square' ? 1 : 16 / 9;
    const source = decoded.image;
    const base = Math.min(2200, Math.max(source.width, source.height));
    let width; let height;
    if (source.width / source.height >= ratio) { width = Math.max(source.width, Math.round(source.height * ratio)); height = Math.round(width / ratio); }
    else { height = Math.max(source.height, Math.round(source.width / ratio)); width = Math.round(height * ratio); }
    const scale = Math.min(1, base / Math.max(width, height)); width = Math.max(1, Math.round(width * scale)); height = Math.max(1, Math.round(height * scale));
    const canvas = makeCanvas(width, height); const context = canvas.getContext('2d');
    context.save(); context.filter = 'blur(26px) saturate(1.03)'; drawCover(context, source, width, height); context.restore();
    drawContain(context, source, width * .98, height * .98);
    return canvas;
  }

  function downloadBlob(blob, name) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1500); }

  async function requestSceneRetouchModel(value) {
    const form = new FormData();
    form.append('image', value, fileName(value));
    const ports = [];
    if (window.location.port) ports.push(window.location.port);
    [4174, 4175, 4176, 4177, 4178, 4180].forEach((port) => { if (!ports.includes(String(port))) ports.push(String(port)); });
    const endpoints = window.location.protocol === 'file:'
      ? ports.map((port) => `http://127.0.0.1:${port}/api/retouch-scene`)
      : ['/api/retouch-scene', ...ports.map((port) => `http://127.0.0.1:${port}/api/retouch-scene`)];
    let lastError = null;
    let modelNotConfigured = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 120000);
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { method: 'POST', body: form, signal: controller.signal });
        if ([404, 405, 501].includes(response.status)) continue;
        if (response.status === 503) { modelNotConfigured = true; continue; }
        if (!response.ok) {
          let message = '';
          try { message = (await response.json())?.error || ''; } catch { /* ignore invalid error payload */ }
          throw new Error(message || `场景精修模型接口返回 ${response.status}`);
        }
        const blob = await response.blob();
        if (!blob.size || !blob.type.startsWith('image/')) throw new Error('场景精修模型没有返回图片');
        return { blob, provider: response.headers.get('x-hotel-provider') || 'model' };
      } catch (error) {
        if (error?.code === 'MODEL_NOT_CONFIGURED') throw error;
        if (error?.name === 'AbortError') { lastError = Object.assign(new Error('本地模型服务响应超时'), { code: 'MODEL_UNAVAILABLE' }); break; }
        lastError = error;
      }
    }
    window.clearTimeout(timeout);
    if (lastError) throw lastError;
    if (modelNotConfigured) throw Object.assign(new Error('本地模型服务未配置 API Key'), { code: 'MODEL_NOT_CONFIGURED' });
    throw Object.assign(new Error('本地模型服务未启动'), { code: 'MODEL_UNAVAILABLE' });
  }

  // Paid image tools use the same local model gateway as poster generation.
  // The browser never receives or stores the company key: it only uploads the
  // selected image (and, for local edits, an alpha mask) to the local service.
  async function requestPaidImageModel(value, kind) {
    const form = new FormData();
    form.append('image', value, fileName(value));
    form.append('operation', kind);
    // Watermark removal should let the gateway choose the closest edit size
    // from the uploaded portrait/landscape image instead of forcing the
    // generic 16:9 tool ratio onto a poster.
    form.append('ratio', kind === 'watermark-removal' ? 'auto' : (toolState.expandRatio || 'landscape'));
    form.append('prompt', $('#paidPrompt-mark-edit')?.value.trim() || '');
    form.append('enhanceStrength', String(toolState.enhanceStrength || 2));
    if (kind === 'watermark-removal') form.append('watermarkMode', toolState.watermarkMode || 'full');

    // GPT-Image edits use transparent pixels in the mask as the editable
    // region. Build a full-size mask from the visible preview coordinates so
    // the uploaded mask matches the original image dimensions exactly.
    if (kind === 'erase' || kind === 'mark-edit' || kind === 'watermark-removal') {
      const isWatermark = kind === 'watermark-removal';
      const preview = isWatermark ? toolState.watermarkPreview : toolState.paidPreviews[kind];
      const strokes = isWatermark ? (toolState.watermarkBrushStrokes || []) : (toolState.paidBrushStrokes[kind] || []);
      const selection = isWatermark ? toolState.watermarkSelection : null;
      if (preview && (selection || strokes.some((stroke) => stroke?.length))) {
        const decoded = await decodeImage(value);
        try {
          const width = decoded.image.width;
          const height = decoded.image.height;
          const maskCanvas = makeCanvas(width, height);
          const context = maskCanvas.getContext('2d');
          context.fillStyle = '#fff';
          context.fillRect(0, 0, width, height);
          context.globalCompositeOperation = 'destination-out';
          context.strokeStyle = '#000';
          context.lineCap = 'round';
          context.lineJoin = 'round';
          context.lineWidth = Math.max(8, Math.round(Math.min(width, height) * .026));
          const scaleX = width / Math.max(1, isWatermark ? (preview.sourceWidth || width) : preview.width);
          const scaleY = height / Math.max(1, isWatermark ? (preview.sourceHeight || height) : preview.height);
          if (selection) {
            context.fillStyle = '#000';
            context.fillRect(selection.x * scaleX, selection.y * scaleY, selection.width * scaleX, selection.height * scaleY);
          }
          for (const stroke of strokes) {
            if (!stroke?.length) continue;
            context.beginPath();
            stroke.forEach((point, index) => {
              const x = point.x * scaleX;
              const y = point.y * scaleY;
              if (index) context.lineTo(x, y); else context.moveTo(x, y);
            });
            context.stroke();
          }
          const maskBlob = await canvasBlob(maskCanvas, 'image/png');
          form.append('mask', maskBlob, 'edit-mask.png');
        } finally {
          releaseImage(decoded);
        }
      }
    }

    const ports = [];
    if (window.location.port) ports.push(window.location.port);
    [4174, 4175, 4176, 4177, 4178, 4180].forEach((port) => {
      if (!ports.includes(String(port))) ports.push(String(port));
    });
    const endpoints = window.location.protocol === 'file:'
      ? ports.map((port) => `http://127.0.0.1:${port}/api/paid-image`)
      : ['/api/paid-image', ...ports.map((port) => `http://127.0.0.1:${port}/api/paid-image`)];
    let lastError = null;
    let modelNotConfigured = false;
    let modelUnavailable = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 180000);
    try {
      for (const endpoint of [...new Set(endpoints)]) {
        try {
          const response = await fetch(endpoint, { method: 'POST', body: form, signal: controller.signal });
          if ([404, 405, 501].includes(response.status)) continue;
          if (response.status === 503) {
            let payload = {};
            try { payload = await response.json(); } catch { /* ignore */ }
            if (payload?.code === 'MODEL_UNAVAILABLE') modelUnavailable = true;
            else modelNotConfigured = true;
            continue;
          }
          if (!response.ok) {
            let message = '';
            let payload = {};
            try { payload = await response.json(); message = payload?.error || ''; } catch { /* ignore */ }
            const error = new Error(message || `公司图片模型接口返回 ${response.status}`);
            error.status = response.status;
            error.traceId = payload?.traceId || '';
            throw error;
          }
          const blob = await response.blob();
          if (!blob.size || !blob.type.startsWith('image/')) throw new Error('公司图片模型没有返回有效图片');
          return { blob, provider: response.headers.get('x-hotel-provider') || 'company', model: response.headers.get('x-hotel-model') || '' };
        } catch (error) {
          if (error?.name === 'AbortError') {
            modelUnavailable = true;
            lastError = Object.assign(new Error('公司图片模型服务响应超时'), { code: 'MODEL_UNAVAILABLE' });
            break;
          }
          // Keep authentication, permission, validation and upstream model
          // errors visible. They must not be silently replaced by local output.
          if (error?.status && ![502, 503].includes(error.status)) throw error;
          lastError = error;
          if (!error?.status || error?.status === 502) modelUnavailable = true;
        }
      }
    } finally {
      window.clearTimeout(timeout);
    }
    if (lastError && !modelUnavailable) throw lastError;
    if (modelNotConfigured) throw Object.assign(new Error('公司图片模型服务未配置 API Key'), { code: 'MODEL_NOT_CONFIGURED' });
    if (modelUnavailable) throw Object.assign(lastError || new Error('公司图片模型服务未启动'), { code: 'MODEL_UNAVAILABLE' });
    throw Object.assign(new Error('公司图片模型服务未启动'), { code: 'MODEL_UNAVAILABLE' });
  }

  async function browserImageTool(kind) {
    if (kind === 'image-crop') {
      const files = [];
      for (const value of toolState.files['image-crop']) {
        const item = await decodeImage(value); const canvas = makeCanvas(1920, 1080); drawCover(canvas.getContext('2d'), item.image, 1920, 1080); releaseImage(item);
        const isPng = extension(value) === 'png'; const blob = isPng ? await canvasBlob(canvas, 'image/png') : await compressedJpeg(canvas, 2_000_000); const base = fileName(value).replace(/\.[^.]+$/, ''); files.push({ name: `${base}.${isPng ? 'png' : 'jpg'}`, blob });
      }
      return { files, summary: `已完成 ${files.length} 张图片，全部为 1920×1080。` };
    }
    const source = toolState.files[kind];

    // Paid tools are model-first. Only the two explicitly recoverable states
    // (no key or local gateway not running) use the deterministic demo path.
    // Authentication, permission and validation errors are surfaced to the
    // user so a failed company request can never look like a model result.
    // Watermark removal is intentionally model-only. The local repeated-line
    // detector can damage valid poster copy, product edges, and prices; do not
    // silently substitute it when the company gateway is configured.
    if (modelImageKinds.has(kind)) {
      let modelResult = null;
      try {
        modelResult = await requestPaidImageModel(source, kind);
      } catch (error) {
        if (kind === 'watermark-removal' || !['MODEL_NOT_CONFIGURED', 'MODEL_UNAVAILABLE'].includes(error?.code)) throw error;
        showToast('公司图片模型暂不可用，已使用本机演示算法处理；配置公司 API 后可获得正式模型效果。');
      }
      if (modelResult) {
        const base = fileName(source).replace(/\.[^.]+$/, '');
        const isPng = modelResult.blob.type.includes('png') || kind === 'ai-cutout';
        const suffix = kind === 'ai-cutout' ? 'AI抠图' : kind === 'erase' ? '擦除' : kind === 'mark-edit' ? '标记改图' : kind === 'expand' ? `扩图_${(toolState.expandRatio === 'portrait' ? '3x4' : toolState.expandRatio === 'square' ? '1x1' : '16x9')}` : kind === 'watermark-removal' ? '去水印' : '变清晰';
        return {
          files: [{ name: `${base}_${suffix}.${isPng ? 'png' : 'jpg'}`, blob: modelResult.blob }],
          summary: `已调用公司 GPT‑Image（${modelResult.model || '公司会员模型'}）完成${kind === 'ai-cutout' ? 'AI 抠图' : kind === 'erase' ? '擦除修复' : kind === 'mark-edit' ? '标记改图' : kind === 'expand' ? '智能扩图' : kind === 'watermark-removal' ? '去水印' : '清晰度增强'}。`
        };
      }
    }

    const decoded = await decodeImage(source);
    try {
      if (kind === 'image') {
        const canvas = makeCanvas(1920, 1080);
        const ctx = canvas.getContext('2d');
        if (toolState.imageMaterialMode === 'logo') {
          const matte = logoMatte(decoded, 68);
          const bg = toolState.background === 'auto' ? '#FFFFFF' : toolState.background;
          ctx.fillStyle = bg; ctx.fillRect(0, 0, 1920, 1080);
          const scale = Math.min(520 / matte.width, 330 / matte.height); const w = matte.width * scale; const h = matte.height * scale;
          const matteCanvas = makeCanvas(matte.width, matte.height); matteCanvas.getContext('2d').putImageData(new ImageData(matte.data, matte.width, matte.height), 0, 0); ctx.drawImage(matteCanvas, (1920 - w) / 2, (1080 - h) / 2, w, h);
        } else drawCover(ctx, decoded.image, 1920, 1080);
        const base = fileName(source).replace(/\.[^.]+$/, '');
        const png = await canvasBlob(canvas, 'image/png'); const jpg = await compressedJpeg(canvas, 1024 * 1024); const bmp = encodeBmp(canvas);
        return { files: [{ name: `${base}.png`, blob: png }, { name: `${base}.jpg`, blob: jpg }, { name: `${base}.bmp`, blob: bmp }], summary: toolState.imageMaterialMode === 'logo' ? '已按单一 Logo 模式居中生成 PNG、JPG、BMP。' : '已按整张封面模式铺满裁切生成 PNG、JPG、BMP。' };
      }
      if (kind === 'logo') {
        const matte = logoMatte(decoded, Number($('#sensitivity')?.value || 68));
        const canvas = makeCanvas(matte.width, matte.height); canvas.getContext('2d').putImageData(new ImageData(matte.data, matte.width, matte.height), 0, 0);
        const base = fileName(source).replace(/\.[^.]+$/, '');
        const makeTint = (value) => { const tinted = makeCanvas(matte.width, matte.height); const context = tinted.getContext('2d'); const pixels = new Uint8ClampedArray(matte.data); for (let i = 0; i < pixels.length; i += 4) pixels[i] = pixels[i + 1] = pixels[i + 2] = value; context.putImageData(new ImageData(pixels, matte.width, matte.height), 0, 0); return canvasBlob(tinted, 'image/png'); };
        const [original, black, white] = await Promise.all([canvasBlob(canvas, 'image/png'), makeTint(0), makeTint(255)]);
        return { files: [{ name: `${base}_logo_original.png`, blob: original }, { name: `${base}_logo_black.png`, blob: black }, { name: `${base}_logo_white.png`, blob: white }], summary: `已生成 ${matte.width} × ${matte.height} 原色、黑色与白色透明 Logo。` };
      }
      if (kind === 'ai-cutout') {
        const matte = logoMatte(decoded, 68);
        const canvas = makeCanvas(matte.width, matte.height);
        canvas.getContext('2d').putImageData(new ImageData(matte.data, matte.width, matte.height), 0, 0);
        const base = fileName(source).replace(/\.[^.]+$/, '');
        const blob = await canvasBlob(canvas, 'image/png');
        return { files: [{ name: `${base}_AI抠图.png`, blob }], summary: '本机演示算法已完成主体抠图并导出透明 PNG。复杂背景建议配置公司图片模型后再次处理。' };
      }
      if (kind === 'erase' || kind === 'mark-edit') {
        const canvas = repairMarkedCanvas(decoded, kind);
        const base = fileName(source).replace(/\.[^.]+$/, '');
        const isPng = extension(source) === 'png';
        const blob = isPng ? await canvasBlob(canvas, 'image/png') : await compressedJpeg(canvas, 8_000_000);
        return { files: [{ name: `${base}_${kind === 'erase' ? '擦除' : '标记改图'}.${isPng ? 'png' : 'jpg'}`, blob }], summary: kind === 'erase' ? '已按画笔标记完成局部擦除并修复周围纹理。' : `已按标记区域完成本地修改演示${$('#paidPrompt-mark-edit')?.value.trim() ? `：${$('#paidPrompt-mark-edit').value.trim()}` : ''}。` };
      }
      if (kind === 'expand') {
        const canvas = expandImageCanvas(decoded, toolState.expandRatio);
        const base = fileName(source).replace(/\.[^.]+$/, '');
        const isPng = extension(source) === 'png';
        const blob = isPng ? await canvasBlob(canvas, 'image/png') : await compressedJpeg(canvas, 8_000_000);
        const ratioLabel = toolState.expandRatio === 'portrait' ? '3:4' : toolState.expandRatio === 'square' ? '1:1' : '16:9';
        return { files: [{ name: `${base}_扩图_${ratioLabel.replace(':', 'x')}.${isPng ? 'png' : 'jpg'}`, blob }], summary: `已扩展为 ${ratioLabel} 画布，尽量保留原图主体并补足边缘背景。` };
      }
      if (kind === 'enhance') {
        const canvas = sceneRetouchCanvas(decoded);
        const base = fileName(source).replace(/\.[^.]+$/, '');
        const isPng = extension(source) === 'png';
        const blob = isPng ? await canvasBlob(canvas, 'image/png') : await compressedJpeg(canvas, 8_000_000);
        return { files: [{ name: `${base}_变清晰.${isPng ? 'png' : 'jpg'}`, blob }], summary: '本机演示算法已完成清晰度增强、轻微曝光校正与细节优化，保持原始画面尺寸。' };
      }
      if (kind === 'watermark-removal') {
        const canvas = toolState.watermarkMode === 'full'
          ? removeFullScreenWatermarkCanvas(decoded, toolState.watermarkBrushStrokes)
          : removeWatermarkCanvas(decoded, toolState.watermarkSelection);
        if (toolState.watermarkMode === 'full') {
          const diagnostic = canvas.__watermarkDetection || {};
          const hasManual = Array.isArray(toolState.watermarkBrushStrokes) && toolState.watermarkBrushStrokes.some((stroke) => stroke?.length);
          if (!diagnostic.detected && !hasManual) {
            throw new Error('未识别到可确认的重复满屏水印。请在预览图上沿着水印文字或图案拖动涂抹后再导出；为避免误伤实景，未检测到水印时不会导出原图。');
          }
        }
        const base = fileName(source).replace(/\.[^.]+$/, '');
        const isPng = extension(source) === 'png';
        const blob = isPng ? await canvasBlob(canvas, 'image/png') : await compressedJpeg(canvas, 8_000_000);
      return { files: [{ name: `${base}_去水印.${isPng ? 'png' : 'jpg'}`, blob }], summary: toolState.watermarkMode === 'full'
          ? (toolState.watermarkBrushStrokes.length ? '已清理重复纹理和你明确涂抹的水印区域，未标记的标题、价格、日期、Logo 与版式内容保持不变。' : '已安全清理可确认的重复斜线 / 网格，并保留标题、价格、日期、Logo 与版式文字；文字型残留可沿水印涂抹后再次导出。')
          : '已完成选区修复并生成去水印图片。复杂纹理或大面积水印可能需要缩小选区后再次处理.' };
      }
      if (kind === 'scene-retouch') {
        let modelResult = null;
        try {
          modelResult = await requestSceneRetouchModel(source);
        } catch (error) {
          // The model endpoint is optional during the offline demo. A 503 or
          // unavailable local server falls back to Sharp/Canvas; auth and
          // permission errors are surfaced so a misconfigured key is never
          // mistaken for a successful AI retouch.
          if (!['MODEL_NOT_CONFIGURED', 'MODEL_UNAVAILABLE'].includes(error?.code)) throw error;
          showToast('未连接到已配置的图片模型，已使用本机精修算法处理；如需清理复杂污渍，请启动模型服务。');
        }
        if (modelResult) {
          const base = fileName(source).replace(/\.[^.]+$/, '');
          const isPng = modelResult.blob.type.includes('png');
          return {
            files: [{ name: `${base}_场景精修.${isPng ? 'png' : 'jpg'}`, blob: modelResult.blob }],
            summary: `已调用${modelResult.provider === 'doubao' ? '豆包 Seedream' : '公司 GPT‑Image'}完成场景精修：清理水渍、玻璃脏点与床品褶皱，并增强清晰度。`
          };
        }
        const canvas = sceneRetouchCanvas(decoded);
        const base = fileName(source).replace(/\.[^.]+$/, '');
        const isPng = extension(source) === 'png';
        const blob = isPng ? await canvasBlob(canvas, 'image/png') : await compressedJpeg(canvas, 8_000_000);
        return { files: [{ name: `${base}_场景精修.${isPng ? 'png' : 'jpg'}`, blob }], summary: '已完成场景精修：清理水渍、玻璃脏点与床品细碎褶皱，优化光线、色彩并增强清晰度。大面积杂物建议后续使用智能修复服务。' };
      }
    } finally { releaseImage(decoded); }
  }

  function formatBytes(bytes) { return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`; }
  function showResult(result, kind) {
    toolState.result = result;
    $('#result-summary').textContent = result.summary || `${kind} 处理完成`;
    const list = $('#result-files'); list.innerHTML = '';
    result.files.forEach((file) => { const name = file.name || String(file.path || '输出文件').split(/[\\/]/).pop(); const row = document.createElement('div'); row.className = 'result-file'; const ext = name.split('.').pop().toUpperCase(); row.innerHTML = `<i>${ext}</i><b></b><span>${formatBytes(file.blob ? file.blob.size : file.bytes || 0)}</span>`; $('b', row).textContent = name; list.appendChild(row); if (file.blob) downloadBlob(file.blob, name); });
    $('#show-result').hidden = Boolean(!bridge);
    $('#result-overlay').hidden = false;
  }

  async function runTool(kind) {
    const page = pageFor(kind); const button = $('.run-button', page); if (!button || button.disabled) return;
    $('#progress-overlay').hidden = false; setProgress('准备处理中', 2, '正在读取文件…');
    try {
      let result;
      if (bridge) {
        const useCompanyModel = kind === 'scene-retouch' || modelImageKinds.has(kind);
        setProgress(useCompanyModel ? '正在调用公司图片模型' : '正在调用本地处理器', 26, useCompanyModel ? '通过本机服务转发到公司 GPT‑Image' : '使用安装包内置的图像与视频引擎');
        if (kind === 'image') result = await bridge.processImage({ inputPath: toolState.files.image, outputDir: toolState.outputDirs.image, background: toolState.background, materialMode: toolState.imageMaterialMode });
        else if (kind === 'video') result = await bridge.processVideo({ inputPath: toolState.files.video, outputDir: toolState.outputDirs.video });
        else if (kind === 'logo') result = await bridge.extractLogo({ inputPath: toolState.files.logo, outputDir: toolState.outputDirs.logo, sensitivity: Number($('#sensitivity')?.value || 68) });
        else if (kind === 'image-crop') result = await bridge.processImageBatch({ inputPaths: toolState.files['image-crop'], outputDir: toolState.outputDirs['image-crop'] });
        else if (kind === 'watermark-removal' && bridge.processPaidImageModel) {
          const modelPayload = {
            inputPath: toolState.files['watermark-removal'],
            outputDir: toolState.outputDirs['watermark-removal'],
            operation: 'watermark-removal',
            watermarkMode: toolState.watermarkMode,
            manualStrokes: toolState.watermarkBrushStrokes || [],
            previewSize: toolState.watermarkPreview || null,
            selection: toolState.watermarkSelection || null
          };
          const modelResult = await bridge.processPaidImageModel(modelPayload);
          if (modelResult?.ok) result = modelResult;
          else throw Object.assign(new Error(modelResult?.error || '公司图片模型处理失败'), { code: modelResult?.code, status: modelResult?.status });
        }
        else if (kind === 'watermark-removal') {
          throw new Error('当前安装包缺少公司图片模型处理器，请重新启动最新版本后重试。');
        }
        else if (kind === 'scene-retouch' && bridge.processPaidImageModel) {
          const modelPayload = { inputPath: toolState.files['scene-retouch'], outputDir: toolState.outputDirs['scene-retouch'], operation: 'scene-retouch' };
          const modelResult = await bridge.processPaidImageModel(modelPayload);
          if (modelResult?.ok) result = modelResult;
          else if (['MODEL_NOT_CONFIGURED', 'MODEL_UNAVAILABLE'].includes(modelResult?.code) && bridge.retouchScene) result = await bridge.retouchScene(modelPayload);
          else throw Object.assign(new Error(modelResult?.error || '公司图片模型处理失败'), { code: modelResult?.code, status: modelResult?.status });
        }
        else if (kind === 'scene-retouch') result = await bridge.retouchScene({ inputPath: toolState.files['scene-retouch'], outputDir: toolState.outputDirs['scene-retouch'] });
        else if (paidImageKinds.has(kind) && bridge.processPaidImageModel) {
          const modelPayload = { inputPath: toolState.files[kind], outputDir: toolState.outputDirs[kind], operation: kind, manualStrokes: toolState.paidBrushStrokes[kind] || [], previewSize: toolState.paidPreviews[kind] || null, expandRatio: toolState.expandRatio, enhanceStrength: toolState.enhanceStrength, prompt: $('#paidPrompt-mark-edit')?.value.trim() || '' };
          const modelResult = await bridge.processPaidImageModel(modelPayload);
          if (modelResult?.ok) result = modelResult;
          else if (['MODEL_NOT_CONFIGURED', 'MODEL_UNAVAILABLE'].includes(modelResult?.code) && bridge.processPaidImage) result = await bridge.processPaidImage(modelPayload);
          else throw Object.assign(new Error(modelResult?.error || '公司图片模型处理失败'), { code: modelResult?.code, status: modelResult?.status });
        }
        else if (paidImageKinds.has(kind) && bridge.processPaidImage) result = await bridge.processPaidImage({ inputPath: toolState.files[kind], outputDir: toolState.outputDirs[kind], operation: kind, manualStrokes: toolState.paidBrushStrokes[kind] || [], expandRatio: toolState.expandRatio, enhanceStrength: toolState.enhanceStrength, prompt: $('#paidPrompt-mark-edit')?.value.trim() || '' });
        else if (paidImageKinds.has(kind)) throw new Error('当前安装包缺少付费图片工具处理器，请重新启动最新版本。');
        else result = await bridge.compressVideo({ inputPath: toolState.files['video-compress'], outputDir: toolState.outputDirs['video-compress'] });
        if (!result?.ok) throw new Error(result?.error || '处理失败，请检查素材后重试。');
        result.summary = result.summary || (kind === 'video' ? `已输出 MPEG-2 / AC3 视频，时长 ${Math.round(result.duration || 0)} 秒。` : kind === 'logo' ? `已生成 ${result.width} × ${result.height} 原色、黑色与白色透明 Logo。` : kind === 'watermark-removal' ? '已完成本地满屏水印清理；请检查输出图片，复杂重复文字可继续涂抹后再次处理。' : kind === 'scene-retouch' ? '已完成场景精修：清理水渍、玻璃脏点与细碎褶皱，并增强清晰度。' : kind === 'ai-cutout' ? '已完成主体抠图并导出透明 PNG。' : kind === 'erase' ? '已按画笔标记完成局部擦除。' : kind === 'mark-edit' ? '已按标记区域完成局部修改演示。' : kind === 'expand' ? '已完成画布扩展并补足边缘背景。' : kind === 'enhance' ? '已完成清晰度与细节增强。' : '处理完成，文件已保存到所选文件夹。');
        $('#progress-overlay').hidden = true; showResult(result, kind); return;
      }
      if (kind === 'video' || kind === 'video-compress') throw new Error('浏览器无法编码 MPEG-2 / AC3 视频。请使用安装包内置的本地处理器，视频不会上传到云端。');
      const modelFirst = kind === 'scene-retouch' || modelImageKinds.has(kind);
      setProgress(modelFirst ? '正在连接公司图片模型' : '正在本机处理图片', 55, modelFirst ? '已配置公司模型时优先调用；未配置则回退本机算法…' : '不上传素材，正在生成输出文件…');
      result = await browserImageTool(kind); setProgress('处理完成', 100, '文件已下载到浏览器下载文件夹'); $('#progress-overlay').hidden = true; showResult(result, kind);
    } catch (error) {
      $('#progress-overlay').hidden = true;
      showToast(error?.message || '处理失败，请检查素材后重试。');
    }
  }

  function bindRunButtons() { $$('.run-button').forEach((button) => button.addEventListener('click', () => runTool(button.closest('.tool-page').dataset.kind))); }
  function bindBackButtons() { $$('.back-home').forEach((button) => button.addEventListener('click', backHome)); }
  function bindResultActions() {
    $('.close-result')?.addEventListener('click', () => { $('#result-overlay').hidden = true; });
    $('#process-another')?.addEventListener('click', () => { $('#result-overlay').hidden = true; });
    $('#show-result')?.addEventListener('click', () => { if (toolState.result?.files?.[0]?.path && bridge?.reveal) bridge.reveal(toolState.result.files[0].path); else toolState.result?.files?.forEach((file) => file.blob && downloadBlob(file.blob, file.name)); });
  }

  bindUploadPanels();
  bindOutputPickers();
  bindImageOptions();
  bindWatermarkEditor();
  bindWatermarkMode();
  bindPaidImageEditors();
  bindPaidOptions();
  pageFor('image')?.classList.toggle('logo-material', toolState.imageMaterialMode === 'logo');
  $$('.background-card .swatch', pageFor('image')).forEach((item) => { item.disabled = toolState.imageMaterialMode !== 'logo'; });
  bindRunButtons();
  bindBackButtons();
  bindResultActions();
  bridge?.onProgress?.((value) => setProgress(value.stage || '正在处理', value.percent || 0, value.detail || ''));
  $$('.tool-page').forEach((page) => updateReady(page.dataset.kind));
})();
