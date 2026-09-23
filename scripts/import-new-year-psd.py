#!/usr/bin/env python3
"""Import 元旦海报.psd as independent bitmap and editable text layers."""

from __future__ import annotations

import json
import re
from pathlib import Path

from psd_tools import PSDImage
from psd_tools.api.layers import Group, TypeLayer


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("/Users/sigurd/Desktop/酒店素材工坊源文件/元旦海报.psd")
OUTPUT = ROOT / "demo/assets/psd-new-year-portrait"
JS_OUTPUT = ROOT / "demo/psd-new-year.js"


def leaves(group):
    for layer in group:
        if isinstance(layer, Group):
            yield from leaves(layer)
        else:
            yield layer


def percentage_box(bbox, width, height):
    left, top, right, bottom = bbox
    return {
        "x": ((left + right) / 2) / width * 100,
        "y": ((top + bottom) / 2) / height * 100,
        "w": (right - left) / width * 100,
        "h": (bottom - top) / height * 100,
    }


def layer_key(index: int, layer):
    return f"new_year_{index:02d}"


def text_style(layer):
    style = layer.engine_dict["StyleRun"]["RunArray"][0]["StyleSheet"]["StyleSheetData"]
    values = style.get("FillColor", {}).get("Values", [1.0, 1.0, 1.0, 1.0])
    rgb = values[-3:]
    color = "#" + "".join(
        f"{round(max(0, min(1, channel)) * 255):02X}" for channel in rgb
    )
    font_set = layer.resource_dict.get("FontSet", [])
    font_index = int(style.get("Font", 0))
    font_name = str(
        font_set[font_index].get("Name", "")
        if font_set and font_index < len(font_set)
        else ""
    )
    raw_font_size = float(style.get("FontSize", 24))
    transform = layer.transform or (1.0, 0.0, 0.0, 1.0, 0.0, 0.0)
    scale_x = abs(float(transform[0] or 1.0))
    scale_y = abs(float(transform[3] or 1.0))
    return {
        # Photoshop stores the Type layer's base font size separately from
        # the transform applied to the layer. Preserve that transform so the
        # editable browser text has the same visual scale as the PSD render.
        "fontSize": raw_font_size * scale_y,
        "psdFontSize": raw_font_size,
        "scaleX": scale_x / scale_y if scale_y else 1.0,
        "lineHeight": 1.2,
        "color": color,
        "font": font_index,
        "fontName": font_name,
        "kind": (
            "source-han-serif" if "SourceHanSerif" in font_name else
            "source-han-sans" if "SourceHanSans" in font_name else
            "serif" if "Serif" in font_name or "MaShan" in font_name else
            "sans"
        ),
        "fontStyle": "normal",
        "weight": 600 if "SemiBold" in font_name or "Bold" in font_name else 400,
        "letterSpacing": f"{float(style.get('Tracking', 0)) / 1000:.3f}em",
    }


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(f"PSD not found: {SOURCE}")

    psd = PSDImage.open(SOURCE)
    width, height = psd.size
    if (width, height) != (2048, 3072):
        raise ValueError(f"Unexpected PSD canvas: {width} × {height}")

    OUTPUT.mkdir(parents=True, exist_ok=True)
    psd.composite().save(OUTPUT / "preview.png", dpi=(72, 72))

    assets = {}
    text = {}
    order = []
    hidden = []
    z_index = 1
    for index, layer in enumerate(leaves(psd), start=1):
        key = layer_key(index, layer)
        order.append(layer.name)
        if not layer.visible:
            hidden.append(layer.name)
            continue

        box = percentage_box(layer.bbox, width, height)
        if isinstance(layer, TypeLayer):
            text[key] = {
                "label": layer.name,
                "value": layer.text.rstrip("\r"),
                **box,
                **text_style(layer),
                "pointText": True,
                "zIndex": z_index,
                "bbox": list(layer.bbox),
            }
        else:
            filename = f"{key}.png"
            layer.composite().save(OUTPUT / filename, dpi=(72, 72))
            assets[key] = {
                "src": f"./assets/psd-new-year-portrait/{filename}",
                **box,
                "zIndex": z_index,
                "label": layer.name,
                "bbox": list(layer.bbox),
                "size": list(layer.size),
                "kind": layer.kind,
            }
        z_index += 1

    metadata = {
        "source": str(SOURCE),
        "width": width,
        "height": height,
        "dpi": 72,
        "topLevelOrder": [layer.name for layer in psd],
        "leafLayerOrder": order,
        "hiddenLayers": hidden,
        "assets": assets,
        "text": text,
    }
    (OUTPUT / "metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (OUTPUT / "README.md").write_text(
        "# PSD｜元旦海报（竖版）\n\n"
        f"来源：`{SOURCE}`\n\n"
        "- 原始画布：2048 × 3072 px，竖版 2:3\n"
        "- `preview.png`：原 PSD 合成预览，仅用于模板卡片参考\n"
        f"- {len(assets)} 个非文字图层逐层导出为 PNG，并保留原始边界与堆叠顺序\n"
        f"- {len(text)} 个 Photoshop Type 图层在编辑器中以独立 HTML 文字呈现，可双击编辑\n"
        "- `metadata.json`：记录 PSD 图层顺序、像素边界和文字样式\n",
        encoding="utf-8",
    )

    js = (
        "// Imported from 元旦海报.psd (2048 × 3072, portrait).\n"
        f"const psdNewYearAssetLayers={json.dumps(assets, ensure_ascii=False, separators=(',', ':'))};\n"
        f"const psdNewYearTextLayers={json.dumps(text, ensure_ascii=False, separators=(',', ':'))};\n"
        "const psdNewYearTextPosition=Object.fromEntries(Object.entries(psdNewYearTextLayers).map(([key,spec])=>[key,{x:spec.x,y:spec.y,w:spec.w,h:spec.h}]));\n"
        "const psdNewYearTextLayerKeys=new Set(Object.keys(psdNewYearTextLayers));\n"
        f"const psdNewYearHiddenLayers={json.dumps(hidden, ensure_ascii=False, separators=(',', ':'))};\n"
    )
    JS_OUTPUT.write_text(js, encoding="utf-8")
    print(f"Imported {len(assets)} bitmap layers and {len(text)} text layers into {OUTPUT}")


if __name__ == "__main__":
    main()
