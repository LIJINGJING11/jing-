from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "demo" / "assets"
SCALE = 2
WIDTH, HEIGHT = 1920, 1080


def cubic(p0, p1, p2, p3, steps=28):
    points = []
    for index in range(steps + 1):
        t = index / steps
        u = 1 - t
        points.append(
            (
                u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0],
                u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1],
            )
        )
    return points


def scaled_points(points):
    return [(round(x * SCALE), round(y * SCALE)) for x, y in points]


def save_downsampled(image, name):
    image.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS).save(
        ASSETS / name, "PNG", optimize=True
    )


def paper_texture(image, mask, base=(247, 241, 232), alpha=238):
    """Add a very subtle warm paper grain while keeping the outer canvas transparent."""
    width, height = image.size
    # Build straight-alpha RGBA data: keep the intended paper RGB intact and
    # use the supplied mask as the sole alpha channel. Image.composite against
    # transparent pixels would premultiply both RGB and alpha and make the
    # panel look gray/brown in the browser.
    texture = Image.new("RGBA", (width, height), (*base, 255))
    pixels = texture.load()
    for y in range(0, height, 3):
        for x in range(0, width, 3):
            n = ((x * 17 + y * 31) % 11) - 5
            pixels[x, y] = (max(0, base[0] + n), max(0, base[1] + n), max(0, base[2] + n), 255)
    texture = texture.resize((width, height), Image.Resampling.BILINEAR)
    texture.putalpha(mask)
    image.alpha_composite(texture)


def japanese_panel():
    # 04｜雅韵庭居客房直接使用设计师提供的透明 PNG，不再重新绘制轮廓。
    # The supplied bitmap is the cropped lower-left mask (1067 x 572). Place it
    # at its native size against the bottom-left of the 1920 x 1080 canvas so
    # neither the paper shape nor its transparency is stretched or recolored.
    source_path = ASSETS / "paper-mask.png"
    source = Image.open(source_path).convert("RGBA")
    if source.width > WIDTH or source.height > HEIGHT:
        raise ValueError(f"paper mask is larger than the canvas: {source.size}")

    image = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    image.alpha_composite(source, (0, HEIGHT - source.height))
    image.save(ASSETS / "panel-japanese.png", "PNG", optimize=True)


def art_panel():
    image = Image.new("RGBA", (WIDTH * SCALE, HEIGHT * SCALE), (0, 0, 0, 0))
    mask = Image.new("L", image.size, 0)
    path = [(0, 0), (820, 0)]
    path += cubic((820, 0), (730, 148), (658, 296), (622, 420))
    path += cubic((622, 420), (579, 565), (575, 708), (659, 842))
    path += cubic((659, 842), (705, 916), (785, 996), (870, 1080))
    path += [(0, 1080)]
    ImageDraw.Draw(mask).polygon(scaled_points(path), fill=226)
    # The Figma art-room reference uses a translucent parchment shape with no
    # drop shadow. Keep the outside fully transparent so the scene photo stays
    # untouched and the panel's own alpha remains the only blending control.
    paper_texture(image, mask, base=(248, 241, 229), alpha=226)
    save_downsampled(image, "panel-art-template.png")


def french_panel():
    image = Image.new("RGBA", (WIDTH * SCALE, HEIGHT * SCALE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    box = tuple(round(value * SCALE) for value in (72, 418, 752, 1028))
    shadow_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_layer)
    shadow_draw.rounded_rectangle(box, radius=31 * SCALE, fill=(91, 58, 36, 72))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(12 * SCALE))
    shadow_layer = shadow_layer.transform(shadow_layer.size, Image.AFFINE, (1, 0, 2 * SCALE, 0, 1, 9 * SCALE))
    image.alpha_composite(shadow_layer)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle(box, radius=31 * SCALE, fill=(255, 253, 246, 241), outline=(198, 167, 137, 245), width=3 * SCALE)
    inner = tuple(round(value * SCALE) for value in (104, 440, 720, 1007))
    draw.rounded_rectangle(inner, radius=22 * SCALE, outline=(191, 161, 132, 220), width=2 * SCALE)
    save_downsampled(image, "panel-french.png")


if __name__ == "__main__":
    ASSETS.mkdir(parents=True, exist_ok=True)
    japanese_panel()
    art_panel()
    french_panel()
    print("generated layered template panels")
