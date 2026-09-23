from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path('/Users/sigurd/Documents/ChatGPT/酒店素材工坊')


def upscale(src: Path, dst: Path, scale: int = 4):
    im = Image.open(src).convert('RGBA')
    size = (im.width * scale, im.height * scale)
    # Preserve the source alpha matte, then add a restrained unsharp pass so
    # fine ink strokes survive Figma's downsampling at presentation scale.
    up = im.resize(size, Image.Resampling.LANCZOS)
    up = up.filter(ImageFilter.UnsharpMask(radius=1.2 * scale, percent=125, threshold=2))
    up.save(dst, 'PNG', optimize=True)


def crop_family_icons():
    src = Image.open(ROOT / 'complex-family-icons.png').convert('RGBA')
    # The supplied strip contains four equal icon cells. Keep the original
    # transparent padding in each cell so every PNG can be positioned on its
    # own without introducing a visible rectangular background.
    cuts = [(0, 0, 96, src.height), (96, 0, 192, src.height),
            (192, 0, 287, src.height), (287, 0, src.width, src.height)]
    for i, box in enumerate(cuts, 1):
        cell = src.crop(box)
        for scale in (2, 4):
            hi = cell.resize((cell.width * scale, cell.height * scale), Image.Resampling.LANCZOS)
            hi = hi.filter(ImageFilter.UnsharpMask(radius=1.2 * scale, percent=125, threshold=2))
            hi.save(ROOT / f'complex-family-icon-{i}@{scale}x.png', 'PNG', optimize=True)


for name in [
    'complex-french-ornament-top.png',
    'complex-french-ornament-bottom.png',
    'complex-business-icons.png',
    'complex-family-icons.png',
    'complex-japanese-top.png',
    'complex-japanese-bottom-line.png',
    'complex-japanese-seal.png',
    'complex-japanese-bamboo.png',
    'complex-art-arc.png',
    'complex-art-signature.png',
    'complex-night-stars.png',
    'complex-night-arcs.png',
]:
    upscale(ROOT / name, ROOT / name.replace('.png', '@4x.png'))

crop_family_icons()
print('upgraded PNG assets')
