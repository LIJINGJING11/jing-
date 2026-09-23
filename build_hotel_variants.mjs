import fs from 'node:fs';

const root = '/Users/sigurd/Documents/ChatGPT/酒店素材工坊';
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const b64 = (name) => fs.readFileSync(`${root}/${name}`).toString('base64');

const common = (title, imageName, body) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <title>${esc(title)} — 1920×1080</title>
  <defs>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#68431d" flood-opacity="0.18"/></filter>
    <filter id="paperShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="2" dy="10" stdDeviation="12" flood-color="#705438" flood-opacity="0.22"/></filter>
    <linearGradient id="warmPanel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF7E9" stop-opacity="0.82"/><stop offset="1" stop-color="#F4E5C8" stop-opacity="0.92"/></linearGradient>
    <linearGradient id="navyPanel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00172E" stop-opacity="0.97"/><stop offset="1" stop-color="#06335D" stop-opacity="0.94"/></linearGradient>
  </defs>
  <image id="hotel-room-photo" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${b64(imageName)}"/>
  ${body}
</svg>`;

const family = common('温馨家庭客房', 'family-room-ai.jpg', `
  <g id="warm-curve" fill="none" stroke="#E39A42" stroke-width="3" opacity="0.88">
    <path d="M1584 0 C1810 45 1915 115 1920 280"/><path d="M1640 310 C1760 220 1845 166 1920 167"/>
    <path d="M1668 282 C1692 256 1722 257 1739 277 C1757 254 1788 261 1790 291 C1792 324 1752 349 1737 356 C1720 345 1684 326 1668 304 C1662 296 1663 288 1668 282Z"/>
  </g>
  <circle id="warm-orb" cx="1870" cy="100" r="150" fill="#E3913C" opacity="0.95"/>
  <g id="brand-lockup" font-family="Arial, Helvetica, sans-serif" fill="#6A3827"><text x="78" y="79" font-size="34" letter-spacing="5">BRAND LOGO</text></g>
  <g id="family-card" filter="url(#shadow)">
    <rect x="1220" y="420" width="680" height="610" rx="62" fill="#FFF9EF" fill-opacity="0.93"/>
    <path d="M1265 682 H1848" stroke="#E8AC64" stroke-width="3" stroke-dasharray="3 12"/>
    <g id="headline" fill="#633323" font-family="Noto Serif CJK SC, Songti SC, STSong, serif">
      <text id="title" x="1294" y="562" font-size="76" font-weight="700" letter-spacing="4">温馨家庭客房</text>
      <text id="subtitle" x="1294" y="634" font-size="27" letter-spacing="2" fill="#D37B29">宽敞布局  |  亲和软装  |  轻松相伴</text>
    </g>
    <g id="body-copy" fill="#6C3B28" font-family="Noto Serif CJK SC, Songti SC, STSong, serif" font-size="24" letter-spacing="1.3">
      <text x="1294" y="734">柔和色彩与开阔动线带来更放松的停留感，</text><text x="1294" y="778">休息、整理与交流区域自然衔接，</text><text x="1294" y="822">让一家的旅途多一份舒适与安心。</text>
    </g>
    <g id="feature-icons" stroke="#75402A" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g transform="translate(1305 883)"><rect x="0" y="16" width="58" height="28" rx="4"/><path d="M0 16V7h24v9M58 16V7H34v9M8 44v12M50 44v12"/></g>
      <g transform="translate(1458 883)"><rect x="3" y="17" width="58" height="27" rx="9"/><path d="M3 25h-8M61 25h8M20 17V6h23v11M17 44v12M48 44v12"/></g>
      <g transform="translate(1611 883)"><circle cx="30" cy="28" r="26"/><circle cx="21" cy="25" r="2" fill="#75402A"/><circle cx="39" cy="25" r="2" fill="#75402A"/><path d="M18 37c7 7 17 7 24 0"/><path d="M4 32c-12 0-15-12-5-17M56 32c12 0 15-12 5-17"/></g>
      <g transform="translate(1762 883)"><path d="M6 32h47v10H6zM13 32V17c0-7 6-11 13-11h7c8 0 13 4 13 11v15"/><path d="M18 7V0M31 6V0M44 7V0"/><path d="M55 43c0 7-10 10-21 10S13 50 13 43"/></g>
    </g>
    <g id="feature-labels" fill="#6C3B28" font-family="Noto Serif CJK SC, Songti SC, STSong, serif" font-size="21" text-anchor="middle">
      <text x="1334" y="971">舒适大床</text><text x="1488" y="971">休闲会客区</text><text x="1641" y="971">儿童友好角</text><text x="1786" y="971">温馨配套</text>
    </g>
  </g>
  <text id="footnote" x="72" y="1015" fill="#633323" font-family="Noto Serif CJK SC, Songti SC, STSong, serif" font-size="19" letter-spacing="0.8">*房间布置与设施以实际入住安排为准</text>
`);

const french = common('法式雅韵客房', 'french-room-ai.jpg', `
  <g id="brand-lockup" fill="#5B3A28" font-family="Georgia, serif"><text x="82" y="80" font-size="33" letter-spacing="6">BRAND LOGO</text></g>
  <g id="classic-card" filter="url(#paperShadow)">
    <path d="M72 448 Q72 418 103 418 H720 Q752 418 752 450 V1028 H104 Q72 1028 72 997Z" fill="#FFFDF6" fill-opacity="0.94" stroke="#C6A789" stroke-width="3"/>
    <path d="M104 462 Q104 440 126 440 H698 Q720 440 720 462 V987 Q720 1007 698 1007 H126 Q104 1007 104 987Z" fill="none" stroke="#BFA184" stroke-width="1.8"/>
    <g id="ornament-top" fill="none" stroke="#AF8C69" stroke-width="2"><path d="M285 520c36-38 72 12 103-8 31-20 53-22 76 8 23-30 45-28 76-8 31 20 67-30 103 8"/><path d="M388 518c12 12 24 12 36 0 12-12 24-12 36 0"/></g>
    <g id="headline" fill="#5B3A28" font-family="Noto Serif CJK SC, Songti SC, STSong, serif">
      <text id="title" x="151" y="650" font-size="74" letter-spacing="7">法式雅韵客房</text>
      <text id="subtitle" x="170" y="728" font-size="27" letter-spacing="3" fill="#B38E77">复古线条  |  柔和织物  |  优雅氛围</text>
    </g>
    <g id="body-copy" fill="#674433" font-family="Noto Serif CJK SC, Songti SC, STSong, serif" font-size="23" letter-spacing="1.2" text-anchor="middle"><text x="412" y="824">细腻线脚与温柔色调勾勒优雅轮廓，</text><text x="412" y="870">空间在复古与舒适之间保持恰到好处的松弛感。</text></g>
    <text id="footnote" x="286" y="957" fill="#84634A" font-family="Noto Serif CJK SC, Songti SC, STSong, serif" font-size="18" letter-spacing="1">*软装细节以实际客房为准</text>
    <g id="ornament-bottom" fill="none" stroke="#AF8C69" stroke-width="2"><path d="M315 991c30-30 57 8 85-6 28-14 42-15 63 6 21-21 35-20 63-6 28 14 55-24 85 6"/><path d="M394 989c10 10 20 10 30 0 10-10 20-10 30 0"/></g>
  </g>
`);

const japanese = common('雅韵庭居客房', 'japanese-room-ai.jpg', `
  <g id="brand-lockup" fill="#FFF8EB" font-family="Georgia, serif"><text x="1670" y="84" font-size="32" letter-spacing="6">BRAND LOGO</text></g>
  <path id="paper-mask" d="M0 410 C70 382 86 430 150 419 C236 404 246 475 324 459 C400 445 432 520 505 500 C580 480 590 560 666 548 C738 537 772 625 790 704 L821 1080 H0Z" fill="#F7F1E8" fill-opacity="0.92" filter="url(#paperShadow)"/>
  <g id="paper-lines" fill="none" stroke="#B7A48E" stroke-width="2" opacity="0.9"><path d="M54 578h120M39 590h136"/><path d="M0 976h132M0 988h114"/></g>
  <g id="seal" transform="translate(57 674)"><rect width="43" height="86" rx="2" fill="#D9785E"/><text x="22" y="26" text-anchor="middle" font-size="17" fill="#FFF3E9" font-family="serif">雅</text><text x="22" y="51" text-anchor="middle" font-size="17" fill="#FFF3E9" font-family="serif">韵</text><text x="22" y="76" text-anchor="middle" font-size="17" fill="#FFF3E9" font-family="serif">居</text></g>
  <g id="headline" fill="#44392F" font-family="Noto Serif CJK SC, Songti SC, STSong, serif"><text id="title" x="146" y="723" font-size="73" letter-spacing="5">雅韵庭居客房</text><text id="subtitle" x="145" y="801" font-size="27" letter-spacing="3">东方格调  |  温润木色  |  静雅休憩</text></g>
  <g id="body-copy" fill="#5E5043" font-family="Noto Serif CJK SC, Songti SC, STSong, serif" font-size="23" letter-spacing="1.2"><text x="145" y="888">含蓄线条与木色肌理延展空间层次，</text><text x="145" y="934">安静灯光与素雅陈设营造平和、</text><text x="145" y="980">舒适的居停感受。</text></g>
  <g id="bamboo" fill="none" stroke="#8E9C74" stroke-width="3" opacity="0.78"><path d="M522 1080c38-58 40-114 94-168 38-38 53-82 64-143"/><path d="M541 1039c-32-12-50-32-62-57M571 982c-36-4-53-18-76-43M596 926c-30-6-47-21-62-45M622 870c-28-11-40-27-52-51"/><path d="M571 990c34-12 55-31 73-58M602 927c34-9 50-24 66-49M625 868c30-8 48-23 64-47"/></g>
  <text id="footnote" x="54" y="1025" fill="#5E5043" font-family="Noto Serif CJK SC, Songti SC, STSong, serif" font-size="18">*房间陈设以实际入住为准</text>
`);

const art = common('艺境设计客房', 'art-room-ai.jpg', `
  <path id="art-panel" d="M0 0 H820 C730 148 658 296 622 420 C579 565 575 708 659 842 C705 916 785 996 870 1080 H0Z" fill="#F8F1E5" fill-opacity="0.88"/>
  <g id="art-arc" fill="none" stroke="#C7A45F" stroke-width="3"><path d="M370 0 C256 122 220 247 252 372"/><path d="M447 0 C323 118 280 239 306 356"/><path d="M325 332h88"/></g>
  <circle cx="344" cy="279" r="11" fill="#C7A45F"/>
  <g id="brand-lockup" fill="#9C7B43" font-family="Arial, Helvetica, sans-serif"><text x="58" y="76" font-size="32" letter-spacing="3">YOUR LOGO</text></g>
  <g id="headline" fill="#5A3F1C" font-family="Noto Serif CJK SC, Songti SC, STSong, serif"><text id="title" x="58" y="521" font-size="80" letter-spacing="5">艺境设计客房</text><text id="subtitle" x="62" y="604" font-size="27" letter-spacing="3" fill="#8B6B37">艺术陈设  |  质感材质  |  沉浸氛围</text></g>
  <line x1="61" y1="647" x2="124" y2="647" stroke="#C39A4A" stroke-width="4"/>
  <g id="body-copy" fill="#58432A" font-family="Noto Serif CJK SC, Songti SC, STSong, serif" font-size="23" letter-spacing="1.3"><text x="62" y="727">墙面肌理、灯光层次与精致软装共同构成</text><text x="62" y="773">富有个性的空间表情，兼具视觉品位与</text><text x="62" y="819">舒适体验。</text></g>
  <text id="signature" x="114" y="1010" fill="#CFB77F" opacity="0.76" font-size="102" font-family="cursive" font-style="italic">Signature</text>
  <text id="footnote" x="58" y="1030" fill="#5A3F1C" font-family="Noto Serif CJK SC, Songti SC, STSong, serif" font-size="18">*软装细节以实际客房为准</text>
`);

const night = common('星夜舒眠客房', 'night-room-ai.jpg', `
  <rect id="night-panel" x="0" y="0" width="720" height="1080" fill="url(#navyPanel)"/>
  <g id="stars" fill="#F3C882" opacity="0.9">${Array.from({length: 44}, (_,i) => { const x=28+((i*83)%630), y=26+((i*47)%360), r=i%7===0?3:i%3===0?2:1.2; return `<circle cx="${x}" cy="${y}" r="${r}"/>`; }).join('')}</g>
  <g id="brand-lockup" fill="#F3C882" font-family="Arial, Helvetica, sans-serif"><text x="58" y="80" font-size="33" letter-spacing="4">YOUR LOGO</text></g>
  <g id="headline" fill="#F3C882" font-family="Noto Serif CJK SC, Songti SC, STSong, serif"><text id="title" x="66" y="412" font-size="82" font-weight="600" letter-spacing="4">星夜舒眠客房</text><text id="subtitle" x="68" y="505" font-size="28" letter-spacing="3">柔软床品  |  暖光氛围  |  安静入眠</text></g>
  <g id="gold-rule" fill="none" stroke="#D4A65C" stroke-width="2"><path d="M68 568 H405"/><path d="M465 568 H666"/><path d="M423 568 l12 -12 l12 12 l-12 12z" fill="#D4A65C"/></g>
  <g id="body-copy" fill="#F0D29A" font-family="Noto Serif CJK SC, Songti SC, STSong, serif" font-size="24" letter-spacing="1.4"><text x="68" y="638">低照度灯光与舒适织物营造安定包裹感，</text><text x="68" y="686">让夜晚的停留回归柔和、平静与安心。</text></g>
  <g id="gold-arcs" fill="none" stroke="#B98A3D" stroke-width="2" opacity="0.78"><path d="M-160 1010 C110 755 480 786 720 1028"/><path d="M-140 1045 C120 812 444 820 710 1050"/><path d="M-102 1078 C137 866 410 864 654 1075"/><path d="M-65 1090 C142 903 374 903 592 1080"/><path d="M-29 1090 C159 941 335 941 526 1080"/><path d="M-1 1090 C176 976 301 976 457 1080"/></g>
  <text id="footnote" x="68" y="1025" fill="#F3D093" font-family="Noto Serif CJK SC, Songti SC, STSong, serif" font-size="18">*实际布置以入住客房为准</text>
  <text id="quiet-night" x="1790" y="76" text-anchor="end" fill="#E4B76C" font-family="Arial, Helvetica, sans-serif" font-size="17" letter-spacing="7">QUIET NIGHT</text>
`);

const outputs = [
  ['hotel-family-room.svg', family],
  ['hotel-french-room.svg', french],
  ['hotel-japanese-room.svg', japanese],
  ['hotel-art-room.svg', art],
  ['hotel-night-room.svg', night],
];
for (const [name, svg] of outputs) fs.writeFileSync(`${root}/${name}`, svg, 'utf8');
console.log(outputs.map(([name]) => name).join('\n'));
