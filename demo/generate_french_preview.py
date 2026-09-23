from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
OUT = ASSETS / "template-french-room-figma.png"

WIDTH, HEIGHT = 1920, 1080


def font(path: str, size: int):
    return ImageFont.truetype(path, size)


SERIF = "/Library/Fonts/Microsoft/Fangsong.ttf"
SANS = "/Library/Fonts/Microsoft/Microsoft Yahei.ttf"


def draw_tracking(draw, xy, text, typeface, fill, tracking=0, anchor="la"):
    """Draw text with explicit tracking so the preview follows the Figma spacing."""
    x, y = xy
    if not tracking:
        draw.text((x, y), text, font=typeface, fill=fill, anchor=anchor)
        return

    # Anchor is only needed for the centered subtitle/body/tagline lines below;
    # tracking is measured first and the run is placed from its visual center.
    widths = [draw.textlength(char, font=typeface) for char in text]
    total = sum(widths) + max(0, len(text) - 1) * tracking
    if anchor in ("ma", "mm", "ms"):
        x -= total / 2
    for char, width in zip(text, widths):
        draw.text((x, y), char, font=typeface, fill=fill, anchor="la")
        x += width + tracking


def cover(image, size):
    target_w, target_h = size
    ratio = max(target_w / image.width, target_h / image.height)
    scaled = image.resize((round(image.width * ratio), round(image.height * ratio)), Image.Resampling.LANCZOS)
    left = max(0, (scaled.width - target_w) // 2)
    top = max(0, (scaled.height - target_h) // 2)
    return scaled.crop((left, top, left + target_w, top + target_h))


def main():
    scene = Image.open(ASSETS / "scene-french-room.jpg").convert("RGB")
    canvas = cover(scene, (WIDTH, HEIGHT)).convert("RGBA")

    # This is the PNG exported from the Figma `canvas-image (69) (1) 1` layer.
    # Keep its transparent corners and place it at the exact Figma coordinates.
    panel = Image.open(ASSETS / "panel-french-figma.png").convert("RGBA")
    canvas.alpha_composite(panel.resize((735, 648), Image.Resampling.LANCZOS), (19, 248))

    draw = ImageDraw.Draw(canvas)
    brown = "#5B3A28"
    muted = "#B38E77"
    body = "#674433"
    foot = "#84634A"

    # Figma text boxes: brand (82,47), title (188,410), subtitle (219,535),
    # body lines (225.5,635) and (169,681), footnote (293,775).
    draw_tracking(draw, (82, 47), "T Hotel", font(SANS, 24), brown, tracking=3)
    draw_tracking(draw, (188, 410), "法式雅韵客房", font(SERIF, 74), brown, tracking=2)
    draw_tracking(draw, (410.5, 535), "复古线条  |  柔和织物  |  优雅氛围", font(SERIF, 27), muted, tracking=1.5, anchor="ma")
    draw_tracking(draw, (410.5, 635), "细腻线脚与温柔色调勾勒优雅轮廓，", font(SERIF, 23), body, tracking=0.7, anchor="ma")
    draw_tracking(draw, (410.5, 681), "空间在复古与舒适之间保持恰到好处的松弛感。", font(SERIF, 23), body, tracking=0.7, anchor="ma")
    draw_tracking(draw, (396.5, 775), "*软装细节以实际客房为准", font(SERIF, 18), foot, tracking=0.8, anchor="ma")

    canvas.convert("RGB").save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT} ({canvas.width}x{canvas.height})")


if __name__ == "__main__":
    main()
