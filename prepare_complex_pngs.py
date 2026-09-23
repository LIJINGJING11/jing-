from PIL import Image, ImageFilter
from pathlib import Path
import numpy as np

root = Path('/Users/sigurd/Documents/ChatGPT/酒店素材工坊')
tmp = Path('/var/folders/r9/vw9xxp7104x2dhn2609sf9480000gn/T')

def save_opt(im, name, size=None, colors=128):
    if size:
        im.thumbnail(size, Image.Resampling.LANCZOS)
    # Quantize after the matte is created. Pillow keeps the RGBA transparency
    # table while reducing clipboard payloads by an order of magnitude.
    im = im.quantize(colors=colors, method=Image.Quantize.FASTOCTREE).convert('RGBA')
    im.save(root / name, optimize=True)

def smoothstep(edge0, edge1, value):
    value = np.clip((value - edge0) / float(edge1 - edge0), 0.0, 1.0)
    return value * value * (3.0 - 2.0 * value)

def transparent_light(im, bg, dark_start=8, dark_end=58, keep_chroma=True):
    """Remove light paper/cream backing while retaining darker linework."""
    arr = np.asarray(im.convert('RGB')).astype(np.float32)
    bg = np.asarray(bg, dtype=np.float32)
    darkness = np.mean(bg - arr, axis=2)
    alpha = smoothstep(dark_start, dark_end, darkness)
    if keep_chroma:
        chroma = arr.max(axis=2) - arr.min(axis=2)
        # Red seals and warm ink can be chromatic without being very dark.
        alpha = np.maximum(alpha, smoothstep(18, 70, chroma) * smoothstep(45, 155, 255 - arr.mean(axis=2)))
    out = np.dstack([arr.astype(np.uint8), (alpha * 255).astype(np.uint8)])
    return Image.fromarray(out, 'RGBA')

def transparent_signature(im):
    """Extract the warm, low-contrast signature but discard the room photo."""
    arr = np.asarray(im.convert('RGB')).astype(np.float32)
    bg = np.array([230, 217, 199], dtype=np.float32)
    darkness = np.mean(bg - arr, axis=2)
    luma = arr.mean(axis=2)
    # The right side of this crop crosses the bedroom photo. Limiting the
    # matte to the light paper range prevents that photo becoming a rectangle.
    alpha = smoothstep(9, 50, darkness) * smoothstep(145, 205, luma)
    # Signature strokes are warmer/more saturated than the paper grain.
    warm = (arr[..., 0] - arr[..., 2])
    alpha *= smoothstep(24, 55, warm)
    alpha = np.clip(alpha * 2.2, 0.0, 1.0)
    out = np.dstack([arr.astype(np.uint8), (alpha * 255).astype(np.uint8)])
    return Image.fromarray(out, 'RGBA')

def transparent_night(im):
    """Keep gold stars/curves while keying out the deep navy backing."""
    arr = np.asarray(im.convert('RGB')).astype(np.float32)
    warm = arr[..., 0] - arr[..., 2]
    luma = arr.mean(axis=2)
    # Navy texture has B > R; gold details have a strong positive R-B delta.
    alpha = smoothstep(7, 34, warm) * smoothstep(16, 42, luma)
    out = np.dstack([arr.astype(np.uint8), (alpha * 255).astype(np.uint8)])
    return Image.fromarray(out, 'RGBA')

for src, dst in {
    'codex-clipboard-1892d919-04d8-4ea5-b046-132ad6abe4c2.png': 'complex-business-icons.png',
    'codex-clipboard-5863809b-8106-43dd-bf41-d4650f0838e6.png': 'complex-family-icons.png',
    'codex-clipboard-79870968-fd54-47ff-a57b-7f9357fb7531.png': 'complex-french-ornament-top.png',
    'codex-clipboard-b0e369f3-57c9-4b87-a791-7fd5b3fc893c.png': 'complex-french-ornament-bottom.png',
}.items():
    src_im = Image.open(tmp / src).convert('RGBA')
    # The first two are supplied as clean reference assets. Remove only the
    # surrounding cream field so the circles/line icons remain intact.
    if 'business' in dst:
        # This supplied strip already carries the same blue-grey gradient as
        # the business panel. Keep it opaque to preserve the exact icon color
        # and avoid keying the white linework away.
        src_im = src_im
    elif 'family' in dst:
        src_im = transparent_light(src_im, (244, 237, 226), dark_start=8, dark_end=80)
    elif 'french' in dst:
        src_im = transparent_light(src_im, (240, 235, 227), dark_start=5, dark_end=48)
    save_opt(src_im, dst)

# Clean, red-markup-free crops from the original references.
jp = Image.open('/Users/sigurd/Downloads/01a03370-7331-7ca1-951a-eac8ab99ced1.png').convert('RGBA')
save_opt(transparent_light(jp.crop((24, 532, 226, 610)), (215, 205, 195), dark_start=8, dark_end=64), 'complex-japanese-top.png', size=(190, 74), colors=96)
save_opt(transparent_light(jp.crop((0, 948, 144, 1012)), (213, 203, 194), dark_start=7, dark_end=55), 'complex-japanese-bottom-line.png', size=(154, 67), colors=96)
seal = jp.crop((44, 643, 125, 756))
save_opt(transparent_light(seal, (214, 204, 194), dark_start=10, dark_end=120), 'complex-japanese-seal.png', size=(72, 102), colors=96)
# Start below the body-copy baseline; the original crop otherwise carries a
# few glyphs above the bamboo branch into the decorative PNG.
bamboo = jp.crop((305, 925, 820, 1152))
save_opt(transparent_light(bamboo, (222, 212, 202), dark_start=7, dark_end=70), 'complex-japanese-bamboo.png', size=(515, 227), colors=128)

art = Image.open('/Users/sigurd/Downloads/01a03374-3dc9-7777-b115-84f3336e42d7.png').convert('RGBA')
# Stop before the title baseline so no Chinese glyph fragments are baked into
# the decorative arc PNG.
save_opt(transparent_light(art.crop((330, 0, 620, 385)), (236, 226, 211), dark_start=8, dark_end=100), 'complex-art-arc.png', size=(340, 385), colors=128)
sig = art.crop((65, 848, 1010, 1080))
sig_rgba = transparent_signature(sig)
# Follow the diagonal paper edge from the reference and discard the bedroom
# photo on the far-right side of the crop. The signature remains as a clean
# transparent overlay on the paper panel.
sa = np.asarray(sig_rgba).copy()
yy = np.arange(sa.shape[0])[:, None]
xx = np.arange(sa.shape[1])[None, :]
paper_edge = 540 + yy * 0.92
sa[..., 3] = np.where(xx <= paper_edge, sa[..., 3], 0)
save_opt(Image.fromarray(sa, 'RGBA'), 'complex-art-signature.png', size=(945, 232), colors=128)

night = Image.open('/Users/sigurd/Downloads/01a03379-5fa5-79e7-8c7c-8fbbfe914de5.png').convert('RGBA')
stars = transparent_night(night.crop((0, 0, 720, 330)))
st = np.asarray(stars).copy()
# Keep the logo editable in the SVG layer; only the star texture belongs in
# this bitmap. Clear the logo area from the cropped reference.
st[28:118, 36:420, 3] = 0
save_opt(Image.fromarray(st, 'RGBA'), 'complex-night-stars.png', size=(720, 330), colors=128)
save_opt(transparent_night(night.crop((0, 700, 720, 1010))), 'complex-night-arcs.png', size=(720, 310), colors=128)

print('prepared complex PNGs')
