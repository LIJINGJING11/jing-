from pathlib import Path
import base64

ROOT = Path('/Users/sigurd/Documents/ChatGPT/酒店素材工坊')
ASSET = ROOT / 'hotel-activity-layers'
OUT = ROOT / 'hotel-activity-poster-assets.svg'


def data(name):
    p = ASSET / name
    return 'data:image/png;base64,' + base64.b64encode(p.read_bytes()).decode('ascii')


def image(name, x, y, w, h, label):
    return f'<image id="{label}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="none" href="{data(name)}"/>'


def text(label, value, x, y, size, family, fill='#563824', weight='400', anchor='middle', letter_spacing='0'):
    # Plain SVG text is intentionally used here so Figma imports these as editable text nodes.
    # Decorative elements remain image-only; no paths or shape primitives are emitted.
    return (
        f'<text id="{label}" x="{x}" y="{y}" text-anchor="{anchor}" '
        f'font-family="{family}" font-size="{size}px" font-weight="{weight}" '
        f'letter-spacing="{letter_spacing}px" fill="{fill}">{value}</text>'
    )


svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="960" height="1706" viewBox="0 0 960 1706">
  <g id="酒店活动海报" data-layer-type="frame">
    <g id="01_背景装饰组" data-layer-type="group">
      {image('01_背景装饰组_天空光晕流线_PNG透明.png', 0, 0, 960, 1706, 'sky-glow-gold-flow-png')}
    </g>
    <g id="02_主视觉组" data-layer-type="group">
      {image('02_客房实景大图_不透明.png', 0, 430, 960, 875, 'hotel-room-photo-png')}
    </g>
    <g id="03_标题模块组" data-layer-type="group">
      {image('03_标题圆角标签底色_PNG透明.png', 234, 321, 486, 66, 'headline-pill-png')}
      {image('03_标题装饰_Jiading_PNG透明.png', 490, 102, 355, 160, 'jiading-script-png')}
      {text('GAODING HOTEL', 'GAODING HOTEL', 465, 171, 50, 'Times New Roman', '#563824', '400', 'middle', '1.2')}
      {text('特价好房限时秒杀', '特价好房限时秒杀', 480, 300, 78, 'Songti SC', '#563824', '600', 'middle', '1.5')}
      {text('品牌精品主题酒店', '品牌精品主题酒店', 480, 366, 40, 'Songti SC', '#3f2c22', '500', 'middle', '1.0')}
    </g>
    <g id="04_左侧信息模块组" data-layer-type="group">
      {image('04_纯净玩享徽章_PNG透明.png', 48, 548, 164, 172, 'pure-fun-badge-png')}
      {image('04_价格卡片底板含缩略图_PNG透明.png', 35, 713, 182, 250, 'price-card-base-png')}
      {text('DACHUANG', 'DACHUANG', 126, 751, 17, 'Times New Roman', '#3f2c22', '400', 'middle', '0.3')}
      {text('大床房', '大床房', 126, 778, 23, 'Songti SC', '#3f2c22', '600', 'middle', '0.8')}
      {text('138¥', '138¥', 126, 844, 66, 'Times New Roman', '#563824', '600', 'middle', '0')}
    </g>
    <g id="05_底部文字组" data-layer-type="group">
      {text('活动特价：X 月 X 日 --X 月 X 日', '活动特价：X 月 X 日 --X 月 X 日', 480, 1552, 38, 'Songti SC', '#563824', '500', 'middle', '1.0')}
    </g>
  </g>
</svg>
'''
OUT.write_text(svg, encoding='utf-8')
print(OUT)
