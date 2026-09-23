"""Create the small business-template accents as transparent PNG layers."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1] / "demo" / "assets"
SCALE = 4


def save(image: Image.Image, name: str, size: tuple[int, int]) -> None:
    image.resize(size, Image.Resampling.LANCZOS).save(ROOT / name, "PNG", optimize=True)


def rule() -> None:
    image = Image.new("RGBA", (512 * SCALE, 4 * SCALE), (0, 0, 0, 0))
    ImageDraw.Draw(image).rectangle(
        (0, 0, image.width - 1, image.height - 1), fill=(175, 196, 214, 140)
    )
    save(image, "decor-business-rule.png", (512, 4))


def dot() -> None:
    image = Image.new("RGBA", (12 * SCALE, 12 * SCALE), (0, 0, 0, 0))
    ImageDraw.Draw(image).ellipse(
        (2 * SCALE, 2 * SCALE, 10 * SCALE, 10 * SCALE), fill=(243, 250, 255, 255)
    )
    save(image, "decor-business-dot.png", (12, 12))


def glow() -> None:
    size = 64 * SCALE
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pixels = image.load()
    center = (size - 1) / 2
    radius = size / 2
    for y in range(size):
        for x in range(size):
            distance = ((x - center) ** 2 + (y - center) ** 2) ** 0.5 / radius
            alpha = max(0, int(72 * (1 - min(1, distance)) ** 2))
            pixels[x, y] = (243, 250, 255, alpha)
    image = image.filter(ImageFilter.GaussianBlur(1.5 * SCALE))
    save(image, "decor-business-glow.png", (64, 64))


if __name__ == "__main__":
    ROOT.mkdir(parents=True, exist_ok=True)
    rule()
    dot()
    glow()
    print("generated business accent PNGs")
