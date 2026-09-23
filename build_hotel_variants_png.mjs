import fs from 'node:fs';

const root = '/Users/sigurd/Documents/ChatGPT/酒店素材工坊';
function removeGroup(svg, id) {
  const start = svg.indexOf(`<g id="${id}"`);
  if (start < 0) return svg;
  let cursor = start;
  let depth = 0;
  while (cursor < svg.length) {
    const open = svg.indexOf('<g', cursor);
    const close = svg.indexOf('</g>', cursor);
    if (close < 0) return svg;
    if (open >= 0 && open < close) {
      depth += 1;
      cursor = open + 2;
    } else {
      depth -= 1;
      cursor = close + 4;
      if (depth === 0) return svg.slice(0, start) + svg.slice(cursor);
    }
  }
  return svg;
}
function removeText(svg, id) {
  return svg.replace(new RegExp(`<text id="${id}"[^>]*>[\\s\\S]*?<\\/text>\\s*`, 'm'), '');
}
function png(name) { return fs.readFileSync(`${root}/${name}`).toString('base64'); }
function replacePhoto(svg, imageName) {
  const b = png(imageName);
  return svg.replace(/href="data:image\/jpeg;base64,[^"]+"\/>/, `href="data:image/jpeg;base64,${b}"/>`);
}
function image(id, name, x, y, width, height) {
  return `<image id="${id}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="none" href="data:image/png;base64,${png(name)}"/>`;
}
function write(src, dst) { fs.writeFileSync(`${root}/${dst}`, src, 'utf8'); }

let family = fs.readFileSync(`${root}/hotel-family-room.svg`, 'utf8');
family = removeGroup(family, 'feature-icons');
family = family.replace('<g id="feature-labels"', `${image('feature-icon-1-png', 'complex-family-icon-1@2x.png', 1292, 874, 116, 104)}\n  ${image('feature-icon-2-png', 'complex-family-icon-2@2x.png', 1445, 874, 116, 104)}\n  ${image('feature-icon-3-png', 'complex-family-icon-3@2x.png', 1598, 874, 115, 104)}\n  ${image('feature-icon-4-png', 'complex-family-icon-4@2x.png', 1750, 874, 115, 104)}\n  <g id="feature-labels"`);
write(family, 'hotel-family-room-png.svg');

let french = fs.readFileSync(`${root}/hotel-french-room.svg`, 'utf8');
french = removeGroup(french, 'ornament-top');
french = removeGroup(french, 'ornament-bottom');
french = french.replace('<g id="headline"', `${image('ornament-top-png', 'complex-french-ornament-top@4x.png', 285, 499, 310, 59)}\n    <g id="headline"`);
french = french.replace('<text id="footnote"', `${image('ornament-bottom-png', 'complex-french-ornament-bottom@4x.png', 286, 972, 320, 59)}\n    <text id="footnote"`);
write(french, 'hotel-french-room-png.svg');

let japanese = fs.readFileSync(`${root}/hotel-japanese-room.svg`, 'utf8');
japanese = replacePhoto(japanese, 'japanese-room-ai-paste.jpg');
japanese = removeGroup(japanese, 'paper-lines');
japanese = removeGroup(japanese, 'seal');
japanese = removeGroup(japanese, 'bamboo');
japanese = japanese.replace('<g id="headline"', `${image('japanese-top-png', 'complex-japanese-top@4x.png', 25, 535, 190, 74)}\n  ${image('japanese-seal-png', 'complex-japanese-seal@4x.png', 51, 647, 72, 102)}\n  <g id="headline"`);
japanese = japanese.replace('<text id="footnote"', `${image('japanese-bottom-line-png', 'complex-japanese-bottom-line@4x.png', 0, 946, 154, 67)}\n  ${image('japanese-bamboo-png', 'complex-japanese-bamboo@4x.png', 315, 906, 605, 266)}\n  <text id="footnote"`);
write(japanese, 'hotel-japanese-room-png.svg');

let art = fs.readFileSync(`${root}/hotel-art-room.svg`, 'utf8');
art = replacePhoto(art, 'art-room-ai-paste.jpg');
art = removeGroup(art, 'art-arc');
art = removeText(art, 'signature');
art = art.replace('<g id="headline"', `${image('art-arc-png', 'complex-art-arc@4x.png', 280, 0, 340, 385)}\n  <g id="headline"`);
art = art.replace('<text id="footnote"', `${image('art-signature-png', 'complex-art-signature@4x.png', 65, 848, 945, 232)}\n  <text id="footnote"`);
write(art, 'hotel-art-room-png.svg');

let night = fs.readFileSync(`${root}/hotel-night-room.svg`, 'utf8');
night = replacePhoto(night, 'night-room-ai-paste.jpg');
night = removeGroup(night, 'stars');
night = removeGroup(night, 'gold-arcs');
night = night.replace('<g id="headline"', `${image('night-stars-png', 'complex-night-stars@4x.png', 0, 0, 720, 330)}\n  <g id="headline"`);
night = night.replace('<text id="footnote"', `${image('night-arcs-png', 'complex-night-arcs@4x.png', 0, 700, 720, 310)}\n  <text id="footnote"`);
write(night, 'hotel-night-room-png.svg');

console.log('built PNG-enhanced SVGs');
