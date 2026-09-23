"""Convert the three Figma business icon SVG renders into transparent PNGs.

The editor intentionally consumes bitmaps for decorative/icon layers.  The
source SVGs are rendered by the local Chrome preview on a temporary matte;
this script removes that matte while retaining anti-aliased light strokes.
"""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
TMP = Path("/private/tmp")
BACKGROUND = (255.0, 34.0, 58.0)
FOREGROUND = (242.0, 246.0, 250.0)


def remove_matte(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, _ = pixels[x, y]
            # Chrome composites the light stroke over our red matte.  Estimate
            # the original coverage from all three channels and keep the
            # strongest estimate to preserve thin anti-aliased edges.
            estimates = []
            for channel, bg, fg in zip((r, g, b), BACKGROUND, FOREGROUND):
                if fg != bg:
                    estimates.append((channel - bg) / (fg - bg))
            alpha = max(0.0, min(1.0, max(estimates)))
            if alpha < 0.008:
                pixels[x, y] = (242, 246, 250, 0)
            else:
                pixels[x, y] = (242, 246, 250, round(alpha * 255))
    image.save(destination, "PNG", optimize=True)


if __name__ == "__main__":
    for name in ("work", "city", "sleep"):
        remove_matte(TMP / f"icon-{name}-bg.png", ROOT / "demo" / "assets" / f"business-icon-{name}.png")
    print("rasterized business icon PNGs")
