from pathlib import Path
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

ROOT = Path('/Users/sigurd/Documents/ChatGPT/酒店素材工坊')
SRC_PATH = Path('/Users/sigurd/Downloads/canvas-image (70).png')
CLEAN_PATH = ROOT / 'hotel-activity-clean-plate-ai.png'
OUT = ROOT / 'hotel-activity-layers'
OUT.mkdir(exist_ok=True)

TARGET = (960, 1706)


def resize_target(img: Image.Image) -> Image.Image:
    return img.convert('RGBA').resize(TARGET, Image.Resampling.LANCZOS)


def soft_mask_rounded(size, radius, feather=2):
    m = Image.new('L', size, 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return m.filter(ImageFilter.GaussianBlur(feather))


def gradient_rgba(size, top, bottom, alpha_mask):
    w, h = size
    arr = np.zeros((h, w, 4), dtype=np.uint8)
    for y in range(h):
        t = y / max(h - 1, 1)
        arr[y, :, :3] = [int(top[i] * (1 - t) + bottom[i] * t) for i in range(3)]
    arr[:, :, 3] = np.asarray(alpha_mask)
    return Image.fromarray(arr, 'RGBA')


src = resize_target(Image.open(SRC_PATH))
clean = resize_target(Image.open(CLEAN_PATH))

# Preserve untouched photographic detail, and use the AI clean plate only in regions
# where the original poster had baked-in typography/cards/ribbons.
room_full = src.copy()
replace = Image.new('L', TARGET, 0)
rd = ImageDraw.Draw(replace)
rd.rectangle((0, 0, 960, 520), fill=255)
rd.rounded_rectangle((25, 535, 225, 970), radius=18, fill=255)
rd.rectangle((0, 1160, 960, 1706), fill=255)
replace = replace.filter(ImageFilter.GaussianBlur(9))
room_full = Image.composite(clean, room_full, replace)

# Opaque room photo; its lower edge sits behind the decorative field as prescribed.
room_crop = room_full.crop((0, 430, 960, 1305)).convert('RGB')
room_crop.save(OUT / '02_客房实景大图_不透明.png', 'PNG', optimize=True)

# Background decoration: soft sky/glow at top, feathered cream field and gold flow lines at bottom.
bg = Image.new('RGBA', TARGET, (0, 0, 0, 0))
top = clean.crop((0, 0, 960, 555)).convert('RGBA')
ta = np.zeros((top.size[1], top.size[0]), dtype=np.uint8)
for y in range(top.size[1]):
    ta[y, :] = 255 if y < 430 else max(0, int(255 * (1 - (y - 430) / 125)))
top.putalpha(Image.fromarray(ta, 'L').filter(ImageFilter.GaussianBlur(2)))
bg.alpha_composite(top, (0, 0))

# Use a clean, softly lit cream field instead of a blurred room crop so the
# lower flow lines sit on an even background with no muddy seam or blob.
lower_arr = np.zeros((576, 960, 3), dtype=np.uint8)
for y in range(576):
    t = y / 575
    glow = max(0.0, 1.0 - abs(t - 0.42) / 0.42)
    base = np.array([221, 200, 170], dtype=float) * (1 - 0.35 * t)
    base += np.array([26, 24, 18], dtype=float) * glow
    lower_arr[y, :, :] = np.clip(base, 0, 255).astype(np.uint8)
lower = Image.fromarray(lower_arr, 'RGB').convert('RGBA')
la = np.zeros((lower.height, lower.width), dtype=np.uint8)
for y in range(lower.height):
    gy = y + 1130
    la[y, :] = 0 if gy < 1160 else (int(255 * (gy - 1160) / 160) if gy < 1320 else 255)
lower.putalpha(Image.fromarray(la, 'L').filter(ImageFilter.GaussianBlur(3)))
bg.alpha_composite(lower, (0, 1130))

bottom = np.asarray(src.convert('RGB'))[1160:1706]
gray = cv2.cvtColor(bottom, cv2.COLOR_RGB2GRAY)
blur = cv2.GaussianBlur(gray, (0, 0), 5)
high = np.clip(gray.astype(np.int16) - blur.astype(np.int16) + 18, 0, 255).astype(np.uint8)
edge = cv2.Canny(gray, 45, 120)
stroke = np.maximum(high, edge)
mask = np.zeros_like(stroke, dtype=np.float32)
for x in range(960):
    side = max(0.0, min(1.0, (360 - x) / 180)) if x < 360 else max(0.0, min(1.0, (x - 600) / 180))
    mask[:, x] = stroke[:, x] / 255.0 * side
mask[285:430, 170:790] = 0
mask[430:, 0:960] *= 0.9
mask_img = Image.fromarray(np.uint8(np.clip(mask * 215, 0, 215)), 'L').filter(ImageFilter.GaussianBlur(1.4))
strokes = src.crop((0, 1160, 960, 1706)).convert('RGBA')
strokes.putalpha(mask_img)
bg.alpha_composite(strokes, (0, 1160))
bg.save(OUT / '01_背景装饰组_天空光晕流线_PNG透明.png', 'PNG', optimize=True)

# Gold script ornament retained as raster for fidelity; requested headline strings remain editable Text nodes.
script_crop = src.crop((480, 100, 835, 260)).convert('RGBA')
arr = np.asarray(script_crop.convert('RGB'))
gold = ((arr[:, :, 0] > 155) & (arr[:, :, 0] > arr[:, :, 1] + 12) & (arr[:, :, 1] > arr[:, :, 2] + 18)).astype(np.uint8) * 255
script_crop.putalpha(Image.fromarray(gold, 'L').filter(ImageFilter.GaussianBlur(0.8)))
script_crop.save(OUT / '03_标题装饰_Jiading_PNG透明.png', 'PNG', optimize=True)

pill_size = (486, 66)
pill = gradient_rgba(pill_size, (244, 226, 190), (235, 202, 163), soft_mask_rounded(pill_size, 33, 1.4))
pill.save(OUT / '03_标题圆角标签底色_PNG透明.png', 'PNG', optimize=True)

# Gold badge: keep the printed badge artwork and its soft shadow, remove surrounding wall.
badge = src.crop((48, 548, 212, 720)).convert('RGBA')
bm = Image.new('L', badge.size, 0)
ImageDraw.Draw(bm).ellipse((8, 7, badge.width - 9, badge.height - 13), fill=255)
badge.putalpha(bm.filter(ImageFilter.GaussianBlur(2.2)))
badge.save(OUT / '04_纯净玩享徽章_PNG透明.png', 'PNG', optimize=True)

# Price card base with feathered shadow and original inset thumbnail. All card text is editable Text in Figma.
card_size = (182, 250)
card = Image.new('RGBA', card_size, (0, 0, 0, 0))
shadow = Image.new('RGBA', card_size, (0, 0, 0, 0))
ImageDraw.Draw(shadow).rounded_rectangle((7, 8, card_size[0] - 5, card_size[1] - 4), radius=18, fill=(80, 50, 30, 82))
card.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(8)))
body = Image.new('RGBA', card_size, (0, 0, 0, 0))
bd = ImageDraw.Draw(body)
bd.rounded_rectangle((2, 0, card_size[0] - 7, card_size[1] - 10), radius=18, fill=(250, 242, 224, 245))
bd.rounded_rectangle((5, 3, card_size[0] - 10, card_size[1] - 13), radius=15, outline=(255, 249, 235, 185), width=2)
card.alpha_composite(body)
thumb = src.crop((50, 860, 204, 944)).resize((154, 84), Image.Resampling.LANCZOS).convert('RGBA')
thumb.putalpha(soft_mask_rounded(thumb.size, 9, 1.2))
card.alpha_composite(thumb, (10, 158))
card.save(OUT / '04_价格卡片底板含缩略图_PNG透明.png', 'PNG', optimize=True)

(OUT / 'manifest.txt').write_text(
    'Frame 酒店活动海报 960x1706\n'
    '01_背景装饰组: 01_背景装饰组_天空光晕流线_PNG透明.png\n'
    '02_主视觉组: 02_客房实景大图_不透明.png\n'
    '03_标题模块组: 03_标题圆角标签底色_PNG透明.png, 03_标题装饰_Jiading_PNG透明.png\n'
    '04_左侧信息模块组: 04_纯净玩享徽章_PNG透明.png, 04_价格卡片底板含缩略图_PNG透明.png\n'
    '05_底部文字组: editable Text only\n', encoding='utf-8')

print('generated', OUT)
