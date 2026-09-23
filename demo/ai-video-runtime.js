/* Hotel video editor. Smart EDL mode uses Turing TTS plus an optional
   vision/edit model; the legacy local mode keeps the Seedance path. Both
   render captions and motion graphics locally when the smart renderer is not
   available. */
(function () {
  'use strict';

  const page = document.querySelector('#tool-ai-video');
  if (!page) return;
  const $ = (selector) => page.querySelector(selector);
  const $$ = (selector) => [...page.querySelectorAll(selector)];
  const state = { assets: [], segments: [], copyMode: 'ai', copyOptions: [], ratio: '9:16', duration: 15, voice: 'verse', volume: .85, subtitles: true, subtitleStyle: 'clean-white', backgroundMusic: false, musicTrack: 'soft-piano', copy: '', generated: false, playing: false, previewTimer: null, previewStartedAt: 0, previewSegmentIndex: -1, editMode: 'smart', editPlan: null, editAnalysisSource: 'local-fallback', taggingRequestId: 0, seedanceVideoBlob: null, seedanceVideoUrl: '', seedanceDuration: 0, seedanceReadPending: false, ttsAudioBlob: null, ttsAudioUrl: '', ttsDuration: 0 };
  const fileName = (file) => String(file?.name || '酒店素材').replace(/\.[^.]+$/, '') || '酒店素材';
  const extension = (file) => String(file?.name || '').split('.').pop().toLowerCase();
  const isVideo = (file) => String(file?.type || '').startsWith('video/') || ['mp4', 'mov', 'm4v'].includes(extension(file));
  function seedanceEndpointCandidates() {
    if (location.protocol === 'file:') return [];
    // The app and proxy share one origin. Probing other ports after an upstream
    // 405 masks the actual company-gateway error as a local connection failure.
    return [`${location.origin}/api/generate-video`];
  }
  function seedancePrompt() {
    return [
      `制作一条约 ${state.duration} 秒、${state.ratio} 画幅的酒店宣传短视频。`,
      '画面只作为视觉风格参考；酒店原始图片和视频保留在本机，最终画面会由本地剪辑器使用，不要依赖或虚构具体酒店设施、品牌、价格和优惠。',
      '不要生成口播、对白、旁白或其他音频；配音会由 Turing 音频模型在后期单独合成。',
      '生成画面保持简洁优雅的酒店宣传氛围；不要生成字幕、可读文字、价格牌或额外标识，后期由本地剪辑器叠加字幕。'
    ].join('\n');
  }
  async function requestSeedanceVideo() {
    if (state.duration > 15) throw new Error('当前酒店成片模板设置为 15 秒，请将视频时长调整到 15 秒以内。');
    const form = new FormData();
    form.append('prompt', seedancePrompt());
    form.append('duration', String(state.duration));
    form.append('ratio', state.ratio);
    form.append('generate_audio', 'false');
    // Keep all original media local. The visual model only receives a short
    // generation prompt; the TTS request receives text only.
    const endpoint = seedanceEndpointCandidates()[0];
    if (!endpoint) throw new Error('当前页面由 file:// 直接打开，请通过酒店素材工坊本机服务访问后再生成。');
    let response;
    try {
      response = await fetch(endpoint, { method: 'POST', body: form });
    } catch (error) {
      if (error instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(String(error?.message || ''))) {
        throw new Error(`无法连接本机酒店素材工坊代理（${endpoint}）。请确认本机服务窗口仍在运行。`);
      }
      throw error;
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const trace = payload?.traceId ? `（追踪号 ${payload.traceId}）` : '';
      throw new Error(`${payload?.error || `Seedance 视频服务返回 ${response.status}`}${trace}`);
    }
    const blob = await response.blob();
    if (blob.size < 10000) throw new Error('Seedance 返回的视频文件无效。');
    const signature = await blob.slice(4, 8).text();
    if (signature && signature !== 'ftyp') throw new Error('Seedance 返回的文件不是可播放的 MP4。');
    return blob;
  }
  async function requestTtsAudio() {
    const profile = voiceProfiles[state.voice] || voiceProfiles.verse;
    const endpoint = seedanceEndpointCandidates()[0]?.replace(/\/api\/generate-video\/?$/, '/api/generate-audio');
    if (!endpoint) throw new Error('当前页面由 file:// 直接打开，请通过酒店素材工坊本机服务访问后再生成。');
    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice: profile.apiVoice, input: state.copy.trim(), response_format: 'mp3', speed: profile.speed })
      });
    } catch (error) {
      if (error instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(String(error?.message || ''))) {
        throw new Error(`无法连接本机音频代理（${endpoint}）。请确认本机服务窗口仍在运行。`);
      }
      throw error;
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const trace = payload?.traceId ? `（追踪号 ${payload.traceId}）` : '';
      throw new Error(`${payload?.error || `Turing 音频模型返回 ${response.status}`}${trace}`);
    }
    const blob = await response.blob();
    if (blob.size < 1024) throw new Error('Turing 音频模型返回的配音文件无效。');
    return blob;
  }

  function smartEndpoint(path) {
    if (location.protocol === 'file:') return '';
    return new URL(path, location.origin).toString();
  }

  async function assetThumbnails(asset) {
    try {
      const media = await loadMedia(asset);
      const sourceWidth = media.videoWidth || media.naturalWidth || 720;
      const sourceHeight = media.videoHeight || media.naturalHeight || 1280;
      const scale = Math.min(1, 480 / Math.max(sourceWidth, sourceHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) return [];
      const duration = Number(media.duration || 0);
      const positions = media.tagName === 'VIDEO' && Number.isFinite(duration) && duration > .3
        ? [.2, .5, .8].map(ratio => Math.max(0, Math.min(duration * ratio, Math.max(0, duration - .08))))
        : [0];
      const thumbnails = [];
      for (const position of [...new Set(positions)]) {
        if (media.tagName === 'VIDEO' && position > 0) await new Promise((resolve) => {
          const onSeeked = () => { media.removeEventListener('seeked', onSeeked); resolve(); };
          media.addEventListener('seeked', onSeeked, { once: true });
          media.currentTime = position;
        });
        ctx.fillStyle = '#15171b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawCover(ctx, media, canvas.width, canvas.height);
        thumbnails.push(canvas.toDataURL('image/jpeg', .68));
      }
      return thumbnails;
    } catch (error) {
      console.warn('智能剪辑缩略图生成失败：', error);
      return [];
    }
  }

  async function assetThumbnail(asset) {
    return (await assetThumbnails(asset))[0] || '';
  }

  async function buildVisualManifest() {
    const manifest = [];
    for (let index = 0; index < state.assets.length; index += 1) {
      const asset = state.assets[index];
      let width = 0; let height = 0; let duration = 0;
      try {
        const media = await loadMedia(asset);
        width = media.videoWidth || media.naturalWidth || 0;
        height = media.videoHeight || media.naturalHeight || 0;
        duration = Number(media.duration || 0);
        if (duration > 0) asset.duration = duration;
      } catch (_) { /* the normal renderer will report an unreadable asset */ }
      manifest.push({
        id: index,
        name: fileName(asset.file),
        type: isVideo(asset.file) ? 'video' : 'image',
        sceneTag: asset.sceneType || '',
        width,
        height,
        duration,
        thumbnail: await assetThumbnail(asset)
      });
    }
    return manifest;
  }

  function assetTagStatus(asset) {
    if (asset?.tagSource === 'manual') return asset.sceneType ? '手动' : '未选择';
    if (asset?.tagSource === 'ai') return 'AI 推荐';
    if (asset?.tagSource === 'review') return '待确认';
    if (asset?.tagSource === 'failed') return '识别失败';
    if (asset?.tagSource === 'pending') return '识别中';
    return '未选择';
  }

  function localSceneGuess(asset) {
    const guessed = sceneTypeForText(fileName(asset?.file));
    return {
      sceneType: guessed,
      confidence: guessed === 'other' ? .18 : .42,
      tagSource: 'review',
      rationale: guessed === 'other' ? '未配置视觉模型，无法从文件名推断' : '未配置视觉模型，按文件名作初步推测'
    };
  }

  async function autoTagAssets() {
    const requestId = ++state.taggingRequestId;
    const assets = state.assets.filter(asset => !asset.manualOverride);
    if (!assets.length) return;
    assets.forEach(asset => { asset.tagSource = 'pending'; asset.rationale = ''; });
    renderAssets();
    setStatus(`正在识别 ${assets.length} 个素材的镜头标签…`);

    let fallbackReason = '';
    try {
      const manifest = await Promise.all(assets.map(async (asset, index) => {
        let width = 0; let height = 0; let duration = 0;
        try {
          const media = await loadMedia(asset);
          width = media.videoWidth || media.naturalWidth || 0;
          height = media.videoHeight || media.naturalHeight || 0;
          duration = Number(media.duration || 0);
        } catch (_) { /* server can still use the filename and any available thumbnail */ }
        return { id: state.assets.indexOf(asset), name: fileName(asset.file), type: isVideo(asset.file) ? 'video' : 'image', width, height, duration, thumbnails: await assetThumbnails(asset) };
      }));
      if (requestId !== state.taggingRequestId) return;
      const endpoint = smartEndpoint('/api/analyze-tags');
      if (!endpoint) throw new Error('当前页面未通过本机服务打开');
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assets: manifest }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || `自动标签服务返回 ${response.status}`);
      const byId = new Map((Array.isArray(payload.results) ? payload.results : []).map(result => [Number(result.id), result]));
      state.assets.forEach((asset, index) => {
        if (asset.manualOverride) return;
        const result = byId.get(index) || {};
        asset.sceneType = sceneTypes[result.sceneType] ? result.sceneType : 'other';
        asset.confidence = Number.isFinite(Number(result.confidence)) ? Math.max(0, Math.min(1, Number(result.confidence))) : .25;
        asset.rationale = String(result.rationale || '模型未提供明确的画面依据');
        asset.tagSource = result.tagSource === 'ai' && asset.confidence >= .72 ? 'ai' : 'review';
      });
    } catch (error) {
      fallbackReason = error?.message || '视觉模型不可用';
      if (requestId !== state.taggingRequestId) return;
      state.assets.forEach(asset => {
        if (asset.manualOverride) return;
        Object.assign(asset, localSceneGuess(asset));
      });
    }
    if (requestId !== state.taggingRequestId) return;
    renderAssets();
    syncControls();
    if (fallbackReason) setStatus(`视觉模型暂不可用，已给出文件名初步推荐，请确认标签。`, 'ready');
    else {
      const reviewCount = state.assets.filter(asset => asset.tagSource === 'review').length;
      setStatus(reviewCount ? `已完成自动识别，${reviewCount} 个素材建议人工确认。` : '已完成自动识别，标签已回填到每个素材。', 'ready');
    }
  }

  function buildEstimatedNarrationTimeline(audioDuration = state.duration) {
    const parts = state.copy.split(/[。！？]/).map((item) => item.trim()).filter(Boolean).slice(0, 6);
    const weights = parts.map((text) => Math.max(2, text.length));
    const total = weights.reduce((sum, value) => sum + value, 0) || 1;
    let cursor = 0;
    return parts.map((text, index) => {
      const duration = Math.max(.6, audioDuration * weights[index] / total);
      const item = { index, text, start: cursor, end: cursor + duration, timingSource: 'estimated' };
      cursor += duration;
      return item;
    });
  }

  async function requestSpeechAlignment(audioBlob) {
    const endpoint = smartEndpoint('/api/align-audio');
    if (!endpoint) return null;
    const form = new FormData();
    form.append('audio', audioBlob, 'hotel-voiceover.mp3');
    const asrModel = String($('#apiAsrModelInput')?.value || '').trim();
    if (asrModel) form.append('model', asrModel);
    try {
      const response = await fetch(endpoint, { method: 'POST', body: form });
      if (!response.ok) return null;
      const payload = await response.json().catch(() => ({}));
      const words = Array.isArray(payload.words) ? payload.words.filter(item => Number.isFinite(Number(item.start)) && Number.isFinite(Number(item.end))) : [];
      return words.length ? words : null;
    } catch (error) {
      console.warn('旁白时间轴对齐不可用，将使用估算时间轴：', error);
      return null;
    }
  }

  function splitTimelineWithWords(timeline, words) {
    if (!words?.length) return timeline;
    let cursor = 0;
    return timeline.map((item) => {
      const expected = String(item.text || '').replace(/\s/g, '');
      const wordStart = cursor;
      let start = cursor < words.length ? Number(words[cursor].start) : item.start;
      let matched = 0;
      while (cursor < words.length && matched < expected.length) {
        matched += String(words[cursor].word || words[cursor].text || '').replace(/\s/g, '').length || 1;
        cursor += 1;
      }
      const endWord = words[Math.max(cursor - 1, 0)];
      const end = endWord ? Number(endWord.end) : item.end;
      return { ...item, start: Math.max(0, start), end: Math.max(start + .2, end), timingSource: 'word-aligned', words: words.slice(wordStart, cursor) };
    });
  }

  function fallbackSmartPlan(timeline) {
    const used = new Set();
    const ranges = timeline.map((item, index) => {
      const desired = sceneTypeForText(item.text);
      const matching = state.assets.map((asset, assetIndex) => ({ asset, assetIndex }))
        .filter(({ asset, assetIndex }) => asset.sceneType === desired && asset.tagSource !== 'unselected' && asset.tagSource !== 'failed' && !used.has(assetIndex))
        .sort((left, right) => Number(right.asset.tagSource === 'manual') - Number(left.asset.tagSource === 'manual'));
      const unused = state.assets.map((asset, assetIndex) => ({ asset, assetIndex })).filter(({ assetIndex }) => !used.has(assetIndex));
      const choice = (matching.length ? matching : unused.length ? unused : state.assets.map((asset, assetIndex) => ({ asset, assetIndex })))[index % state.assets.length];
      const assetIndex = choice?.assetIndex ?? (index % Math.max(1, state.assets.length));
      used.add(assetIndex);
      const asset = state.assets[assetIndex];
      const sourceDuration = isVideo(asset?.file) && Number(asset.duration) > 0 ? Math.min(Number(asset.duration), Math.max(.6, item.end - item.start)) : Math.max(.6, item.end - item.start);
      return { assetIndex, sourceStart: 0, sourceEnd: sourceDuration, voiceStart: item.start, voiceEnd: item.end, text: item.text, beat: desired, reason: desired !== 'other' ? `按${sceneMeta(desired).label}标签与旁白关键词匹配` : '未配置视觉模型，按素材顺序生成可编辑初稿' };
    });
    return { version: 1, engine: 'video-use-inspired', source: 'local-fallback', ratio: state.ratio, total_duration_s: timeline.reduce((sum, item) => sum + Math.max(.6, item.end - item.start), 0), ranges };
  }

  async function requestSmartEditPlan(audioBlob, audioDuration) {
    const manifest = await buildVisualManifest();
    const words = await requestSpeechAlignment(audioBlob);
    const timeline = splitTimelineWithWords(buildEstimatedNarrationTimeline(audioDuration), words);
    const endpoint = smartEndpoint('/api/analyze-edit');
    if (!endpoint) return { plan: fallbackSmartPlan(timeline), timeline, manifest, source: 'local-fallback' };
    const payload = { ratio: state.ratio, targetDuration: state.duration, copy: state.copy, narration: timeline, assets: manifest };
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      // The LLM is allowed to choose the shot, but not to rewrite the spoken
      // copy. Requiring one range per narration item keeps captions, voiceover
      // and visuals on the same sentence boundaries.
      if (response.ok && Array.isArray(result.ranges) && result.ranges.length === timeline.length) {
        return { plan: { ...result, narration: timeline }, timeline, manifest, source: 'llm' };
      }
      setStatus('智能剪辑模型暂不可用，已使用本地 EDL 初稿；配置剪辑模型后可重新生成。', 'ready');
    } catch (error) {
      console.warn('智能剪辑模型请求失败：', error);
      setStatus('智能剪辑模型连接失败，已使用本地 EDL 初稿。', 'ready');
    }
    return { plan: fallbackSmartPlan(timeline), timeline, manifest, source: 'local-fallback' };
  }

  function applySmartEditPlan(plan, timeline = []) {
    const ranges = Array.isArray(plan?.ranges) ? plan.ranges : [];
    if (!ranges.length || !state.assets.length) throw new Error('智能剪辑没有返回有效的 EDL 分镜。');
    const narration = Array.isArray(timeline) && timeline.length
      ? timeline
      : (Array.isArray(plan?.narration) ? plan.narration : []);
    state.segments = ranges.map((range, index) => {
      const assetIndex = Math.max(0, Math.min(state.assets.length - 1, Number(range.assetIndex ?? range.asset_index ?? index) || 0));
      const mediaStart = Math.max(0, Number(range.sourceStart ?? range.source_start ?? range.start ?? 0) || 0);
      const mediaEnd = Math.max(mediaStart + .1, Number(range.sourceEnd ?? range.source_end ?? range.end ?? mediaStart + 2) || mediaStart + 2);
      const sourceDuration = Math.max(.4, mediaEnd - mediaStart);
      const narrationIndex = Number(range.narrationIndex ?? range.narration_index ?? index);
      const narrationItem = narration[Number.isInteger(narrationIndex) && narrationIndex >= 0 ? narrationIndex : index];
      const voiceStart = Number(narrationItem?.start ?? range.voiceStart ?? range.voice_start);
      const voiceEnd = Number(narrationItem?.end ?? range.voiceEnd ?? range.voice_end);
      const duration = Math.max(.4, Number.isFinite(voiceStart) && Number.isFinite(voiceEnd) ? voiceEnd - voiceStart : sourceDuration);
      const text = String(narrationItem?.text || range.text || range.caption || state.copy || '酒店体验').trim().slice(0, 120);
      const rangeBeat = String(range.beat || '').trim().toLowerCase();
      const sceneTag = sceneTypes[rangeBeat] ? rangeBeat : (sceneTypeForText(text) !== 'other' ? sceneTypeForText(text) : state.assets[assetIndex]?.sceneType || '');
      const motion = captionMotionFor(text, index, range.motion);
      return { assetIndex, sourceDuration, mediaStart, mediaEnd, voiceStart, voiceEnd, timelineDuration: duration, captionStart: 0, captionEnd: duration, text, sceneTag, motion };
    });
    state.editPlan = { ...plan, narration, ranges: ranges.map((range, index) => ({ ...range, assetIndex: Math.max(0, Math.min(state.assets.length - 1, Number(range.assetIndex ?? range.asset_index ?? index) || 0)) })) };
    return state.segments;
  }
  const sceneTypes = {
    room: { label: '客房', icon: '⌂', keywords: ['房间', '客房', '卧室', '床', '套房', '睡', 'room', 'bed', 'suite'] },
    pool: { label: '泳池', icon: '≈', keywords: ['泳池', '游泳', '水上', 'pool', 'spa', '水疗'] },
    dining: { label: '餐饮', icon: '✦', keywords: ['早餐', '餐', '美食', '下午茶', '晚餐', '咖啡', '餐厅', '吃', 'dining', 'food', 'breakfast'] },
    lobby: { label: '大堂', icon: '◎', keywords: ['大堂', '前台', '门厅', '接待', '大厅', 'lobby', 'reception'] },
    exterior: { label: '周边', icon: '⌖', keywords: ['位置', '交通', '周边', '城市', '景点', '出行', '地铁', 'exterior', 'city'] },
    other: { label: '其他', icon: '＋', keywords: [] }
  };
  const sceneTypeKeys = Object.keys(sceneTypes);
  const sceneOptions = ['<option value="">— 不选择 —</option>', ...sceneTypeKeys.map((key) => `<option value="${key}">${sceneTypes[key].icon} ${sceneTypes[key].label}</option>`)].join('');
  const voiceProfiles = {
    verse: { label: 'Verse · 自然叙述', apiVoice: 'alloy', speed: 1 },
    coral: { label: 'Coral · 温和女声', apiVoice: 'shimmer', speed: .98 },
    shimmer: { label: 'Shimmer · 明亮女声', apiVoice: 'shimmer', speed: 1.02 },
    sage: { label: 'Sage · 稳重女声', apiVoice: 'echo', speed: .96 },
    alloy: { label: 'Alloy · 清晰中性', apiVoice: 'alloy', speed: 1 },
    ash: { label: 'Ash · 沉稳男声', apiVoice: 'onyx', speed: .96 },
    echo: { label: 'Echo · 低沉男声', apiVoice: 'echo', speed: .92 },
    ballad: { label: 'Ballad · 温和叙述', apiVoice: 'fable', speed: .98 }
  };
  const subtitleStyles = {
    'clean-white': { label: '白字阴影', background: 'rgba(8, 10, 13, .68)', color: '#fff', accent: '#9cddff', stroke: '#4d9fff', shadow: true },
    'soft-blue': { label: '浅蓝卡片', background: 'rgba(232, 244, 255, .94)', color: '#234d70', accent: '#bfeaff', stroke: '#5eafff', shadow: false },
    'warm-label': { label: '暖色标签', background: 'rgba(255, 245, 226, .95)', color: '#774d25', accent: '#ffe0a6', stroke: '#e7a84d', shadow: false }
  };
  const headlineKeywords = [
    '云端夜景', '城市中心', '行政酒廊', '亲子度假', '智能客房', '沉浸体验', '品质升级', '自在旅居',
    '江景', '海景', '夜景', '大床房', '套房', '早餐', '泳池', '下午茶', '落地窗', '城市景观',
    '科技', '未来', '焕新', '舒适', '松弛感', '高级感', '氛围感', '私享', '静谧', '轻松', '值得收藏'
  ];
  const musicTracks = {
    'soft-piano': '轻柔钢琴',
    'city-light': '城市轻快',
    'hotel-ambient': '高级氛围'
  };
  const captionMotionNames = ['fade', 'typewriter', 'slide-left', 'slide-right', 'slide-up'];
  const progressOverlay = document.querySelector('#progress-overlay');
  const progressStage = document.querySelector('#progress-stage');
  const progressDetail = document.querySelector('#progress-detail');
  const progressBar = document.querySelector('#progress-bar');
  const progressPercent = document.querySelector('#progress-percent');

  function setStatus(message, tone = '') {
    const status = $('#aiVideoStatus');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-ready', tone === 'ready');
    status.classList.toggle('is-error', tone === 'error');
  }

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

  function captionMotionState(motion, progress, textLength = 1) {
    const value = captionMotionFor('', 0, motion);
    const p = Math.max(0, Math.min(1, Number(progress) || 0));
    const ease = (amount) => amount * amount * (3 - 2 * amount);
    const entrance = ease(Math.max(0, Math.min(1, p / .24)));
    const exit = ease(Math.max(0, Math.min(1, (p - .78) / .22)));
    const opacity = value === 'typewriter' ? 1 : Math.max(0, Math.min(1, entrance * (1 - exit)));
    const travel = Math.min(1, 26 + textLength * 1.5);
    let offsetX = 0;
    let offsetY = 0;
    if (value === 'slide-left') offsetX = (1 - entrance) * -travel + exit * travel;
    if (value === 'slide-right') offsetX = (1 - entrance) * travel - exit * travel;
    if (value === 'slide-up') offsetY = (1 - entrance) * travel - exit * travel;
    const reveal = value === 'typewriter' ? Math.max(0, Math.ceil(textLength * Math.min(1, p / .48))) : textLength;
    return { opacity, offsetX, offsetY, reveal };
  }

  function captionFitScale(preferredChars = 11) {
    const items = state.segments.length ? state.segments : [{ text: state.copy || '' }];
    const longestLine = Math.max(preferredChars, ...items.flatMap((item) => splitHeadlineLines(item.text, preferredChars, 2).map((line) => [...line].length)));
    return Math.max(.52, Math.min(1, preferredChars / longestLine));
  }

  function selectedFiles(files) {
    return (Array.isArray(files) ? files : []).filter((file) => {
      const type = String(file?.type || '');
      if (type.startsWith('image/')) return ['image/jpeg', 'image/png', 'image/webp'].includes(type);
      if (type.startsWith('video/')) return ['video/mp4', 'video/quicktime', 'video/x-m4v'].includes(type);
      return ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'm4v'].includes(extension(file));
    });
  }

  function updateAssetTagUi(index) {
    const asset = state.assets[index]; const cell = $(`.ai-video-asset[data-asset-index="${index}"]`);
    if (!asset || !cell) return;
    const select = cell.querySelector('.ai-video-asset-scene-select'); if (select) select.value = asset.sceneType || '';
    const badge = cell.querySelector('.ai-video-asset-detection');
    if (badge) {
      badge.className = `ai-video-asset-detection is-${asset.tagSource || 'pending'}`;
      badge.textContent = assetTagStatus(asset);
      const confidence = Number(asset.confidence) > 0 ? ` · 置信度 ${Math.round(Number(asset.confidence) * 100)}%` : '';
      badge.title = `${asset.rationale || ''}${confidence}`.trim();
    }
  }

  function sceneTypeForText(text) {
    const value = String(text || '').toLowerCase();
    let best = 'other'; let score = 0;
    sceneTypeKeys.forEach((key) => {
      const current = sceneTypes[key].keywords.reduce((total, keyword) => total + (value.includes(keyword.toLowerCase()) ? 1 : 0), 0);
      if (current > score) { score = current; best = key; }
    });
    return best;
  }

  function sceneMeta(key) {
    return key ? (sceneTypes[key] || sceneTypes.other) : { label: '未选择', icon: '—', keywords: [] };
  }

  function selectedSceneLabels() {
    return [...new Set(state.assets.filter((asset) => asset.sceneType && (asset.tagSource === 'manual' || (asset.tagSource === 'ai' && asset.confidence >= .72))).map((asset) => sceneMeta(asset.sceneType).label))];
  }

  function headlineParts(text, sceneType = 'other') {
    const meta = sceneMeta(sceneType);
    const raw = String(text || meta.label).replace(/\s+/g, '').trim();
    const clauses = raw.split(/[，。！？、；：:]/).map((item) => item.trim()).filter(Boolean);
    const topic = String($('#aiVideoTopic')?.value || '').replace(/\s+/g, '').trim();
    const highlights = String($('#aiVideoHighlights')?.value || '').split(/[，,、；;]/).map((item) => item.replace(/\s+/g, '').trim()).filter(Boolean);
    const sceneWords = meta.keywords.filter((item) => /[\u3400-\u9fff]{2,}/.test(item));
    const candidates = [...highlights, topic, ...headlineKeywords, ...sceneWords, meta.label]
      .filter((item) => item.length >= 2 && item.length <= 10 && raw.includes(item))
      .sort((a, b) => b.length - a.length);
    let keyword = candidates[0] || '';
    let clause = clauses.find((item) => keyword && item.includes(keyword)) || clauses[0] || raw || meta.label;
    clause = clause.slice(0, 24);
    if (!keyword || !clause.includes(keyword)) {
      const size = clause.length >= 10 ? 4 : clause.length >= 6 ? 3 : Math.max(2, Math.ceil(clause.length / 2));
      const start = Math.max(0, Math.min(clause.length - size, Math.floor((clause.length - size) * .55)));
      keyword = clause.slice(start, start + size) || meta.label;
    }
    const keywordIndex = Math.max(0, clause.indexOf(keyword));
    let lead = clause.slice(0, keywordIndex);
    let tail = clause.slice(keywordIndex + keyword.length);
    if (lead.length > 7) lead = lead.slice(-7);
    if (tail.length > 7) tail = tail.slice(0, 7);
    if (!lead && !tail && clause !== keyword) tail = clause.replace(keyword, '').slice(0, 7);
    return { lead, keyword, tail };
  }

  function splitHeadlineLines(value, preferredChars = 11, maxLines = 2) {
    const raw = String(value || '').replace(/\s+/g, '').trim();
    if (!raw) return [];
    const chars = [...raw];
    if (chars.length <= preferredChars || maxLines <= 1) return [raw];
    const target = Math.max(1, Math.ceil(chars.length / maxLines));
    const punctuation = /[，。！？；：,.!?;:]/;
    let boundary = target;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let index = 1; index < chars.length; index += 1) {
      const punctuationBonus = punctuation.test(chars[index - 1]) ? -3 : 0;
      const score = Math.abs(index - target) + punctuationBonus;
      if (score < bestScore) { bestScore = score; boundary = index; }
    }
    return [chars.slice(0, boundary).join(''), chars.slice(boundary).join('')].filter(Boolean).slice(0, maxLines);
  }

  function renderHeadlinePreview(node, text, sceneType, progress = 1, segmentIndex = 0, requestedMotion = '') {
    if (!node) return;
    const raw = String(text || '酒店好住，也要好看').replace(/\s+/g, '').trim();
    const motion = captionMotionFor(raw, segmentIndex, requestedMotion);
    const motionState = captionMotionState(motion, progress, [...raw].length);
    const visibleRaw = [...raw].slice(0, motionState.reveal).join('');
    node.style.opacity = String(motionState.opacity);
    node.style.transform = `translate3d(${motionState.offsetX.toFixed(1)}px, ${motionState.offsetY.toFixed(1)}px, 0)`;
    node.dataset.motion = motion;
    if (!visibleRaw) { node.replaceChildren(); return; }
    const parts = headlineParts(raw, sceneType);
    const lines = splitHeadlineLines(visibleRaw, 11, 2);
    node.style.setProperty('--headline-fit', captionFitScale(11).toFixed(3));
    const lineNodes = lines.map((value) => {
      const line = document.createElement('span'); line.className = 'ai-video-headline-full-line';
      const keywordIndex = parts.keyword ? value.indexOf(parts.keyword) : -1;
      const append = (content, className) => {
        if (!content) return;
        const span = document.createElement('span'); span.className = className; span.textContent = content; line.appendChild(span);
      };
      if (keywordIndex >= 0) {
        append(value.slice(0, keywordIndex), 'ai-video-headline-support');
        append(value.slice(keywordIndex, keywordIndex + parts.keyword.length), 'ai-video-headline-keyword');
        append(value.slice(keywordIndex + parts.keyword.length), 'ai-video-headline-support');
      } else append(value, 'ai-video-headline-support');
      return line;
    });
    const rule = document.createElement('span'); rule.className = 'ai-video-headline-rule'; rule.setAttribute('aria-hidden', 'true');
    node.replaceChildren(...lineNodes, rule);
  }

  function addFiles(files) {
    const incoming = selectedFiles(files);
    if (!incoming.length) {
      if (files?.length) setStatus('素材格式不受支持，请使用 JPG、PNG、WebP、MP4 或 MOV 文件。', 'error');
      return;
    }
    state.taggingRequestId += 1;
    invalidateSeedanceResult();
    state.assets.forEach((asset) => URL.revokeObjectURL(asset.url));
    state.assets = incoming.slice(0, 30).map((file) => ({ file, url: URL.createObjectURL(file), sceneType: '', tagSource: 'unselected', confidence: 0, manualOverride: false }));
    state.segments = [];
    state.generated = false;
    if ($('#aiVideoResultPanel')) $('#aiVideoResultPanel').hidden = true;
    renderAssets();
    syncControls();
    setStatus(`已添加 ${state.assets.length} 个素材，正在自动识别镜头标签…`);
    void autoTagAssets();
  }

  function removeAsset(index) {
    const asset = state.assets[index];
    if (!asset) return;
    state.taggingRequestId += 1;
    const label = fileName(asset.file);
    // A generated EDL contains asset indexes, so invalidate it before the
    // array is reindexed. This prevents an export from using the wrong file.
    invalidateSeedanceResult(`已删除「${label}」，请重新生成文案或视频。`);
    URL.revokeObjectURL(asset.url);
    state.assets.splice(index, 1);
    state.segments = [];
    state.editPlan = null;
    state.generated = false;
    renderAssets();
    syncControls();
    setStatus(`已删除「${label}」${state.assets.length ? '，可以继续调整素材。' : '，请重新上传素材。'}`, 'ready');
  }

  function renderAssets() {
    const grid = $('#aiVideoAssetGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!state.assets.length) {
      grid.innerHTML = '<div class="ai-video-asset-empty"><span>⌁</span><p>还没有素材</p><small>导入素材后，可按需手动选择镜头标签</small></div>';
      return;
    }
    state.assets.forEach((asset, index) => {
      const cell = document.createElement('div');
      cell.className = 'ai-video-asset';
      cell.dataset.index = String(index + 1).padStart(2, '0');
      cell.dataset.assetIndex = String(index);
      const media = isVideo(asset.file) ? document.createElement('video') : document.createElement('img');
      media.src = asset.url;
      media.muted = true;
      media.playsInline = true;
      if (media.tagName === 'VIDEO') media.preload = 'metadata';
      media.alt = `${fileName(asset.file)} 素材`;
      cell.appendChild(media);
      const kind = document.createElement('span');
      kind.className = 'ai-video-asset-kind';
      kind.textContent = isVideo(asset.file) ? 'VIDEO' : 'IMAGE';
      cell.appendChild(kind);
      const detection = document.createElement('span');
      detection.className = `ai-video-asset-detection is-${asset.tagSource || 'pending'}`;
      detection.textContent = assetTagStatus(asset);
      const confidence = Number(asset.confidence) > 0 ? ` · 置信度 ${Math.round(Number(asset.confidence) * 100)}%` : '';
      detection.title = `${asset.rationale || ''}${confidence}`.trim();
      cell.appendChild(detection);
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'ai-video-asset-remove';
      removeButton.setAttribute('aria-label', `删除${fileName(asset.file)}`);
      removeButton.title = `删除${fileName(asset.file)}`;
      removeButton.textContent = '×';
      removeButton.addEventListener('click', (event) => {
        event.preventDefault(); event.stopPropagation();
        removeAsset(index);
      });
      cell.appendChild(removeButton);
      const sceneSelect = document.createElement('select');
      sceneSelect.className = 'ai-video-asset-scene-select';
      sceneSelect.setAttribute('aria-label', `${fileName(asset.file)} 镜头标签`);
      sceneSelect.innerHTML = sceneOptions;
      sceneSelect.value = asset.sceneType || '';
      sceneSelect.addEventListener('change', () => {
        asset.sceneType = sceneSelect.value;
        asset.manualOverride = true; asset.tagSource = sceneSelect.value ? 'manual' : 'unselected'; asset.confidence = sceneSelect.value ? 1 : 0; asset.rationale = sceneSelect.value ? '用户手动确认' : '用户取消了自动标签'; updateAssetTagUi(index);
        state.segments.forEach((segment) => { if (segment.assetIndex === index) segment.sceneTag = sceneSelect.value; });
        if (state.generated) renderPreview(); else renderTimeline();
        setStatus(asset.sceneType
          ? `已将「${fileName(asset.file)}」标记为${sceneMeta(asset.sceneType).label}，AI 文案和自动剪辑会参考这个提示。`
          : `已取消「${fileName(asset.file)}」的镜头标签，AI 文案和自动剪辑不会使用标签提示。`, 'ready');
      });
      cell.appendChild(sceneSelect);
      grid.appendChild(cell);
    });
    $('#aiVideoAssetCount').textContent = `${state.assets.length} / 30`;
  }

  function fieldsValid() {
    if (state.copyMode === 'manual') return Boolean($('#aiVideoManualCopy')?.value.trim());
    return Boolean($('#aiVideoTopic')?.value.trim() && $('#aiVideoHighlights')?.value.trim());
  }

  function syncControls() {
    const hasAssets = state.assets.length > 0;
    const canCopy = hasAssets && fieldsValid();
    syncSelectedCopy();
    const canVideo = hasAssets && Boolean(state.copy.trim());
    if ($('#aiVideoGenerateCopy')) $('#aiVideoGenerateCopy').disabled = !canCopy;
    if ($('#aiVideoGenerateVideo')) $('#aiVideoGenerateVideo').disabled = !canVideo;
    if ($('#aiVideoUseCopy')) $('#aiVideoUseCopy').disabled = !canVideo;
    if ($('#aiVideoAssetCount')) $('#aiVideoAssetCount').textContent = `${state.assets.length} / 30`;
  }

  function buildCopyVariants() {
    if (state.copyMode === 'manual') return [String($('#aiVideoManualCopy')?.value || '').trim()];
    const clean = (value) => String(value || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').replace(/[。！？；;，,、]+$/g, '').trim();
    const splitList = (value) => [...new Set(String(value || '').split(/[，,、；;|]+/).map(clean).filter(Boolean))];
    const joinList = (items) => items.length <= 1 ? (items[0] || '') : items.length === 2 ? `${items[0]}和${items[1]}` : `${items.slice(0, -1).join('、')}和${items.at(-1)}`;
    const topic = clean($('#aiVideoTopic')?.value);
    const featureItems = splitList($('#aiVideoHighlights')?.value);
    const sceneLabels = selectedSceneLabels();
    const features = [...new Set([...featureItems, ...sceneLabels].map(clean).filter(Boolean))];
    const featureSentence = features.length
      ? `这里有${joinList(features)}，从入住到离店，每个细节都让人更安心。`
      : '从入住到离店，每个细节都让人更安心。';
    const audience = clean($('#aiVideoAudience')?.value);
    const offer = clean($('#aiVideoOffer')?.value);
    const audienceLine = audience ? `无论是${audience}，都能在这里找到舒服的入住节奏。` : '适合想住得舒服、玩得轻松的旅人。';
    const offerLine = offer ? `${offer}，现在就来安排一场轻松的入住吧。` : '收藏这条视频，下一次出发就住这里。';
    const featureShort = features.length ? joinList(features) : '舒适的空间与贴心服务';
    return [
      `${topic}，把旅途里的疲惫交给一间舒服的房间。${featureSentence}${audienceLine}${offerLine}`,
      `周末想换个地方放松？来住${topic}。${featureSentence}${audienceLine}${offerLine}`,
      `这次出发，住得舒服也很重要。${topic}把${featureShort}安排得恰到好处。${audienceLine}${offerLine}`,
      `把假期过成喜欢的样子，住进${topic}。${featureSentence}推开门，就是轻松的开始。${audienceLine}${offerLine}`,
      `正在计划下一次入住？${topic}值得收藏。${featureSentence}给忙碌的旅程留一段真正放松的时间。${audienceLine}${offerLine}`
    ];
  }

  function renderCopy() {
    const list = $('#aiVideoCopyList');
    if (!list) return;
    list.innerHTML = '';
    const options = state.copyOptions.length ? state.copyOptions : [{ text: state.copy, selected: true }];
    options.forEach((option, index) => {
      const card = document.createElement('article');
      card.className = `ai-video-copy-card${option.selected ? ' is-selected' : ''}`;
      const textarea = document.createElement('textarea');
      textarea.maxLength = 400;
      textarea.setAttribute('aria-label', `第 ${index + 1} 条 AI 生成的视频文案`);
      textarea.value = option.text;
      textarea.addEventListener('input', () => {
        option.text = textarea.value;
        if (option.selected) {
          invalidateSeedanceResult();
          state.copy = textarea.value.trim();
        }
        syncControls();
        setStatus('文案已修改，确认后即可生成视频。', 'ready');
      });
      card.appendChild(textarea);
      const foot = document.createElement('div');
      foot.className = 'ai-video-copy-card-foot';
      const label = document.createElement('label');
      const check = document.createElement('input');
      check.type = 'radio'; check.name = 'aiVideoCopyChoice'; check.checked = Boolean(option.selected); check.setAttribute('aria-label', `采用第 ${index + 1} 条文案`);
      check.addEventListener('change', () => {
        if (check.checked) {
          invalidateSeedanceResult();
          state.copyOptions.forEach((item, itemIndex) => { item.selected = itemIndex === index; });
        }
        syncSelectedCopy();
        renderCopy();
        setStatus(check.checked ? `已选择第 ${index + 1} 条文案，可以生成视频。` : '已取消当前文案，请先选择一条再生成视频。', check.checked ? 'ready' : '');
      });
      label.append(check, document.createTextNode(`采用第 ${index + 1} 条文案`));
      const count = document.createElement('span');
      count.textContent = `${option.text.length} / 400`;
      foot.append(label, count);
      card.appendChild(foot);
      list.appendChild(card);
    });
    $('#aiVideoCopyCount').textContent = `已生成 ${options.length} 条`;
    $('#aiVideoCopyMeta').textContent = '可直接修改，选择一条后生成视频';
    syncControls();
  }

  function syncSelectedCopy() {
    if (state.copyMode !== 'ai' || !state.copyOptions.length) return;
    const selected = state.copyOptions.find((option) => option.selected && option.text.trim());
    state.copy = selected ? selected.text.trim() : '';
  }

  function animateProgress(done) {
    if (!progressOverlay) return done();
    progressOverlay.hidden = false;
    const stages = [
      ['分析素材…', '正在识别房间、设施和镜头节奏', 18],
      ['组织分镜…', '正在按文案重点排列画面', 42],
      ['生成配音…', `正在准备${voiceProfiles[state.voice]?.label || '普通话'} · 音量 ${Math.round(state.volume * 100)}%`, 67],
      ['合成视频…', state.backgroundMusic ? `正在混合${musicTracks[state.musicTrack] || '背景音乐'}与视频` : `正在合成画面${state.subtitles ? '与字幕' : ''}`, 88],
      ['完成', '视频初稿已准备好', 100]
    ];
    let index = 0;
    const tick = () => {
      const [stage, detail, percent] = stages[index];
      if (progressStage) progressStage.textContent = stage;
      if (progressDetail) progressDetail.textContent = detail;
      if (progressBar) progressBar.style.width = `${percent}%`;
      if (progressPercent) progressPercent.textContent = `${percent}%`;
      index += 1;
      if (index < stages.length) window.setTimeout(tick, 420);
      else window.setTimeout(() => { progressOverlay.hidden = true; done(); }, 360);
    };
    tick();
  }

  function createSegments() {
    const parts = state.copy.split(/[。！？]/).map((item) => item.trim()).filter(Boolean);
    const count = Math.max(1, Math.min(parts.length || 1, 6));
    const activeParts = parts.slice(0, count);
    const weights = activeParts.map((text) => Math.max(6, text.length));
    const weightTotal = weights.reduce((sum, value) => sum + value, 0) || 1;
    const used = new Set();
    const pickAssetForText = (text, index) => {
      const desiredType = sceneTypeForText(text);
      const matching = state.assets.map((asset, assetIndex) => ({ asset, assetIndex })).filter(({ asset, assetIndex }) => {
        const trustedType = asset.sceneType && !['unselected', 'failed', 'pending'].includes(asset.tagSource) ? asset.sceneType : '';
        return trustedType && trustedType === desiredType && !used.has(assetIndex);
      });
      const unused = state.assets.map((asset, assetIndex) => ({ asset, assetIndex })).filter(({ assetIndex }) => !used.has(assetIndex));
      const pool = matching.length ? matching : unused.length ? unused : state.assets.map((asset, assetIndex) => ({ asset, assetIndex }));
      const choice = pool[index % pool.length];
      if (choice) used.add(choice.assetIndex);
      return choice?.assetIndex ?? (index % state.assets.length);
    };
    state.segments = Array.from({ length: count }, (_, index) => {
      const text = activeParts[index] || state.copy || '酒店体验';
      const clipDuration = Math.max(.6, state.duration * (weights[index] || 1) / weightTotal);
      return {
      assetIndex: pickAssetForText(text, index),
      sourceDuration: clipDuration,
      mediaStart: 0,
      mediaEnd: clipDuration,
      captionStart: 0,
      captionEnd: clipDuration,
      text,
      motion: captionMotionFor(text, index)
    }; });
    state.segments.forEach((segment) => { segment.sceneTag = state.assets[segment.assetIndex]?.sceneType || ''; });
    return state.segments;
  }

  function ensureSegments() {
    const count = Math.max(1, Math.min(state.copy.split(/[。！？]/).map((item) => item.trim()).filter(Boolean).length || 1, 6));
    if (!state.segments.length || state.segments.length !== count) return createSegments();
    return state.segments;
  }

  function segmentDuration(segment) {
    return Math.max(.1, Number(segment.timelineDuration) || Math.max(segment.mediaEnd - segment.mediaStart, segment.captionEnd - segment.captionStart));
  }

  function timelineDuration() {
    return ensureSegments().reduce((sum, segment) => sum + segmentDuration(segment), 0);
  }

  function formatSeconds(value) {
    return `${Number(value || 0).toFixed(1)} 秒`;
  }

  function rescaleSegments(fromDuration, toDuration) {
    if (!state.segments.length || !fromDuration || fromDuration === toDuration) return;
    const scale = toDuration / fromDuration;
    state.segments.forEach((segment) => {
      segment.sourceDuration = Math.max(.5, segment.sourceDuration * scale);
      segment.mediaStart *= scale; segment.mediaEnd *= scale;
      segment.captionStart *= scale; segment.captionEnd *= scale;
      if (segment.timelineDuration) segment.timelineDuration *= scale;
    });
  }

  function renderTrimEditor() {
    const editor = $('#aiVideoTrimEditor');
    if (!editor) return;
    const segments = ensureSegments();
    editor.innerHTML = '';

    const heading = document.createElement('div'); heading.className = 'ai-video-trim-heading';
    heading.innerHTML = '<div><strong>逐段裁剪</strong><small>每段画面和字幕都可以单独调整起止时间</small></div><span>拖动左右边界</span>';
    const list = document.createElement('div'); list.className = 'ai-video-trim-list';

    segments.forEach((segment, index) => {
      const asset = state.assets[segment.assetIndex];
      const card = document.createElement('article'); card.className = 'ai-video-trim-card';
      const cardHead = document.createElement('div'); cardHead.className = 'ai-video-trim-card-head';
      const badge = document.createElement('span'); badge.textContent = String(index + 1).padStart(2, '0');
      const name = document.createElement('div');
      const title = document.createElement('strong'); title.textContent = fileName(asset?.file);
      const detail = document.createElement('small'); detail.textContent = isVideo(asset?.file) ? '视频片段' : '图片片段';
      const tag = document.createElement('em'); tag.className = `ai-video-trim-scene-tag scene-${asset?.sceneType || 'unselected'}`; tag.textContent = `${sceneMeta(asset?.sceneType).icon} ${sceneMeta(asset?.sceneType).label}`;
      name.append(title, detail, tag);
      const duration = document.createElement('b'); duration.textContent = formatSeconds(segmentDuration(segment));
      cardHead.append(badge, name, duration); card.appendChild(cardHead);

      const makeRange = (label, startKey, endKey) => {
        const group = document.createElement('div'); group.className = 'ai-video-trim-group';
        const groupHead = document.createElement('div'); groupHead.className = 'ai-video-trim-group-head';
        const groupLabel = document.createElement('strong'); groupLabel.textContent = label;
        const values = document.createElement('span');
        groupHead.append(groupLabel, values);
        const track = document.createElement('div'); track.className = 'ai-video-trim-range';
        const selected = document.createElement('i'); selected.className = 'ai-video-trim-selected';
        const start = document.createElement('input'); const end = document.createElement('input');
        const max = Math.max(.5, segment.sourceDuration);
        [start, end].forEach((input) => { input.type = 'range'; input.min = '0'; input.max = String(max); input.step = '.1'; });
        start.value = String(segment[startKey]); end.value = String(segment[endKey]);
        start.setAttribute('aria-label', `第 ${index + 1} 段${label}开始时间`);
        end.setAttribute('aria-label', `第 ${index + 1} 段${label}结束时间`);

        const update = (source, silent = false) => {
          let startValue = Number(start.value); let endValue = Number(end.value);
          if (endValue - startValue < .1) {
            if (source === start) startValue = Math.max(0, endValue - .1);
            else endValue = Math.min(max, startValue + .1);
          }
          start.value = String(startValue); end.value = String(endValue);
          segment[startKey] = startValue; segment[endKey] = endValue;
          values.textContent = `${startValue.toFixed(1)} – ${endValue.toFixed(1)} 秒`;
          selected.style.left = `${(startValue / max) * 100}%`;
          selected.style.right = `${100 - (endValue / max) * 100}%`;
          duration.textContent = formatSeconds(segmentDuration(segment));
          $('#aiVideoPreviewTime').textContent = `00:00 / 00:${String(Math.round(timelineDuration())).padStart(2, '0')}`;
          if (!silent) setStatus(`第 ${index + 1} 段裁剪已更新，可以继续预览或导出。`, 'ready');
        };
        start.addEventListener('input', () => update(start)); end.addEventListener('input', () => update(end));
        start.addEventListener('change', renderTimeline); end.addEventListener('change', renderTimeline);
        track.append(selected, start, end); group.append(groupHead, track); update(null, true); return group;
      };

      card.append(makeRange('画面裁剪', 'mediaStart', 'mediaEnd'));
      if (state.subtitles) {
        card.append(makeRange('字幕时段', 'captionStart', 'captionEnd'));
        const copy = document.createElement('label'); copy.className = 'ai-video-trim-copy'; copy.textContent = '字幕文字';
        const textarea = document.createElement('textarea'); textarea.rows = 2; textarea.maxLength = 120; textarea.value = segment.text;
        textarea.setAttribute('aria-label', `第 ${index + 1} 段字幕文字`);
        textarea.addEventListener('input', () => { segment.text = textarea.value; setStatus(`第 ${index + 1} 段字幕已修改。`, 'ready'); });
        textarea.addEventListener('change', renderTimeline);
        copy.appendChild(textarea); card.appendChild(copy);
      } else {
        const disabled = document.createElement('div'); disabled.className = 'ai-video-trim-disabled'; disabled.textContent = '字幕已关闭，仅保留画面裁剪'; card.appendChild(disabled);
      }
      list.appendChild(card);
    });
    editor.append(heading, list);
  }

  function bindTrackTrimHandle(handle, segmentNode, item, index, key, syncTrackSegment) {
    if (!handle) return;
    const max = Math.max(.5, item.sourceDuration);
    let drag = null;
    const setValue = (value) => {
      const otherKey = key === 'mediaStart' ? 'mediaEnd' : 'mediaStart';
      const minimum = key === 'mediaStart' ? 0 : item[otherKey] + .1;
      const maximum = key === 'mediaStart' ? item[otherKey] - .1 : max;
      item[key] = Math.round(Math.max(minimum, Math.min(maximum, value)) * 10) / 10;
      syncTrackSegment();
    };
    const onMove = (event) => {
      if (!drag) return;
      event.preventDefault();
      const delta = ((event.clientX - drag.startX) / Math.max(1, drag.width)) * max;
      setValue(drag.value + delta);
    };
    const onUp = () => {
      if (!drag) return;
      drag = null;
      segmentNode.classList.remove('is-dragging');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      renderTimeline();
      setStatus(`第 ${index + 1} 段画面裁剪已更新，可以继续预览或导出。`, 'ready');
    };
    handle.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const rect = segmentNode.getBoundingClientRect();
      drag = { startX: event.clientX, width: rect.width, value: item[key] };
      segmentNode.classList.add('is-dragging');
      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', onUp, { once: true });
    });
    handle.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      setValue(item[key] + direction * .1);
      renderTimeline();
      setStatus(`第 ${index + 1} 段画面裁剪已更新，可以继续预览或导出。`, 'ready');
    });
  }

  function renderTimeline() {
    const tracks = $('#aiVideoTimelineTracks');
    if (!tracks) return;
    const segments = ensureSegments();
    tracks.innerHTML = '';
    const mediaTrack = document.createElement('div'); mediaTrack.className = 'ai-video-track';
    const mediaLabel = document.createElement('span'); mediaLabel.textContent = '画面';
    const mediaBar = document.createElement('div'); mediaBar.className = 'ai-video-track-bar';
    const copyTrack = document.createElement('div'); copyTrack.className = 'ai-video-track';
    const copyLabel = document.createElement('span'); copyLabel.textContent = '字幕';
    const copyBar = document.createElement('div'); copyBar.className = 'ai-video-track-bar';
    copyTrack.hidden = !state.subtitles;
    segments.forEach((item, index) => {
      const asset = state.assets[item.assetIndex];
      const width = String(segmentDuration(item));
      const segment = document.createElement('div'); segment.className = 'ai-video-track-segment ai-video-track-segment-editable'; segment.style.flexGrow = width; segment.style.flexBasis = '0';
      const image = document.createElement('img'); image.src = asset.url; image.alt = '';
      const title = document.createElement('b'); title.textContent = `${fileName(asset.file)} · ${(item.mediaEnd - item.mediaStart).toFixed(1)}s`;
      const tag = document.createElement('span'); tag.className = `ai-video-track-tag scene-${asset.sceneType || 'unselected'}`; tag.textContent = `${sceneMeta(asset.sceneType).icon} ${sceneMeta(asset.sceneType).label}`;
      const selected = document.createElement('i'); selected.className = 'ai-video-track-selected';
      const startHandle = document.createElement('button'); startHandle.type = 'button'; startHandle.className = 'ai-video-track-handle ai-video-track-handle-start'; startHandle.setAttribute('role', 'slider'); startHandle.setAttribute('aria-label', `第 ${index + 1} 段画面裁剪开始边界`); startHandle.setAttribute('aria-valuemin', '0'); startHandle.setAttribute('aria-valuemax', String(Math.max(.5, item.sourceDuration))); startHandle.title = '拖动调整开始时间';
      const endHandle = document.createElement('button'); endHandle.type = 'button'; endHandle.className = 'ai-video-track-handle ai-video-track-handle-end'; endHandle.setAttribute('role', 'slider'); endHandle.setAttribute('aria-label', `第 ${index + 1} 段画面裁剪结束边界`); endHandle.setAttribute('aria-valuemin', '0'); endHandle.setAttribute('aria-valuemax', String(Math.max(.5, item.sourceDuration))); endHandle.title = '拖动调整结束时间';
      const syncTrackSegment = () => {
        const max = Math.max(.5, item.sourceDuration);
        const startPercent = Math.max(0, Math.min(100, item.mediaStart / max * 100));
        const endPercent = Math.max(startPercent, Math.min(100, item.mediaEnd / max * 100));
        selected.style.left = `${startPercent}%`;
        selected.style.right = `${100 - endPercent}%`;
        startHandle.style.left = `${startPercent}%`;
        endHandle.style.left = `${endPercent}%`;
        startHandle.setAttribute('aria-valuenow', item.mediaStart.toFixed(1));
        endHandle.setAttribute('aria-valuenow', item.mediaEnd.toFixed(1));
        title.textContent = `${fileName(asset.file)} · ${(item.mediaEnd - item.mediaStart).toFixed(1)}s`;
      };
      bindTrackTrimHandle(startHandle, segment, item, index, 'mediaStart', syncTrackSegment);
      bindTrackTrimHandle(endHandle, segment, item, index, 'mediaEnd', syncTrackSegment);
      segment.append(image, selected, startHandle, endHandle, tag, title); syncTrackSegment(); mediaBar.appendChild(segment);
      const caption = document.createElement('div'); caption.className = 'ai-video-track-segment ai-video-caption-segment'; caption.style.flexGrow = width; caption.style.flexBasis = '0';
      const captionText = document.createElement('b'); captionText.textContent = `${item.text || '酒店体验'} · ${(item.captionEnd - item.captionStart).toFixed(1)}s`; const captionTag = document.createElement('span'); captionTag.className = `ai-video-caption-tag scene-${asset.sceneType || 'unselected'}`; captionTag.textContent = sceneMeta(asset.sceneType).label; caption.append(captionTag, captionText); copyBar.appendChild(caption);
    });
    mediaTrack.append(mediaLabel, mediaBar); copyTrack.append(copyLabel, copyBar); tracks.append(mediaTrack, copyTrack);
    renderTrimEditor();
  }

  function previewSegmentAt(ratio = 0) {
    const segments = ensureSegments();
    const total = timelineDuration();
    let cursor = 0;
    const target = Math.max(0, Math.min(1, Number(ratio) || 0)) * total;
    for (let index = 0; index < segments.length; index += 1) {
      const length = segmentDuration(segments[index]);
      if (target <= cursor + length || index === segments.length - 1) return { item: segments[index], index, local: Math.max(0, Math.min(1, (target - cursor) / length)) };
      cursor += length;
    }
    return { item: segments[0], index: 0, local: 0 };
  }

  function seedanceMediaElement() {
    let media = document.querySelector('#aiVideoSeedanceAudioSource');
    if (!media) {
      media = document.createElement('video');
      media.id = 'aiVideoSeedanceAudioSource';
      media.preload = 'auto';
      media.playsInline = true;
      media.setAttribute('aria-hidden', 'true');
      Object.assign(media.style, { position: 'fixed', left: '-10000px', top: '0', width: '1px', height: '1px', opacity: '0', pointerEvents: 'none' });
      document.body.appendChild(media);
    }
    if (state.seedanceVideoUrl && media.src !== state.seedanceVideoUrl) {
      media.pause();
      media.src = state.seedanceVideoUrl;
      media.load();
    }
    return media;
  }

  function ttsAudioElement() {
    let media = document.querySelector('#aiVideoTtsAudioSource');
    if (!media) {
      media = document.createElement('audio');
      media.id = 'aiVideoTtsAudioSource';
      media.preload = 'auto';
      media.setAttribute('aria-hidden', 'true');
      Object.assign(media.style, { position: 'fixed', left: '-10000px', top: '0', width: '1px', height: '1px', opacity: '0', pointerEvents: 'none' });
      document.body.appendChild(media);
    }
    if (state.ttsAudioUrl && media.src !== state.ttsAudioUrl) {
      media.pause();
      media.src = state.ttsAudioUrl;
      media.load();
    }
    return media;
  }

  function waitForVideoMetadata(media, forceReload = false) {
    if (media.readyState >= 1 && Number.isFinite(media.duration) && media.duration > 0) return Promise.resolve(media.duration);
    return new Promise((resolve, reject) => {
      let settled = false;
      const cleanup = () => {
        window.clearTimeout(timeout);
        media.removeEventListener('loadedmetadata', onReady);
        media.removeEventListener('durationchange', onReady);
        media.removeEventListener('error', onError);
      };
      const settle = (callback, value) => {
        if (settled) return;
        settled = true;
        cleanup();
        callback(value);
      };
      const onReady = () => {
        if (Number.isFinite(media.duration) && media.duration > 0) settle(resolve, media.duration);
        else if (media.readyState >= 1) {
          const error = new Error('Seedance 视频文件没有有效时长。');
          error.code = 'SEEDANCE_MEDIA_INVALID';
          settle(reject, error);
        }
      };
      const onError = () => {
        const mediaCode = media.error?.code;
        const error = new Error(mediaCode
          ? `Seedance 视频已返回，但本机播放器无法解码（媒体错误 ${mediaCode}）。`
          : 'Seedance 视频已返回，但本机播放器无法解码。');
        error.code = 'SEEDANCE_MEDIA_UNREADABLE';
        settle(reject, error);
      };
      const timeout = window.setTimeout(() => {
        const error = new Error('Seedance 视频已返回，但浏览器在 90 秒内仍未读出时长。');
        error.code = 'SEEDANCE_MEDIA_TIMEOUT';
        settle(reject, error);
      }, 90000);
      media.addEventListener('loadedmetadata', onReady);
      media.addEventListener('durationchange', onReady);
      media.addEventListener('error', onError);
      if (forceReload || media.error) media.load();
      onReady();
    });
  }

  function waitForAudioMetadata(media, forceReload = false) {
    if (media.readyState >= 1 && Number.isFinite(media.duration) && media.duration > 0) return Promise.resolve(media.duration);
    return new Promise((resolve, reject) => {
      let settled = false;
      const cleanup = () => {
        window.clearTimeout(timeout);
        media.removeEventListener('loadedmetadata', onReady);
        media.removeEventListener('durationchange', onReady);
        media.removeEventListener('error', onError);
      };
      const settle = (callback, value) => {
        if (settled) return;
        settled = true;
        cleanup();
        callback(value);
      };
      const onReady = () => {
        if (Number.isFinite(media.duration) && media.duration > 0) settle(resolve, media.duration);
      };
      const onError = () => settle(reject, new Error('Turing 音频模型返回的配音无法在本机播放。'));
      const timeout = window.setTimeout(() => settle(reject, new Error('Turing 配音文件在 30 秒内仍未读出时长。')), 30000);
      media.addEventListener('loadedmetadata', onReady);
      media.addEventListener('durationchange', onReady);
      media.addEventListener('error', onError);
      if (forceReload || media.error) media.load();
      onReady();
    });
  }

  function clearSeedanceResult() {
    const previousUrl = state.seedanceVideoUrl;
    const previousAudioUrl = state.ttsAudioUrl;
    state.seedanceVideoBlob = null;
    state.seedanceVideoUrl = '';
    state.seedanceDuration = 0;
    state.seedanceReadPending = false;
    state.ttsAudioBlob = null;
    state.ttsAudioUrl = '';
    state.ttsDuration = 0;
    state.editPlan = null;
    state.editAnalysisSource = 'local-fallback';
    state.generated = false;
    const media = document.querySelector('#aiVideoSeedanceAudioSource');
    if (media) { media.pause(); media.removeAttribute('src'); media.load(); }
    const audio = document.querySelector('#aiVideoTtsAudioSource');
    if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    if (previousAudioUrl) URL.revokeObjectURL(previousAudioUrl);
  }

  function invalidateSeedanceResult(message = '内容或参数已修改，请重新生成自动成片，确保配音与视频一致。') {
    const hadResult = Boolean(state.seedanceVideoUrl || state.ttsAudioUrl);
    if (hadResult) {
      stopPreviewPlayback();
      clearSeedanceResult();
      if ($('#aiVideoResultPanel')) $('#aiVideoResultPanel').hidden = true;
      setStatus(message, 'ready');
    }
    state.generated = false;
  }

  function renderPreviewAt(ratio = 0) {
    const image = $('#aiVideoPreviewImage');
    const video = $('#aiVideoPreviewVideo');
    const fallback = $('#aiVideoPreviewFallback');
    if (!image || !video || !state.assets.length) return;
    const preview = previewSegmentAt(ratio);
    const item = preview.item;
    const asset = state.assets[item.assetIndex % state.assets.length];
    const segmentChanged = preview.index !== state.previewSegmentIndex;
    if (isVideo(asset.file)) {
      image.hidden = true; video.hidden = video.dataset.failedUrl === asset.url;
      if (fallback) fallback.hidden = !video.hidden;
      // Uploaded clips are picture sources only; the narration comes from TTS.
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      if (video.src !== asset.url) { delete video.dataset.failedUrl; video.src = asset.url; video.load(); }
      // While playing, let the media element advance naturally. Re-seeking on
      // every preview tick continually reset the frame and made videos appear
      // frozen. Seek only when scrubbing or entering a new segment.
      if (video.duration && (!state.playing || segmentChanged)) video.currentTime = item.mediaStart + (item.mediaEnd - item.mediaStart) * preview.local;
      // Keep uploaded video assets moving in the preview. Browsers may block
      // autoplay, so fail silently and let the existing play button retry.
      if (video.paused) video.play().catch(() => {});
    } else {
      video.hidden = true; video.pause(); image.hidden = image.dataset.failedUrl === asset.url;
      if (fallback) fallback.hidden = !image.hidden;
      if (image.src !== asset.url) { delete image.dataset.failedUrl; image.src = asset.url; }
      // Add a subtle Ken Burns motion so image-only scenes do not feel frozen.
      const motion = preview.local;
      const scale = 1.03 + motion * 0.06;
      const x = (motion - 0.5) * 2.5;
      const y = (0.5 - motion) * 1.5;
      image.style.transform = `scale(${scale}) translate(${x}%, ${y}%)`;
      image.style.transformOrigin = 'center center';
    }
    const emphasis = $('#aiVideoPreviewEmphasis');
    if (emphasis) {
      emphasis.dataset.style = state.subtitleStyle;
      emphasis.hidden = !state.subtitles;
      renderHeadlinePreview(emphasis, item.text, asset.sceneType || 'other', preview.local, preview.index, item.motion);
    }
    state.previewSegmentIndex = preview.index;
    $('#aiVideoPreviewTime').textContent = `00:${String(Math.floor((Number(ratio) || 0) * timelineDuration())).padStart(2, '0')} / 00:${String(Math.round(timelineDuration())).padStart(2, '0')}`;
    const progress = $('#aiVideoPreviewProgress');
    if (progress) progress.value = String(Math.round(Math.max(0, Math.min(1, ratio)) * 100));
  }

  function stopPreviewPlayback() {
    if (state.previewTimer) window.clearInterval(state.previewTimer);
    state.previewTimer = null; state.playing = false;
    const video = $('#aiVideoPreviewVideo');
    if (video && !video.hidden) video.pause();
    const narrationAudio = document.querySelector('#aiVideoTtsAudioSource');
    if (narrationAudio && !narrationAudio.paused) narrationAudio.pause();
    const button = $('#aiVideoPreviewPlay');
    if (button) button.textContent = '▶';
  }

  async function togglePreviewPlayback() {
    if (!state.generated || !state.assets.length || !state.ttsAudioUrl) return;
    if (state.playing) { stopPreviewPlayback(); return; }
    const progress = Number($('#aiVideoPreviewProgress')?.value || 0) / 100;
    const total = Math.max(.1, state.ttsDuration || state.seedanceDuration || timelineDuration());
    const narrationAudio = ttsAudioElement();
    try {
      await waitForAudioMetadata(narrationAudio);
      narrationAudio.currentTime = Math.min(Math.max(0, narrationAudio.duration - .05), progress * total);
      narrationAudio.volume = state.volume;
      await narrationAudio.play();
    } catch (error) {
      setStatus(`Turing 配音预览失败：${error?.message || '无法播放音频模型返回的配音。'}`, 'error');
      return;
    }
    state.playing = true; state.previewStartedAt = performance.now() - progress * total * 1000;
    const button = $('#aiVideoPreviewPlay'); if (button) button.textContent = 'Ⅱ';
    state.previewTimer = window.setInterval(() => {
      const ratio = (performance.now() - state.previewStartedAt) / (total * 1000);
      if (ratio >= 1 || narrationAudio.ended) { renderPreviewAt(1); stopPreviewPlayback(); return; }
      renderPreviewAt(ratio);
      const video = $('#aiVideoPreviewVideo');
      if (video && !video.hidden && video.paused) video.play().catch(() => {});
    }, 100);
  }

  function renderPreview() {
    const first = state.assets[0];
    const image = $('#aiVideoPreviewImage');
    const video = $('#aiVideoPreviewVideo');
    if (!first || !image || !video) return;
    ensureSegments();
    renderPreviewAt(Number($('#aiVideoPreviewProgress')?.value || 0) / 100);
    renderTimeline();
  }

  async function generateSmartVideo() {
    syncSelectedCopy();
    if (!state.copy.trim() || !state.assets.length) { setStatus('请先添加素材并生成或填写文案。', 'error'); return; }
    const button = $('#aiVideoGenerateVideo');
    if (button) { button.disabled = true; button.dataset.generating = 'true'; button.textContent = '正在生成 TTS、分析素材与 EDL…'; }
    stopPreviewPlayback();
    clearSeedanceResult();
    $('#aiVideoResultPanel').hidden = true;
    setStatus('正在调用 Turing 音频模型生成旁白…');
    try {
      const audioBlob = await requestTtsAudio();
      state.ttsAudioBlob = audioBlob;
      state.ttsAudioUrl = URL.createObjectURL(audioBlob);
      const narrationAudio = ttsAudioElement();
      const audioDuration = await waitForAudioMetadata(narrationAudio);
      setStatus('旁白已生成，正在生成词级时间轴和素材缩略图…');
      const result = await requestSmartEditPlan(audioBlob, audioDuration);
      applySmartEditPlan(result.plan, result.timeline);
      state.editAnalysisSource = result.source;
      state.ttsDuration = audioDuration;
      state.seedanceDuration = audioDuration;
      state.generated = true;
      state.previewSegmentIndex = -1;
      $('#aiVideoResultPanel').hidden = false;
      if ($('#aiVideoPreviewProgress')) $('#aiVideoPreviewProgress').value = '0';
      renderPreview();
      const timingLabel = result.timeline.some(item => item.timingSource === 'word-aligned') ? '词级时间轴' : '估算时间轴';
      const sourceLabel = result.source === 'llm' ? 'LLM EDL' : '本地回退 EDL';
      setStatus(`智能剪辑初稿已生成：${sourceLabel} · ${timingLabel} · ${state.segments.length} 段画面。`, 'ready');
      $('#aiVideoResultPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      console.error('智能自动成片生成失败：', error);
      clearSeedanceResult();
      setStatus(`智能自动成片生成失败：${error?.message || '请检查配置和素材后重试。'}`, 'error');
    } finally {
      if (button) {
        button.disabled = false;
        delete button.dataset.generating;
        button.innerHTML = '<span>✦</span> 生成自动成片';
      }
    }
  }

  async function generateVideo() {
    if (state.editMode === 'smart') return generateSmartVideo();
    syncSelectedCopy();
    if (!state.copy.trim() || !state.assets.length) { setStatus('请先添加素材并生成或填写文案。', 'error'); return; }
    const button = $('#aiVideoGenerateVideo');
    if (button) { button.disabled = true; button.dataset.generating = 'true'; button.textContent = '正在生成画面与 TTS 配音…'; }
    stopPreviewPlayback();
    clearSeedanceResult();
    $('#aiVideoResultPanel').hidden = true;
    setStatus(`正在调用 Turing 音频模型生成${voiceProfiles[state.voice]?.label || '配音'}，同时生成视频画面…`);
    try {
      const [videoBlob, audioBlob] = await Promise.all([requestSeedanceVideo(), requestTtsAudio()]);
      state.seedanceVideoBlob = videoBlob;
      state.seedanceVideoUrl = URL.createObjectURL(videoBlob);
      state.ttsAudioBlob = audioBlob;
      state.ttsAudioUrl = URL.createObjectURL(audioBlob);
      const seedanceVideo = seedanceMediaElement();
      const narrationAudio = ttsAudioElement();
      const [videoDuration, audioDuration] = await Promise.all([waitForVideoMetadata(seedanceVideo), waitForAudioMetadata(narrationAudio)]);
      showSeedanceVideoResult(videoDuration, audioDuration);
    } catch (error) {
      console.error('自动成片生成失败：', error);
      clearSeedanceResult();
      setStatus(`自动成片生成失败：${error?.message || '请检查配置和素材后重试。'}`, 'error');
    } finally {
      if (button) {
        button.disabled = false;
        delete button.dataset.generating;
        button.innerHTML = '<span>✦</span> 生成自动成片';
      }
    }
  }

  function showSeedanceVideoResult(duration, audioDuration) {
    state.seedanceDuration = duration;
    state.ttsDuration = audioDuration;
    state.seedanceReadPending = false;
    createSegments();
    state.previewSegmentIndex = -1;
    state.generated = true;
    $('#aiVideoResultPanel').hidden = false;
    if ($('#aiVideoPreviewProgress')) $('#aiVideoPreviewProgress').value = '0';
    renderPreview();
    setStatus(`视频画面与 Turing 音频模型配音已生成，当前音色：${voiceProfiles[state.voice]?.label || state.voice}。`, 'ready');
    $('#aiVideoResultPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function retrySeedanceVideoRead() {
    const button = $('#aiVideoGenerateVideo');
    if (button) { button.disabled = true; button.textContent = '正在重新读取已生成视频…'; }
    try {
      const media = seedanceMediaElement();
      showSeedanceVideoResult(await waitForVideoMetadata(media, true));
    } catch (error) {
      console.error('Seedance 已生成视频读取失败：', error);
      state.seedanceReadPending = true;
      setStatus(`${error?.message || '本机播放器仍无法读取该视频。'} 文件仍保留；点击按钮可再次重试，不会再次提交生成任务。`, 'error');
    } finally {
      if (button) { button.disabled = false; button.innerHTML = '<span>✦</span> 生成自动成片'; }
    }
  }

  function drawCover(ctx, media, width, height) {
    const mw = media.videoWidth || media.naturalWidth || media.width || width;
    const mh = media.videoHeight || media.naturalHeight || media.height || height;
    const scale = Math.max(width / mw, height / mh);
    const w = mw * scale, h = mh * scale;
    ctx.drawImage(media, (width - w) / 2, (height - h) / 2, w, h);
  }

  function drawEmphasis(ctx, text, sceneType, width, height, progress = 1, requestedMotion = '', segmentIndex = 0) {
    if (!state.subtitles) return;
    const style = subtitleStyles[state.subtitleStyle] || subtitleStyles['clean-white'];
    const raw = String(text || '酒店好住，也要好看').replace(/\s+/g, '').trim();
    const motion = captionMotionFor(raw, segmentIndex, requestedMotion);
    const motionState = captionMotionState(motion, progress, [...raw].length);
    const visibleRaw = [...raw].slice(0, motionState.reveal).join('');
    if (!visibleRaw) return;
    const parts = headlineParts(raw, sceneType);
    const unit = Math.min(width, height);
    let supportSize = Math.round(unit * .055);
    const maxWidth = width * .86;
    ctx.font = `800 ${supportSize}px "PingFang SC", sans-serif`;
    const preferredChars = Math.max(10, Math.floor((maxWidth / Math.max(1, supportSize)) * .88));
    const lines = splitHeadlineLines(visibleRaw, preferredChars, 2);
    const lineFit = captionFitScale(preferredChars);
    supportSize = Math.max(22, Math.round(supportSize * lineFit));
    const keywordSize = supportSize;
    const lineHeight = Math.round(supportSize * 1.16);
    const scale = .94 + Math.min(1, progress * 5) * .06;
    const centerX = width / 2 + motionState.offsetX; const centerY = height * .68 + motionState.offsetY;
    ctx.save(); ctx.globalAlpha = motionState.opacity; ctx.translate(centerX, centerY); ctx.scale(scale, scale); ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(2,12,27,.55)'; ctx.shadowBlur = Math.round(unit * .01); ctx.shadowOffsetY = Math.round(unit * .002);
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(.8, unit * .0014); ctx.strokeStyle = 'rgba(10,18,28,.72)';
    lines.forEach((value, index) => {
      const baseline = (index - (lines.length - 1) / 2) * lineHeight;
      ctx.font = `800 ${supportSize}px "PingFang SC", sans-serif`;
      const keywordIndex = parts.keyword ? value.indexOf(parts.keyword) : -1;
      const lead = keywordIndex >= 0 ? value.slice(0, keywordIndex) : value;
      const keyword = keywordIndex >= 0 ? parts.keyword : '';
      const tail = keywordIndex >= 0 ? value.slice(keywordIndex + parts.keyword.length) : '';
      const leadWidth = ctx.measureText(lead).width;
      ctx.font = `800 ${keywordSize}px "PingFang SC", sans-serif`;
      const keywordWidth = ctx.measureText(keyword).width;
      ctx.font = `800 ${supportSize}px "PingFang SC", sans-serif`;
      const total = leadWidth + keywordWidth + ctx.measureText(tail).width;
      let x = -total / 2;
      ctx.fillStyle = '#fff'; ctx.strokeText(lead, x, baseline); ctx.fillText(lead, x, baseline); x += leadWidth;
      if (keyword) {
        ctx.font = `800 ${keywordSize}px "PingFang SC", sans-serif`;
        ctx.strokeText(keyword, x, baseline); ctx.fillStyle = '#fff'; ctx.fillText(keyword, x, baseline); x += keywordWidth;
      }
      ctx.font = `800 ${supportSize}px "PingFang SC", sans-serif`; ctx.fillStyle = '#fff'; ctx.strokeText(tail, x, baseline); ctx.fillText(tail, x, baseline);
    });
    ctx.strokeStyle = style.stroke; ctx.globalAlpha = motionState.opacity; ctx.lineWidth = Math.max(1, unit * .0012); ctx.beginPath();
    const ruleY = ((lines.length - 1) / 2) * lineHeight + unit * .028;
    ctx.moveTo(-unit * .12, ruleY); ctx.lineTo(unit * .12, ruleY); ctx.stroke();
    ctx.restore();
  }

  function drawCaption(ctx, text, width, height, progress = 1) {
    if (!state.subtitles) return;
    const style = subtitleStyles[state.subtitleStyle] || subtitleStyles['clean-white'];
    const entrance = Math.min(1, progress * 6); const translateY = (1 - entrance) * 22;
    const unit = Math.min(width, height); const fontSize = Math.max(22, Math.round(unit * .035)); const lineHeight = Math.round(fontSize * 1.42);
    ctx.save(); ctx.globalAlpha = entrance; ctx.translate(0, translateY);
    ctx.fillStyle = style.color; ctx.textAlign = 'center'; ctx.font = `700 ${fontSize}px "PingFang SC", sans-serif`;
    ctx.shadowColor = style.shadow ? 'rgba(0,0,0,.55)' : 'transparent'; ctx.shadowBlur = style.shadow ? 7 : 0; ctx.shadowOffsetY = style.shadow ? 2 : 0;
    const maxWidth = width * .78; const words = String(text || '').slice(0, 50).split(''); const lines = []; let line = '';
    words.forEach((char) => { const next = line + char; if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = char; } else line = next; }); if (line) lines.push(line);
    const visibleLines = lines.slice(0, 2); const boxHeight = visibleLines.length * lineHeight + unit * .045; const boxWidth = Math.min(width * .88, maxWidth + unit * .08); const boxX = (width - boxWidth) / 2; const boxY = height * .78 - boxHeight / 2;
    ctx.shadowColor = 'transparent'; ctx.fillStyle = style.background; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(boxX, boxY, boxWidth, boxHeight, unit * .014); else ctx.rect(boxX, boxY, boxWidth, boxHeight); ctx.fill();
    ctx.fillStyle = style.color; ctx.shadowColor = style.shadow ? 'rgba(0,0,0,.55)' : 'transparent'; ctx.shadowBlur = style.shadow ? 7 : 0; ctx.shadowOffsetY = style.shadow ? 2 : 0;
    const firstBaseline = boxY + unit * .035 + fontSize; visibleLines.forEach((value, index) => ctx.fillText(value, width / 2, firstBaseline + index * lineHeight));
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.restore();
  }

  async function loadMedia(asset) {
    return new Promise((resolve, reject) => {
      const media = isVideo(asset.file) ? document.createElement('video') : new Image();
      let settled = false;
      const finish = (error) => {
        if (settled) return;
        settled = true; window.clearTimeout(timeoutId);
        if (error) reject(error); else resolve(media);
      };
      const validate = () => {
        const width = media.videoWidth || media.naturalWidth;
        const height = media.videoHeight || media.naturalHeight;
        if (width > 0 && height > 0) finish(); else finish(new Error(`素材「${fileName(asset.file)}」没有可读取的画面`));
      };
      const timeoutId = window.setTimeout(() => finish(new Error(`读取素材「${fileName(asset.file)}」超时`)), 15000);
      if (media.tagName === 'VIDEO') {
        // Uploaded clips are used as picture references and must not leak
        // their original audio; Turing TTS supplies the narration track.
        media.muted = true; media.playsInline = true; media.preload = 'auto';
        media.addEventListener('loadeddata', validate, { once: true });
      } else {
        media.decoding = 'async'; media.onload = validate;
      }
      media.onerror = () => finish(new Error(`无法读取素材「${fileName(asset.file)}」`));
      media.src = asset.url;
      if (media.tagName === 'VIDEO') media.load();
    });
  }

  function createMusicBuffer(context, seconds, style) {
    const sampleRate = 22050;
    const length = Math.max(1, Math.ceil(seconds * sampleRate));
    const buffer = context.createBuffer(1, length, sampleRate);
    const samples = buffer.getChannelData(0);
    const chordSets = style === 'hotel-ambient'
      ? [[130.81, 164.81, 196], [110, 130.81, 164.81], [146.83, 174.61, 220], [98, 130.81, 164.81]]
      : [[261.63, 329.63, 392], [220, 261.63, 329.63], [246.94, 293.66, 369.99], [196, 246.94, 329.63]];
    const melody = [523.25, 659.25, 587.33, 783.99, 659.25, 880, 783.99, 659.25];
    const chordSeconds = style === 'city-light' ? 3.2 : 5;
    const beatSeconds = style === 'city-light' ? .52 : .88;
    for (let index = 0; index < length; index += 1) {
      const time = index / sampleRate;
      const chord = chordSets[Math.floor(time / chordSeconds) % chordSets.length];
      const padMotion = style === 'hotel-ambient' ? .72 + .28 * Math.sin(time * .31) : 1;
      // Keep the generated bed audible after the final mix. The previous
      // level was effectively -40 dB before the music gain, so the track was
      // present in the MP4 but sounded missing under normal narration.
      let value = chord.reduce((sum, frequency, noteIndex) => sum + Math.sin(2 * Math.PI * frequency * time + noteIndex * .07), 0) * .03 * padMotion;
      if (style !== 'hotel-ambient') {
        const beat = Math.floor(time / beatSeconds);
        const noteAge = time - beat * beatSeconds;
        const frequency = style === 'city-light' ? melody[beat % melody.length] : chord[beat % chord.length] * 2;
        const envelope = Math.exp(-noteAge * (style === 'city-light' ? 5 : 3.1));
        value += (Math.sin(2 * Math.PI * frequency * time) + .22 * Math.sin(4 * Math.PI * frequency * time)) * .09 * envelope;
      }
      samples[index] = Math.max(-.38, Math.min(.38, value));
    }
    return buffer;
  }

  function audioBufferToWav(buffer) {
    const channels = Math.max(1, buffer.numberOfChannels || 1);
    const frames = buffer.length;
    const bytesPerSample = 2;
    const dataLength = frames * channels * bytesPerSample;
    const output = new ArrayBuffer(44 + dataLength);
    const view = new DataView(output);
    const writeString = (offset, value) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
    writeString(0, 'RIFF'); view.setUint32(4, 36 + dataLength, true); writeString(8, 'WAVE');
    writeString(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, channels, true); view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * channels * bytesPerSample, true);
    view.setUint16(32, channels * bytesPerSample, true); view.setUint16(34, 16, true);
    writeString(36, 'data'); view.setUint32(40, dataLength, true);
    let offset = 44;
    for (let frame = 0; frame < frames; frame += 1) {
      for (let channel = 0; channel < channels; channel += 1) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[frame] || 0));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }
    return output;
  }

  async function createBackgroundMusicBlob(seconds) {
    const OfflineAudioContextCtor = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (OfflineAudioContextCtor) {
      const sampleRate = 22050;
      const context = new OfflineAudioContextCtor(1, Math.max(1, Math.ceil(seconds * sampleRate)), sampleRate);
      return new Blob([audioBufferToWav(createMusicBuffer(context, seconds, state.musicTrack))], { type: 'audio/wav' });
    }
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) throw new Error('当前浏览器不支持生成背景音乐。');
    const context = new AudioContextCtor();
    try {
      return new Blob([audioBufferToWav(createMusicBuffer(context, seconds, state.musicTrack))], { type: 'audio/wav' });
    } finally {
      await context.close().catch(() => {});
    }
  }

  function buildSmartRenderEdl() {
    const segments = ensureSegments();
    let cursor = 0;
    return {
      version: 1,
      engine: 'video-use-edl',
      ratio: state.ratio,
      subtitles: state.subtitles,
      subtitleStyle: state.subtitleStyle,
      total_duration_s: timelineDuration(),
      ranges: segments.map((segment, index) => {
        const duration = segmentDuration(segment);
        const voiceStart = Number.isFinite(Number(segment.voiceStart)) ? Number(segment.voiceStart) : cursor;
        const voiceEnd = Number.isFinite(Number(segment.voiceEnd)) ? Number(segment.voiceEnd) : voiceStart + duration;
        cursor = voiceEnd;
        return {
          assetIndex: segment.assetIndex,
          sourceStart: Number(segment.mediaStart) || 0,
          sourceEnd: Number(segment.mediaEnd) || Math.max(.4, Number(segment.mediaStart) + duration),
          voiceStart,
          voiceEnd,
          captionStart: Number(segment.captionStart) || 0,
          captionEnd: Number(segment.captionEnd) || duration,
          text: segment.text || '',
          headline: headlineParts(segment.text || '', segment.sceneTag || state.assets[segment.assetIndex]?.sceneType || 'other'),
          beat: segment.sceneTag || '',
          motion: captionMotionFor(segment.text || '', index, segment.motion),
          reason: state.editPlan?.ranges?.[index]?.reason || '智能剪辑时间线'
        };
      })
    };
  }

  async function exportSmartVideo() {
    const button = $('#aiVideoExportButton');
    if (!state.generated || !state.assets.length || !state.ttsAudioBlob) {
      setStatus('请先生成带 TTS 配音的智能自动成片，再导出。', 'error');
      return;
    }
    button.disabled = true; button.textContent = '正在用 EDL + FFmpeg 渲染…';
    setStatus('正在按智能 EDL 渲染 MP4，并准备自动验片…');
    try {
      const endpoint = smartEndpoint('/api/render-smart-edit');
      if (!endpoint) throw Object.assign(new Error('当前页面由 file:// 直接打开，请通过本机服务访问。'), { code: 'SMART_RENDER_FAILED' });
      const form = new FormData();
      const edl = buildSmartRenderEdl();
      edl.backgroundMusic = Boolean(state.backgroundMusic);
      edl.musicTrack = state.musicTrack;
      edl.narrationVolume = Math.max(0, Math.min(1, Number(state.volume) || .85));
      edl.musicVolume = state.backgroundMusic ? .18 : 0;
      form.append('edl', JSON.stringify(edl));
      form.append('voiceover', state.ttsAudioBlob, 'hotel-voiceover.mp3');
      if (state.backgroundMusic) {
        setStatus(`正在生成${musicTracks[state.musicTrack] || '背景音乐'}并与旁白混音…`);
        form.append('backgroundMusic', await createBackgroundMusicBlob(Math.max(edl.total_duration_s || 0, state.ttsDuration || 0, 1)), 'hotel-background-music.wav');
      }
      const used = new Set(ensureSegments().map(segment => segment.assetIndex));
      used.forEach((assetIndex) => form.append(`asset-${assetIndex}`, state.assets[assetIndex].file, state.assets[assetIndex].file.name || `asset-${assetIndex}`));
      const response = await fetch(endpoint, { method: 'POST', body: form });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw Object.assign(new Error(payload?.error || `智能 FFmpeg 渲染返回 ${response.status}`), { code: payload?.code || 'SMART_RENDER_FAILED' });
      }
      const blob = await response.blob();
      if (blob.size < 10000) throw new Error('智能渲染返回的 MP4 文件过小。');
      const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `酒店智能EDL成片_${Date.now()}.mp4`; link.click(); window.setTimeout(() => URL.revokeObjectURL(link.href), 1200);
      button.textContent = '已导出智能 MP4 ✓'; setStatus('智能 EDL 已渲染并完成基础验片，已导出 MP4。', 'ready');
    } catch (error) {
      console.warn('智能 FFmpeg 渲染不可用，改用本机 Canvas 回退：', error);
      setStatus(`FFmpeg 渲染不可用：${error?.message || '未知错误'}，正在使用本机 Canvas 回退导出。`, 'ready');
      await exportVideoLocal();
      return;
    } finally {
      window.setTimeout(() => { button.disabled = false; if (button.textContent.includes('导出') || button.textContent.includes('渲染')) button.textContent = '↓ 导出视频'; }, 1800);
    }
  }

  async function exportVideo() {
    if (state.editMode === 'smart') return exportSmartVideo();
    return exportVideoLocal();
  }

  async function exportVideoLocal() {
    const button = $('#aiVideoExportButton');
    if (!state.generated || !state.assets.length || !state.ttsAudioUrl) {
      setStatus('请先生成带 Turing 音频模型配音的自动成片，再导出。', 'error');
      return;
    }
    button.disabled = true; button.textContent = '正在导出…'; setStatus('正在保留 Turing 音频模型配音并渲染字幕与文字动效。');
    let stream; let recorder; let audioContext; let media = []; let frameError = null; let ttsCapture; let narrationAudio;
    try {
      if (!HTMLCanvasElement.prototype.captureStream || !window.MediaRecorder) throw new Error('当前浏览器不支持本机视频导出');
      narrationAudio = ttsAudioElement();
      // Invoke play while the export button still has the browser's user
      // gesture, so audio capture is allowed by Chromium's autoplay policy.
      narrationAudio.currentTime = 0;
      const initialPlayback = narrationAudio.play();
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const resumeAudio = audioContext.resume();
      const width = state.ratio === '9:16' ? 720 : 1280; const height = state.ratio === '9:16' ? 1280 : 720;
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法创建视频画布');
      const [duration, loadedMedia] = await Promise.all([waitForAudioMetadata(narrationAudio), Promise.all(state.assets.map(loadMedia))]);
      media = loadedMedia;
      await Promise.all([initialPlayback, resumeAudio]);
      if (duration <= 0 || !Number.isFinite(duration)) throw new Error('Turing 音频模型返回的配音没有有效时长');
      const capture = narrationAudio.captureStream || narrationAudio.mozCaptureStream;
      if (!capture) throw new Error('当前浏览器无法读取 Turing 音频模型返回的配音，请使用桌面版最新版导出。');
      ttsCapture = capture.call(narrationAudio);
      const ttsAudioTrack = ttsCapture.getAudioTracks().find((track) => track.readyState === 'live' && track.enabled);
      if (!ttsAudioTrack) throw new Error('Turing 音频模型返回的配音没有可用音轨。');
      const segments = ensureSegments();
      const timelineSeconds = Math.max(.1, timelineDuration());
      const totalSeconds = Math.max(.1, timelineSeconds, duration);
      stream = canvas.captureStream(30);
      const audioDestination = audioContext.createMediaStreamDestination();
      const narrationSource = audioContext.createMediaStreamSource(new MediaStream([ttsAudioTrack]));
      const narrationGain = audioContext.createGain();
      narrationGain.gain.value = Math.max(0, Math.min(1, state.volume));
      narrationSource.connect(narrationGain); narrationGain.connect(audioDestination);
      let musicSource = null;
      if (state.backgroundMusic) {
        musicSource = audioContext.createBufferSource();
        const musicGain = audioContext.createGain();
        musicSource.buffer = createMusicBuffer(audioContext, totalSeconds, state.musicTrack);
        musicGain.gain.value = .18;
        musicSource.connect(musicGain); musicGain.connect(audioDestination);
      }
      const audioTracks = audioDestination.stream.getAudioTracks();
      if (!audioTracks.length) throw new Error('无法创建导出音轨');
      stream.addTrack(audioTracks[0]);
      const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
      const mime = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
      if (!mime) throw new Error('当前浏览器不支持 WebM 视频和音频编码');
      recorder = new MediaRecorder(stream, { mimeType: mime }); const chunks = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      const start = performance.now(); const total = totalSeconds * 1000;
      let lastSegmentIndex = -1;
      let timeoutId;
      const finished = new Promise((resolve, reject) => {
        recorder.onstop = () => { window.clearTimeout(timeoutId); resolve(new Blob(chunks, { type: 'video/webm' })); };
        // Some embedded Chromium builds can pause requestAnimationFrame or fail
        // to dispatch `stop`; never leave the export button stuck forever.
        timeoutId = window.setTimeout(() => {
          try { if (recorder.state !== 'inactive') recorder.stop(); } catch (_) { /* noop */ }
          reject(new Error('本机渲染超时'));
        }, total + 5000);
      });
      narrationAudio.currentTime = 0;
      await narrationAudio.play();
      recorder.start();
      musicSource?.start();
      const drawFrame = (now) => {
        try {
          const elapsed = Math.min(total, now - start);
          const timelineElapsed = elapsed / total * timelineSeconds * 1000;
          let cursor = 0; let index = segments.length - 1;
          for (let itemIndex = 0; itemIndex < segments.length; itemIndex += 1) {
            const length = segmentDuration(segments[itemIndex]) * 1000;
            if (timelineElapsed < cursor + length) { index = itemIndex; break; }
            cursor += length;
          }
          const item = segments[index]; const assetIndex = item.assetIndex % media.length; const current = media[assetIndex];
          const localProgress = Math.max(0, Math.min(1, (timelineElapsed - cursor) / (segmentDuration(item) * 1000)));
          if (!current) throw new Error('分镜没有关联到有效素材');
          if (current.tagName === 'VIDEO') {
            if (index !== lastSegmentIndex) {
              media.forEach((item, mediaIndex) => { if (mediaIndex !== assetIndex && item.tagName === 'VIDEO') item.pause(); });
              current.currentTime = Math.max(0, Math.min(Number(item.mediaStart) || 0, Math.max(0, current.duration - .08)));
              current.play().catch(() => {});
            }
          } else {
            media.forEach((item) => { if (item.tagName === 'VIDEO') item.pause(); });
          }
          lastSegmentIndex = index;
          ctx.fillStyle = '#15171b'; ctx.fillRect(0, 0, width, height);
          const motionScale = 1.03 + localProgress * 0.06;
          ctx.save();
          ctx.translate(width / 2, height / 2);
          ctx.scale(motionScale, motionScale);
          ctx.translate(-width / 2 + (localProgress - 0.5) * width * 0.025, -height / 2 + (0.5 - localProgress) * height * 0.015);
          drawCover(ctx, current, width, height);
          ctx.restore();
          // Scene labels are editor guidance, not part of the rendered video.
          drawEmphasis(ctx, item.text, item.sceneTag || state.assets[item.assetIndex]?.sceneType, width, height, localProgress, item.motion, index);
          if (elapsed < total) requestAnimationFrame(drawFrame); else recorder.stop();
        } catch (error) {
          frameError = error;
          if (recorder.state !== 'inactive') recorder.stop();
        }
      };
      requestAnimationFrame(drawFrame);
      const blob = await finished;
      if (frameError) throw frameError;
      if (blob.size < 10000) throw new Error('导出文件过小，画面或音轨没有写入');
      const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `酒店AI成片_${Date.now()}.webm`; link.click(); window.setTimeout(() => URL.revokeObjectURL(link.href), 1200);
      button.textContent = '已导出视频 ✓'; setStatus('已导出本机 WebM 视频。若需抖音 MP4，可在现有「视频压缩」工具中转换。', 'ready');
    } catch (error) {
      try { if (recorder && recorder.state !== 'inactive') recorder.stop(); } catch (_) { /* noop */ }
      setStatus(`导出失败：${error?.message || '请检查素材后重试。'}`, 'error');
    } finally {
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (ttsCapture) ttsCapture.getTracks().forEach((track) => track.stop());
      if (narrationAudio && !narrationAudio.paused) narrationAudio.pause();
      media.forEach((item) => { if (item.tagName === 'VIDEO') item.pause(); });
      if (audioContext && audioContext.state !== 'closed') await audioContext.close().catch(() => {});
      window.setTimeout(() => { button.disabled = false; if (button.textContent === '已导出视频 ✓' || button.textContent === '正在导出…') button.textContent = '↓ 导出视频'; }, 1800);
    }
  }

  function bind() {
    const previewImage = $('#aiVideoPreviewImage');
    const previewVideo = $('#aiVideoPreviewVideo');
    const previewFallback = $('#aiVideoPreviewFallback');
    previewImage?.addEventListener('error', () => {
      previewImage.dataset.failedUrl = previewImage.src;
      previewImage.hidden = true;
      if (previewFallback) { previewFallback.textContent = '图片素材无法读取，请重新上传'; previewFallback.hidden = false; }
      setStatus('图片素材无法读取，请确认格式并重新上传。', 'error');
    });
    previewImage?.addEventListener('load', () => { if (previewFallback) previewFallback.hidden = true; });
    previewVideo?.addEventListener('error', () => {
      previewVideo.dataset.failedUrl = previewVideo.src;
      previewVideo.hidden = true;
      if (previewFallback) { previewFallback.textContent = '视频素材无法读取，请重新上传'; previewFallback.hidden = false; }
      setStatus('视频素材无法读取，请确认文件完整并重新上传。', 'error');
    });
    previewVideo?.addEventListener('loadeddata', () => { if (previewFallback) previewFallback.hidden = true; });
    $('#aiVideoAssetInput')?.addEventListener('change', (event) => addFiles([...event.target.files]));
    const upload = $('.ai-video-upload');
    ['dragenter', 'dragover'].forEach((name) => upload?.addEventListener(name, (event) => { event.preventDefault(); upload.classList.add('is-dragover'); }));
    ['dragleave', 'drop'].forEach((name) => upload?.addEventListener(name, (event) => { event.preventDefault(); upload.classList.remove('is-dragover'); }));
    upload?.addEventListener('drop', (event) => addFiles([...(event.dataTransfer?.files || [])]));
    $$('[data-ai-copy-mode]').forEach((button) => button.addEventListener('click', () => {
      invalidateSeedanceResult();
      const nextMode = button.dataset.aiCopyMode === 'manual' ? 'manual' : 'ai';
      state.copyMode = nextMode;
      state.generated = false;
      // A draft generated in the other mode should not be accidentally reused.
      if ($('#aiVideoResultPanel')) $('#aiVideoResultPanel').hidden = true;
      if (nextMode === 'manual') state.copy = String($('#aiVideoManualCopy')?.value || '').trim();
      else syncSelectedCopy();
      $$('[data-ai-copy-mode]').forEach((item) => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-selected', String(active)); });
      $('#aiVideoAiFields').hidden = nextMode !== 'ai'; $('#aiVideoManualField').hidden = nextMode !== 'manual';
      if ($('#aiVideoGenerateCopy')) $('#aiVideoGenerateCopy').hidden = nextMode === 'manual';
      setStatus(nextMode === 'manual' ? '请输入一段文案，再生成视频。' : '填写主题和亮点，再生成 5 条文案。');
      syncControls();
    }));
    ['aiVideoTopic', 'aiVideoHighlights', 'aiVideoAudience', 'aiVideoOffer', 'aiVideoManualCopy'].forEach((id) => { const input = $(`#${id}`); input?.addEventListener('input', () => { if (id === 'aiVideoManualCopy') { invalidateSeedanceResult(); $('#aiVideoManualCount').textContent = String(input.value.length); state.copy = input.value.trim(); if ($('#aiVideoResultPanel')) $('#aiVideoResultPanel').hidden = true; } syncControls(); }); });
    $$('[data-ai-ratio]').forEach((button) => button.addEventListener('click', () => { invalidateSeedanceResult(); state.ratio = button.dataset.aiRatio; $$('[data-ai-ratio]').forEach((item) => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-checked', String(active)); }); }));
    $$('[data-ai-duration]').forEach((button) => button.addEventListener('click', () => { invalidateSeedanceResult(); state.duration = Number(button.dataset.aiDuration) || 15; $$('[data-ai-duration]').forEach((item) => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-checked', String(active)); }); }));
    $$('[data-ai-edit-mode]').forEach((button) => button.addEventListener('click', () => {
      invalidateSeedanceResult();
      state.editMode = button.dataset.aiEditMode === 'local' ? 'local' : 'smart';
      $$('[data-ai-edit-mode]').forEach((item) => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-checked', String(active)); });
      setStatus(state.editMode === 'smart' ? '已选择智能 EDL：TTS 后由模型匹配素材并自动验片。' : '已选择快速本地：使用旧版 Canvas 自动剪辑流程。', 'ready');
    }));
    $('#aiVideoVoice')?.addEventListener('change', (event) => { invalidateSeedanceResult(); state.voice = event.target.value; const profile = voiceProfiles[state.voice] || voiceProfiles.verse; setStatus(`已选择${profile.label}，重新生成后会使用 Turing 音频模型。`, 'ready'); });
    $('#aiVideoVolume')?.addEventListener('input', (event) => { state.volume = Math.max(0, Math.min(1, Number(event.target.value) / 100)); $('#aiVideoVolumeValue').textContent = `${Math.round(state.volume * 100)}%`; });
    $('#aiVideoSubtitles')?.addEventListener('change', (event) => {
      state.subtitles = event.target.checked;
      const styleSelect = $('#aiVideoSubtitleStyle');
      if (styleSelect) styleSelect.disabled = !state.subtitles;
      if (state.generated) renderPreview();
      setStatus(state.subtitles ? '已开启字幕，可继续选择字幕风格。' : '已关闭字幕，仅保留画面与配音。', 'ready');
    });
    $('#aiVideoSubtitleStyle')?.addEventListener('change', (event) => {
      state.subtitleStyle = event.target.value;
      $$('[data-ai-subtitle-style-preview]').forEach((button) => { const active = button.dataset.aiSubtitleStylePreview === state.subtitleStyle; button.classList.toggle('is-active', active); button.setAttribute('aria-checked', String(active)); });
      if (state.generated) renderPreview();
      setStatus(`已选择${subtitleStyles[state.subtitleStyle]?.label || '字幕风格'}。`, 'ready');
    });
    $$('[data-ai-subtitle-style-preview]').forEach((button) => button.addEventListener('click', () => {
      state.subtitleStyle = button.dataset.aiSubtitleStylePreview || 'clean-white';
      const select = $('#aiVideoSubtitleStyle'); if (select) select.value = state.subtitleStyle;
      $$('[data-ai-subtitle-style-preview]').forEach((item) => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-checked', String(active)); });
      if (state.generated) renderPreview();
      setStatus(`已选择${subtitleStyles[state.subtitleStyle]?.label || '字幕风格'}。`, 'ready');
    }));
    $('#aiVideoBackgroundMusic')?.addEventListener('change', (event) => {
      state.backgroundMusic = event.target.checked;
      const trackSelect = $('#aiVideoMusicTrack');
      if (trackSelect) trackSelect.disabled = !state.backgroundMusic;
      setStatus(state.backgroundMusic ? '已开启背景音乐，可继续选择音乐风格。' : '已关闭背景音乐。', 'ready');
    });
    $('#aiVideoMusicTrack')?.addEventListener('change', (event) => {
      state.musicTrack = event.target.value;
      setStatus(`已选择${musicTracks[state.musicTrack] || '背景音乐'}。`, 'ready');
    });
    $('#aiVideoGenerateCopy')?.addEventListener('click', () => { invalidateSeedanceResult(); const button = $('#aiVideoGenerateCopy'); button.disabled = true; button.textContent = '正在生成…'; window.setTimeout(() => { state.copyOptions = buildCopyVariants().map((text, index) => ({ text, selected: index === 0 })); syncSelectedCopy(); renderCopy(); button.textContent = '✦ 重新生成 5 条文案'; setStatus('已生成 5 条文案，选择一条并确认后即可生成视频。', 'ready'); }, 520); });
    $('#aiVideoUseCopy')?.addEventListener('click', generateVideo); $('#aiVideoGenerateVideo')?.addEventListener('click', generateVideo); $('#aiVideoExportButton')?.addEventListener('click', exportVideo);
    $('#aiVideoEditButton')?.addEventListener('click', () => { const controls = $('#aiVideoEditorControls'); controls.hidden = !controls.hidden; if (!controls.hidden) { $('#aiVideoEditCopy').value = state.copy; $('#aiVideoEditDuration').value = String(state.duration); controls.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } });
    $('#aiVideoApplyEdit')?.addEventListener('click', () => { const nextDuration = Number($('#aiVideoEditDuration').value) || state.duration; const nextCopy = $('#aiVideoEditCopy').value.trim() || state.copy; invalidateSeedanceResult(); rescaleSegments(state.duration, nextDuration); if (nextCopy !== state.copy && state.segments.length) { const parts = nextCopy.split(/[。！？]/).map((item) => item.trim()).filter(Boolean); state.segments.forEach((segment, index) => { if (parts[index]) segment.text = parts[index]; }); } state.copy = nextCopy; state.duration = nextDuration; $('#aiVideoResultPanel').hidden = true; setStatus('文案或时长已修改，请重新生成，让 Turing 配音与成片保持一致。', 'ready'); });
    $('#aiVideoPreviewProgress')?.addEventListener('input', (event) => { stopPreviewPlayback(); renderPreviewAt(Number(event.target.value || 0) / 100); });
    $('#aiVideoPreviewPlay')?.addEventListener('click', () => { if (state.generated) togglePreviewPlayback(); else setStatus('请先生成自动成片，之后可预览 Turing 音频模型返回的配音。', 'error'); });
    if ($('#aiVideoGenerateCopy')) $('#aiVideoGenerateCopy').hidden = state.copyMode === 'manual';
    if ($('#aiVideoSubtitleStyle')) $('#aiVideoSubtitleStyle').disabled = !state.subtitles;
    if ($('#aiVideoMusicTrack')) $('#aiVideoMusicTrack').disabled = !state.backgroundMusic;
    syncControls();
  }

  bind();
  window.addEventListener('beforeunload', () => {
    state.assets.forEach((asset) => URL.revokeObjectURL(asset.url));
    if (state.seedanceVideoUrl) URL.revokeObjectURL(state.seedanceVideoUrl);
    if (state.ttsAudioUrl) URL.revokeObjectURL(state.ttsAudioUrl);
  });
})();
