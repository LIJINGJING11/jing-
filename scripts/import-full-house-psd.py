#!/usr/bin/env python3
"""Import 满房海报.psd as independent bitmap and editable text layers."""

from __future__ import annotations

import json
from pathlib import Path

from psd_tools import PSDImage
from psd_tools.api.layers import Group, TypeLayer


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("/Users/sigurd/Downloads/满房海报.psd")
OUTPUT = ROOT / "demo/assets/psd-full-house-portrait"

ASSET_KEYS = {
    "01_背景_无字酒店客房": ("full_house_background", "full_house_background.png"),
    "02_装饰_金色短横线_透明位图": ("full_house_rule", "full_house_rule.png"),
}

TEXT_KEYS = {
    "03_主标题_满房_可编辑文字": "full_house_title",
    "04_英文标题_Full_House_可编辑文字": "full_house_english_title",
    "05_说明_感谢厚爱今日满房_可编辑文字": "full_house_note",
    "06_说明_期待下一次与您相遇_可编辑文字": "full_house_next_note",
}


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


def text_style(layer):
    style = layer.engine_dict["StyleRun"]["RunArray"][0]["StyleSheet"]["StyleSheetData"]
    values = style.get("FillColor", {}).get("Values", [1.0, 1.0, 1.0, 1.0])
    rgb = values[-3:]
    color = "#" + "".join(f"{round(max(0, min(1, channel)) * 255):02X}" for channel in rgb)
    font_name = str(layer.resource_dict.get("FontSet", [])[int(style.get("Font", 0))].get("Name", ""))
    if "NimbusRoman" in font_name:
        kind = "roman-italic"
        font_style = "italic"
    elif "Serif" in font_name:
        kind = "serif"
        font_style = "normal"
    else:
        kind = "sans"
        font_style = "normal"
    return {
        "fontSize": float(style.get("FontSize", 24)),
        "lineHeight": 1.2,
        "color": color,
        "font": int(style.get("Font", 0)),
        "fontName": font_name,
        "kind": kind,
        "fontStyle": font_style,
        "weight": 700 if style.get("FauxBold") else 400,
        "letterSpacing": f"{float(style.get('Tracking', 0)) / 1000:.3f}em",
    }


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(f"PSD not found: {SOURCE}")

    psd = PSDImage.open(SOURCE)
    width, height = psd.size
    if (width, height) != (1152, 2048):
        raise ValueError(f"Unexpected PSD canvas: {width} x {height}")

    OUTPUT.mkdir(parents=True, exist_ok=True)
    psd.composite().convert("RGB").save(OUTPUT / "preview.png", dpi=(72, 72), quality=95)

    assets = []
    text = []
    order = []
    z_index = 1
    for layer in leaves(psd):
        order.append(layer.name)
        box = percentage_box(layer.bbox, width, height)
        if isinstance(layer, TypeLayer):
            if layer.name not in TEXT_KEYS:
                raise KeyError(f"Unmapped type layer: {layer.name}")
            text.append(
                {
                    "key": TEXT_KEYS[layer.name],
                    "name": layer.name,
                    "value": layer.text.rstrip("\r"),
                    **box,
                    **text_style(layer),
                    "pointText": True,
                    "zIndex": z_index,
                    "bbox": list(layer.bbox),
                }
            )
        else:
            if layer.name not in ASSET_KEYS:
                raise KeyError(f"Unmapped pixel layer: {layer.name}")
            key, filename = ASSET_KEYS[layer.name]
            layer.composite().save(OUTPUT / filename, dpi=(72, 72))
            assets.append(
                {
                    "key": key,
                    "name": layer.name,
                    "src": f"./assets/psd-full-house-portrait/{filename}",
                    **box,
                    "zIndex": z_index,
                    "bbox": list(layer.bbox),
                    "size": list(layer.size),
                    "kind": layer.kind,
                }
            )
        z_index += 1

    expected = set(ASSET_KEYS) | set(TEXT_KEYS)
    actual = set(order)
    if actual != expected:
        raise ValueError(f"PSD layer mismatch: missing={expected - actual}, extra={actual - expected}")

    metadata = {
        "source": str(SOURCE),
        "width": width,
        "height": height,
        "dpi": 72,
        "topLevelOrder": [layer.name for layer in psd],
        "leafLayerOrder": order,
        "assets": assets,
        "text": text,
    }
    (OUTPUT / "metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (OUTPUT / "README.md").write_text(
        "# PSD｜满房海报（竖版）\n\n"
        f"来源：`{SOURCE}`\n\n"
        "- 原始画布：1152 × 2048 px，竖版 9:16\n"
        "- `preview.png`：原 PSD 合成预览，仅用于模板卡片参考\n"
        "- 2 个非文字图层逐层导出为 PNG，并保留原始边界与堆叠顺序\n"
        "- 4 个 Photoshop Type 图层在编辑器中以独立 HTML 文字呈现，可双击编辑\n"
        "- `metadata.json`：记录 PSD 图层顺序、像素边界和文字样式\n",
        encoding="utf-8",
    )
    print(f"Imported {len(assets)} bitmap layers and {len(text)} text layers into {OUTPUT}")


if __name__ == "__main__":
    main()
