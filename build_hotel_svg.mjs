import fs from 'node:fs';

const imagePath = '/Users/sigurd/Documents/ChatGPT/酒店素材工坊/hotel-room-ai.jpg';
const outPath = '/Users/sigurd/Documents/ChatGPT/酒店素材工坊/hotel-business-room.svg';
const img = fs.readFileSync(imagePath).toString('base64');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1080" viewBox="0 0 1920 1080">
  <title>云境商务客房 — 1920×1080</title>
  <defs>
    <linearGradient id="leftPanel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#223A52" stop-opacity="0.97"/>
      <stop offset="1" stop-color="#304E68" stop-opacity="0.91"/>
    </linearGradient>
    <filter id="softGlow" x="-200%" y="-200%" width="400%" height="400%">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
  </defs>

  <image id="hotel-room-photo" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${img}"/>
  <rect id="left-panel" x="0" y="0" width="720" height="1080" fill="url(#leftPanel)"/>

  <g id="brand-lockup" fill="#F7F8F9" font-family="Arial, Helvetica, sans-serif">
    <text id="logo" x="72" y="100" font-size="31" letter-spacing="1.5">YOUR LOGO</text>
    <line id="accent-rule" x1="90" y1="243" x2="600" y2="243" stroke="#AFC4D6" stroke-width="1" opacity="0.55"/>
    <circle id="accent-glow" cx="170" cy="243" r="7" fill="#F3FAFF" opacity="0.28" filter="url(#softGlow)"/>
    <circle id="accent-dot" cx="170" cy="243" r="2.6" fill="#F3FAFF"/>
  </g>

  <g id="headline" fill="#F7F8F9" font-family="Noto Serif CJK SC, Songti SC, STSong, serif">
    <text id="title" x="90" y="392" font-size="83" font-weight="600" letter-spacing="2">云境商务客房</text>
    <text id="subtitle" x="94" y="482" font-size="28" letter-spacing="3">高效办公  |  城市视野  |  舒适睡眠</text>
  </g>

  <g id="feature-icons" fill="none" stroke="#F2F6FA" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <g id="icon-work" transform="translate(113 548)">
      <rect x="6" y="0" width="31" height="22"/><line x1="21.5" y1="22" x2="21.5" y2="28"/><line x1="11" y1="28" x2="32" y2="28"/>
      <rect x="36" y="8" width="25" height="37" rx="3"/><line x1="48.5" y1="45" x2="48.5" y2="53"/><line x1="41" y1="53" x2="56" y2="53"/>
      <line x1="0" y1="56" x2="68" y2="56"/><line x1="0" y1="56" x2="0" y2="87"/><line x1="68" y1="56" x2="68" y2="87"/>
    </g>
    <g id="icon-city" transform="translate(323 548)">
      <line x1="0" y1="87" x2="75" y2="87"/><rect x="6" y="36" width="18" height="51"/><rect x="29" y="10" width="23" height="77"/><rect x="57" y="28" width="14" height="59"/>
      <g stroke-width="1.6"><line x1="12" y1="45" x2="12" y2="78"/><line x1="18" y1="45" x2="18" y2="78"/><line x1="36" y1="20" x2="36" y2="78"/><line x1="44" y1="20" x2="44" y2="78"/><line x1="63" y1="38" x2="63" y2="78"/></g>
    </g>
    <g id="icon-sleep" transform="translate(514 548)">
      <path d="M4 45h67v27H4z"/><path d="M4 45c0-9 8-15 17-15h19c8 0 13 6 13 15"/><path d="M13 30v-8h19v8"/><path d="M63 11c-7 0-13 6-13 13s6 13 13 13c4 0 8-2 10-5-2 1-4 2-7 2-7 0-13-6-13-13 0-4 2-8 5-10-1 0-3 0-5 0z"/>
      <line x1="4" y1="76" x2="4" y2="87"/><line x1="71" y1="76" x2="71" y2="87"/>
    </g>
  </g>

  <g id="feature-labels" fill="#F2F6FA" font-family="Noto Serif CJK SC, Songti SC, STSong, serif" font-size="21" text-anchor="middle">
    <text id="label-work" x="147" y="665">高效办公</text>
    <text id="label-city" x="360" y="665">城市视野</text>
    <text id="label-sleep" x="553" y="665">舒适睡眠</text>
  </g>

  <g id="body-copy" fill="#F2F6FA" font-family="Noto Serif CJK SC, Songti SC, STSong, serif" font-size="24" letter-spacing="1.2">
    <text id="body-line-1" x="90" y="747">办公与休憩区域清晰衔接，简洁动线</text>
    <text id="body-line-2" x="90" y="793">与柔和灯光共同营造稳定、专注且放松</text>
    <text id="body-line-3" x="90" y="839">的入住体验。</text>
  </g>

  <text id="footnote" x="92" y="994" fill="#F2F6FA" font-family="Noto Serif CJK SC, Songti SC, STSong, serif" font-size="18" letter-spacing="0.6">*房间配置以实际入住安排为准</text>
</svg>`;

fs.writeFileSync(outPath, svg, 'utf8');
console.log(outPath);
