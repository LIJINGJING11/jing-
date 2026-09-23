from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

OUT = Path(__file__).resolve().parent / "assets"
S = 4


def save(name, draw_fn, size):
    w, h = size
    image = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw_fn(draw, w * S, h * S)
    image.resize((w, h), Image.Resampling.LANCZOS).save(OUT / name)


GOLD = (218, 172, 96, 235)
GOLD_SOFT = (218, 172, 96, 150)
WHITE_GOLD = (241, 221, 177, 210)
SCRIPT_FONT = "/Library/Fonts/Microsoft/Edwardian Script ITC"


def wave(draw, w, h):
    # Wide, quiet gold waves for the midnight template.
    for i in range(7):
        box = (-int(w * .28) + i * 30 * S, int(h * (.50 + i * .075)), int(w * .82) + i * 30 * S, int(h * (1.34 + i * .075)))
        draw.arc(box, 196, 342, fill=GOLD if i in (1, 5) else GOLD_SOFT, width=3 * S)
    draw.arc((-int(w * .18), int(h * .57), int(w * .76), int(h * 1.22)), 196, 342, fill=GOLD, width=5 * S)


def stars(draw, w, h):
    points = [(0.10, .24, 3), (.18, .65, 2), (.31, .34, 2), (.42, .78, 3), (.55, .22, 2), (.66, .55, 2), (.78, .30, 3), (.88, .68, 2), (.95, .18, 2)]
    for x, y, r in points:
        x, y, r = int(w * x), int(h * y), r * S
        draw.ellipse((x - r, y - r, x + r, y + r), fill=WHITE_GOLD)
        draw.line((x - r * 2, y, x + r * 2, y), fill=GOLD_SOFT, width=max(1, S // 2))
        draw.line((x, y - r * 2, x, y + r * 2), fill=GOLD_SOFT, width=max(1, S // 2))


def ornament(draw, w, h):
    y = int(h * .52)
    draw.line((int(w * .08), y, int(w * .92), y), fill=GOLD, width=3 * S)
    r = int(h * .12)
    cx = w // 2
    draw.polygon([(cx, y - r), (cx + r, y), (cx, y + r), (cx - r, y)], outline=GOLD, fill=(0, 0, 0, 0), width=3 * S)
    draw.ellipse((cx - S, y - S, cx + S, y + S), fill=GOLD)


def circles(draw, w, h):
    cx, cy = int(w * .5), int(h * .5)
    for ratio, color, width in ((.34, GOLD, 4), (.18, GOLD_SOFT, 3), (.48, GOLD_SOFT, 2)):
        r = int(min(w, h) * ratio)
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=color, width=width * S)


def business_icons(draw, w, h):
    """Three small line icons used by the cloud-business-room template.

    Labels remain HTML text layers; this bitmap only contains the transparent
    white icon artwork so the scene and copy stay independently editable.
    """
    stroke = (239, 246, 250, 225)
    soft = (239, 246, 250, 185)
    def sx(value): return int(value * S)
    def sy(value): return int(value * S)
    # Work desk / monitor.
    x, y = 92, 56
    draw.rectangle((sx(x), sy(y), sx(x + 34), sy(y + 28)), outline=stroke, width=2 * S)
    draw.line((sx(x + 17), sy(y + 28), sx(x + 17), sy(y + 39)), fill=stroke, width=2 * S)
    draw.line((sx(x + 8), sy(y + 39), sx(x + 27), sy(y + 39)), fill=stroke, width=2 * S)
    draw.rectangle((sx(x + 44), sy(y - 8), sx(x + 75), sy(y + 28)), outline=stroke, width=2 * S)
    draw.line((sx(x + 59), sy(y + 28), sx(x + 59), sy(y + 39)), fill=stroke, width=2 * S)
    draw.line((sx(x + 50), sy(y + 39), sx(x + 69), sy(y + 39)), fill=stroke, width=2 * S)
    draw.line((sx(x - 2), sy(y + 51), sx(x + 75), sy(y + 51)), fill=soft, width=2 * S)
    # City skyline.
    x, y = 362, 45
    buildings = [(0, 38, 21, 78), (25, 15, 44, 78), (48, 27, 69, 78), (73, 3, 97, 78)]
    for left, top, right, bottom in buildings:
        draw.rectangle((sx(x + left), sy(y + top), sx(x + right), sy(y + bottom)), outline=stroke, width=2 * S)
        for wx in range(x + left + 6, x + right - 2, 8):
            for wy in range(y + top + 8, y + bottom - 3, 11):
                draw.rectangle((sx(wx), sy(wy), sx(wx + 2), sy(wy + 3)), fill=soft)
    draw.line((sx(x - 4), sy(y + 82), sx(x + 102), sy(y + 82)), fill=soft, width=2 * S)
    # Bed + crescent moon.
    x, y = 660, 52
    draw.arc((sx(x + 53), sy(y - 24), sx(x + 88), sy(y + 11)), 215, 55, fill=stroke, width=2 * S)
    draw.line((sx(x + 19), sy(y + 48), sx(x + 94), sy(y + 48)), fill=stroke, width=2 * S)
    draw.line((sx(x + 24), sy(y + 48), sx(x + 24), sy(y + 82)), fill=stroke, width=2 * S)
    draw.line((sx(x + 88), sy(y + 48), sx(x + 88), sy(y + 82)), fill=stroke, width=2 * S)
    draw.rounded_rectangle((sx(x), sy(y + 20), sx(x + 25), sy(y + 48)), radius=3 * S, outline=stroke, width=2 * S)
    draw.line((sx(x + 25), sy(y + 21), sx(x + 88), sy(y + 21)), fill=stroke, width=2 * S)
    draw.line((sx(x + 36), sy(y + 31), sx(x + 82), sy(y + 31)), fill=soft, width=2 * S)


def curve(draw, w, h):
    # A soft curved ribbon for the family template.
    points = []
    for i in range(181):
        x = int(w * (.02 + .96 * i / 180))
        y = int(h * (.62 - .22 * (i / 180) + .10 * ((i / 180) ** 2)))
        points.append((x, y))
    draw.line(points, fill=GOLD_SOFT, width=6 * S, joint="curve")
    draw.line([(x, y - 18 * S) for x, y in points], fill=GOLD, width=2 * S, joint="curve")


def script_word(draw, w, h):
    # The art-room reference uses a very light handwritten flourish near the
    # bottom of the parchment panel. Keep it as a transparent bitmap so the
    # user can still replace the room photo without baking text into it.
    font = ImageFont.truetype(SCRIPT_FONT, int(h * .47))
    draw.text((int(w * .035), int(h * .66)), "Giram", font=font,
              fill=(174, 136, 78, 104), stroke_width=max(1, S),
              stroke_fill=(174, 136, 78, 42))


save("decor-midnight-wave.png", wave, (1000, 700))
save("decor-midnight-stars.png", stars, (800, 460))
save("decor-ornament.png", ornament, (900, 220))
save("decor-circles.png", circles, (640, 520))
save("decor-curve.png", curve, (900, 360))
save("decor-art-script.png", script_word, (1600, 900))
save("decor-business-icons.png", business_icons, (800, 260))


def alpha_gradient(width, height, color, solid_until, fade_until, reverse=False):
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    pixels = image.load()
    for x in range(width):
        t = x / max(1, width - 1)
        if reverse:
            t = 1 - t
        if t <= solid_until:
            alpha = 252
        elif t >= fade_until:
            alpha = 0
        else:
            alpha = int(252 * (1 - (t - solid_until) / (fade_until - solid_until)))
        for y in range(height):
            pixels[x, y] = (*color, alpha)
    return image


def add_paper_texture(image, strength=8):
    base_alpha = image.getchannel("A")
    noise = Image.effect_noise(image.size, 12).convert("L")
    texture = Image.new("RGBA", image.size, (104, 78, 38, 0))
    texture.putalpha(noise.point(lambda p: int((p / 255) * strength)))
    image.alpha_composite(texture)
    # Do not let the texture create a faint opaque veil outside a panel's
    # original alpha mask. The scene photo must remain untouched there.
    image.putalpha(ImageChops.multiply(image.getchannel("A"), base_alpha))


def make_panel_assets():
    width, height = 1600, 900
    alpha_gradient(width, height, (58, 31, 13), .52, .76).save(OUT / "panel-warm.png")
    alpha_gradient(width, height, (5, 22, 49), .52, .74).save(OUT / "panel-night-bath.png")
    alpha_gradient(width, height, (5, 22, 49), .52, .72).save(OUT / "panel-star-night.png")

    # Use a smooth concave sweep rather than the previous angular polygon.
    # This follows the curved parchment edge in the art-room reference and
    # leaves the scene photo visible on the right.
    art = Image.new("RGBA", (width * S, height * S), (0, 0, 0, 0))
    art_draw = ImageDraw.Draw(art)

    def cubic(p0, p1, p2, p3, steps=48):
        points = []
        for i in range(steps + 1):
            t = i / steps
            u = 1 - t
            points.append((
                (u ** 3) * p0[0] + 3 * (u ** 2) * t * p1[0] + 3 * u * (t ** 2) * p2[0] + (t ** 3) * p3[0],
                (u ** 3) * p0[1] + 3 * (u ** 2) * t * p1[1] + 3 * u * (t ** 2) * p2[1] + (t ** 3) * p3[1],
            ))
        return points

    curve_a = cubic((880, 0), (735, 115), (585, 255), (565, 430))
    curve_b = cubic((565, 430), (575, 620), (760, 790), (925, 900))
    boundary = [(int(x * S), int(y * S)) for x, y in curve_a + curve_b[1:]]
    art_draw.polygon([(0, 0), *boundary, (0, height * S)], fill=(247, 240, 222, 250))
    art_draw.line(boundary, fill=(192, 151, 72, 210), width=2 * S, joint="curve")
    add_paper_texture(art, 7)
    art.resize((width, height), Image.Resampling.LANCZOS).save(OUT / "panel-art.png")

    classic = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    classic_draw = ImageDraw.Draw(classic)
    # Cover the baked logo/title in the source preview while retaining the warm wall tone.
    classic_draw.rectangle((0, 0, 700, 285), fill=(196, 166, 138, 255))
    card = (55, 265, 585, 840)
    classic_draw.rounded_rectangle(card, radius=28, fill=(250, 247, 239, 252), outline=(167, 125, 87, 210), width=2)
    inner = (68, 278, 572, 827)
    classic_draw.rounded_rectangle(inner, radius=22, outline=(188, 151, 112, 150), width=1)
    add_paper_texture(classic, 5)
    classic.save(OUT / "panel-classic.png")

    business = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    business_draw = ImageDraw.Draw(business)
    right_edge = [(1165, 0), (1210, 120), (1230, 250), (1220, 420), (1200, 590), (1180, 760), (1160, 900)]
    business_draw.polygon([*right_edge, (width, height), (width, 0)], fill=(10, 28, 45, 252))
    business_draw.line(right_edge, fill=(202, 157, 92, 150), width=2)
    # The source preview contains baked-in heading text on the room photo. This mask cleans it before editable text is drawn.
    cleanup = alpha_gradient(900, 520, (15, 26, 38), .88, 1)
    business.alpha_composite(cleanup, (0, 0))
    business_draw.rectangle((0, 825, 430, 900), fill=(15, 26, 38, 255))
    business.save(OUT / "panel-business.png")

    # Cloud-business-room: a clean 44% navy panel with subtle geometric
    # texture. The remaining area stays fully transparent so the editable
    # hotel scene remains visible on the right without a baked-in preview.
    business_v2 = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    business_v2_draw = ImageDraw.Draw(business_v2)
    panel_w = int(width * .44)
    business_v2_draw.rectangle((0, 0, panel_w, height), fill=(35, 67, 96, 252))
    # Low-contrast diagonal facets echo the Figma panel without competing
    # with editable copy.
    # Draw low-alpha facets on a separate layer; drawing them directly would
    # replace the base alpha and accidentally turn the panel translucent.
    texture = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    texture_draw = ImageDraw.Draw(texture)
    texture_draw.polygon([(0, 0), (panel_w, 0), (panel_w, 250), (280, 900), (0, 900)], fill=(43, 79, 110, 85))
    texture_draw.polygon([(panel_w, 425), (panel_w, 900), (180, 900)], fill=(16, 43, 70, 70))
    texture_draw.line([(int(panel_w * .06), 900), (panel_w, int(height * .45))], fill=(111, 151, 185, 35), width=2)
    texture_draw.line([(int(panel_w * .18), 900), (panel_w, int(height * .63))], fill=(111, 151, 185, 26), width=2)
    texture_draw.rectangle((int(panel_w * .56), int(height * .34), panel_w, int(height * .54)), fill=(75, 111, 142, 30))
    texture_draw.line([(0, int(height * .21)), (int(panel_w * .84), int(height * .21))], fill=(149, 180, 204, 33), width=1)
    business_v2.alpha_composite(texture)
    business_v2.save(OUT / "panel-business-v2.png")

    family = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    family_draw = ImageDraw.Draw(family)
    family_draw.rounded_rectangle((958, 326, 1572, 860), radius=54, fill=(255, 248, 237, 252), outline=(255, 255, 255, 230), width=2)
    # Clean the baked-in BRAND LOGO while keeping the warm ceiling tone.
    logo_patch = Image.new("RGBA", (310, 74), (249, 230, 206, 255)).filter(ImageFilter.GaussianBlur(3))
    family.alpha_composite(logo_patch, (42, 28))
    family.save(OUT / "panel-family.png")


make_panel_assets()


def make_business_preview():
    """Build a template-library preview from clean scene + split assets."""
    width, height = 1600, 900
    scene = Image.open(OUT / "scene-business-room.png").convert("RGB").resize((width, height), Image.Resampling.LANCZOS).convert("RGBA")
    canvas = scene.copy()
    canvas.alpha_composite(Image.open(OUT / "panel-business-v2.png").convert("RGBA"))
    icons = Image.open(OUT / "decor-business-icons.png").convert("RGBA")
    icons = icons.resize((int(width * .31), int(width * .31 * icons.height / icons.width)), Image.Resampling.LANCZOS)
    canvas.alpha_composite(icons, (int(width * .26 - icons.width / 2), int(height * .53 - icons.height / 2)))

    # STHeiti is bundled with macOS and includes the Chinese glyphs used by
    # this preview (PingFang is not present on every demo machine).
    font_path = "/System/Library/Fonts/STHeiti Medium.ttc"
    def font(size, index=0):
        try:
            return ImageFont.truetype(font_path, size, index=index)
        except OSError:
            return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)
    draw = ImageDraw.Draw(canvas)
    x = int(width * .08)
    draw.text((x, int(height * .07)), "T Hotel", font=font(22), fill=(243, 189, 123, 255))
    draw.line((x, int(height * .22), int(width * .45), int(height * .22)), fill=(238, 245, 250, 105), width=2)
    draw.text((x, int(height * .27)), "云境商务客房", font=font(51), fill=(241, 193, 158, 255))
    draw.text((x, int(height * .385)), "高效办公｜城市视野｜舒适睡眠", font=font(17), fill=(244, 247, 251, 255))
    label_y = int(height * .51 + icons.height / 2 + 6)
    for label, left in (("高效办公", .09), ("城市视野", .22), ("舒适睡眠", .35)):
        label_font = font(14)
        label_width = draw.textbbox((0, 0), label, font=label_font)[2]
        draw.text((int(width * (left + .05) - label_width / 2), label_y), label, font=label_font, fill=(244, 247, 251, 255))
    body_y = int(height * .64)
    for index, line in enumerate(("办公与休憩区域清晰衔接，简洁动线", "与柔和灯光共同营造稳定、专注且放松", "的入住体验。")):
        draw.text((x, body_y + index * 26), line, font=font(15), fill=(217, 228, 238, 255))
    draw.text((x, int(height * .92)), "*房间配置以及实际入住安排为准", font=font(11), fill=(217, 227, 237, 255))
    canvas.convert("RGB").save(OUT / "daily-business-room-v2.png", optimize=True)


make_business_preview()
