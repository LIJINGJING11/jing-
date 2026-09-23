const fs = require('fs');
const path = require('path');
const sharp = require('/Users/sigurd/Documents/公司项目/开机素材工具/node_modules/sharp');

const outDir = path.join(__dirname, '..', 'output', 'hotel-posters');
fs.mkdirSync(outDir, { recursive: true });

const landscapeBase = '/Users/sigurd/.codex-company/generated_images/019fcb5d-145e-77f2-b0dc-f693ffb5cfed/exec-547bbe44-cb13-4809-bc1e-7c002abf01f5.png';
const portraitBase = '/Users/sigurd/.codex-company/generated_images/019fcb5d-145e-77f2-b0dc-f693ffb5cfed/exec-386957e4-e7a3-48ae-afd1-cf952116175c.png';

const lines = {
  title: ['治愈感拉满的', '舒适客房'],
  body: [
    '色调柔和高级，整体干净又通透',
    '超大软床躺上去瞬间卸下',
    '赶路的疲惫',
    '窗边摆放休闲桌椅，闲坐喝茶',
    '发呆刚刚好',
    '暖调壁灯氛围感十足，细节处处',
    '用心',
    '出差旅行住这里，睡个好觉就是',
    '最大的幸福感',
  ],
};

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
}

function text(x, y, value, size, options = {}) {
  const fill = options.fill || '#f8edd7';
  const weight = options.weight || 400;
  const letter = options.letter || 0;
  const opacity = options.opacity == null ? 1 : options.opacity;
  return `<text x="${x}" y="${y}" fill="${fill}" fill-opacity="${opacity}" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif" font-size="${size}px" font-weight="${weight}" letter-spacing="${letter}px">${escapeXml(value)}</text>`;
}

function sparkle(cx, cy, scale = 1) {
  return `<path d="M ${cx} ${cy - 15 * scale} L ${cx + 4 * scale} ${cy - 4 * scale} L ${cx + 15 * scale} ${cy} L ${cx + 4 * scale} ${cy + 4 * scale} L ${cx} ${cy + 15 * scale} L ${cx - 4 * scale} ${cy + 4 * scale} L ${cx - 15 * scale} ${cy} L ${cx - 4 * scale} ${cy - 4 * scale} Z" fill="#d9ad60"/>`;
}

function landscapeSvg(width, height) {
  const x = 80;
  const y = 155;
  const bodyY = 350;
  const body = [
    [bodyY, lines.body[0]],
    [bodyY + 58, lines.body[1]],
    [bodyY + 88, lines.body[2]],
    [bodyY + 146, lines.body[3]],
    [bodyY + 176, lines.body[4]],
    [bodyY + 234, lines.body[5]],
    [bodyY + 264, lines.body[6]],
    [bodyY + 322, lines.body[7]],
    [bodyY + 352, lines.body[8]],
  ];
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="panel" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#24160d" stop-opacity=".86"/><stop offset=".78" stop-color="#24160d" stop-opacity=".76"/><stop offset="1" stop-color="#24160d" stop-opacity=".54"/></linearGradient>
    </defs>
    <rect x="0" y="0" width="545" height="${height}" fill="url(#panel)"/>
    ${text(x, 88, 'HOTEL STAY  /  ROOM NOTES', 17, { fill: '#d9ad60', weight: 600, letter: 3 })}
    <line x1="${x}" y1="118" x2="${x + 210}" y2="118" stroke="#d9ad60" stroke-width="2" opacity=".8"/>
    ${sparkle(94, 146, .7)}${sparkle(117, 170, .4)}
    ${text(x + 48, y, lines.title[0], 42, { weight: 700, letter: 1, fill: '#fff5e3' })}
    ${text(x + 48, y + 64, lines.title[1], 54, { weight: 700, letter: 1, fill: '#fff5e3' })}
    <line x1="${x}" y1="255" x2="${x + 110}" y2="255" stroke="#d9ad60" stroke-width="4"/>
    ${body.map(([yy, value]) => text(x, yy, value, 18, { fill: '#f3e7d2', opacity: .96 })).join('')}
    ${text(x, 790, '舒适 · 安静 · 好好休息', 16, { fill: '#d9ad60', weight: 600, letter: 2 })}
    ${text(420, 704, 'z z', 15, { fill: '#d9ad60', weight: 600, letter: 3 })}
  </svg>`;
}

function portraitSvg(width, height) {
  const x = 90;
  const titleY = 1010;
  const bodyY = 1160;
  const body = [
    [bodyY, lines.body[0]],
    [bodyY + 44, lines.body[1]],
    [bodyY + 72, lines.body[2]],
    [bodyY + 116, lines.body[3]],
    [bodyY + 144, lines.body[4]],
    [bodyY + 188, lines.body[5]],
    [bodyY + 216, lines.body[6]],
    [bodyY + 260, lines.body[7]],
    [bodyY + 288, lines.body[8]],
  ];
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    ${text(x, 940, 'HOTEL STAY  /  ROOM NOTES', 18, { fill: '#d9ad60', weight: 600, letter: 3 })}
    <line x1="${x}" y1="972" x2="${x + 260}" y2="972" stroke="#d9ad60" stroke-width="2" opacity=".8"/>
    ${sparkle(105, 1000, .7)}${sparkle(128, 1024, .4)}
    ${text(x + 48, titleY, lines.title[0], 43, { weight: 700, fill: '#fff5e3' })}
    ${text(x + 48, titleY + 68, lines.title[1], 60, { weight: 700, fill: '#fff5e3' })}
    <line x1="${x}" y1="1105" x2="${x + 120}" y2="1105" stroke="#d9ad60" stroke-width="4"/>
    ${body.map(([yy, value]) => text(x, yy, value, 20, { fill: '#f3e7d2', opacity: .96 })).join('')}
    ${text(x, 1510, '舒适 · 安静 · 好好休息', 17, { fill: '#d9ad60', weight: 600, letter: 2 })}
    ${text(810, 1507, 'z z', 16, { fill: '#d9ad60', weight: 600, letter: 3 })}
  </svg>`;
}

async function render(base, width, height, overlay, filename) {
  let image = sharp(base, { limitInputPixels: false });
  if (filename.includes('3比4')) {
    const metadata = await image.metadata();
    const margin = Math.round(Math.min(metadata.width, metadata.height) * 0.026);
    image = image.extract({ left: margin, top: margin, width: metadata.width - margin * 2, height: metadata.height - margin * 2 });
  }
  await image
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(path.join(outDir, filename));
}

(async () => {
  await render(landscapeBase, 1600, 900, landscapeSvg(1600, 900), '酒店客房海报-16比9.png');
  await render(portraitBase, 1200, 1600, portraitSvg(1200, 1600), '酒店客房海报-3比4.png');
  console.log(outDir);
})();
