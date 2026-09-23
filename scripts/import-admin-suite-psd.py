#!/usr/bin/env python3
"""Import the administrative-suite PSD as strict, independent web layers."""

from __future__ import annotations

import json
from pathlib import Path

from psd_tools import PSDImage
from psd_tools.api.layers import Group, TypeLayer


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("/Users/sigurd/Downloads/行政景观套房_严格分层_1920x1080_72DPI.psd")
OUTPUT = ROOT / "demo/assets/psd-admin-suite-landscape"

ASSET_KEYS = {
    "BG_01_酒店套房实景_独立底层": ("admin_suite_background", "admin_suite_background.png"),
    "UI_01_左侧深色半透明面板": ("admin_suite_panel", "admin_suite_panel.png"),
    "LOGO_01_品牌占位标_ALPHA": ("admin_suite_logo_placeholder", "admin_suite_logo_placeholder.png"),
    "DEC_02_标题分隔线_ALPHA": ("admin_suite_divider", "admin_suite_divider.png"),
    "ICON_01_面积_ALPHA": ("admin_suite_icon_area", "admin_suite_icon_area.png"),
    "ICON_02_独立客厅_ALPHA": ("admin_suite_icon_living", "admin_suite_icon_living.png"),
    "ICON_03_全景落地窗_ALPHA": ("admin_suite_icon_window", "admin_suite_icon_window.png"),
    "ICON_04_行政礼遇_ALPHA": ("admin_suite_icon_benefits", "admin_suite_icon_benefits.png"),
    "ICON_05_欢迎水果_ALPHA": ("admin_suite_icon_fruit", "admin_suite_icon_fruit.png"),
}

TEXT_KEYS = {
    "TXT_01_主标题_可编辑": "admin_suite_title",
    "TXT_02_副标题_可编辑": "admin_suite_subtitle",
    "TXT_03_面积_可编辑": "admin_suite_area",
    "TXT_04_独立客厅_可编辑": "admin_suite_living",
    "TXT_05_全景落地窗_可编辑": "admin_suite_window",
    "TXT_06_行政礼遇_可编辑": "admin_suite_benefits",
    "TXT_07_欢迎水果_可编辑": "admin_suite_fruit",
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
    return {
        "fontSize": float(style.get("FontSize", 24)),
        "lineHeight": 1.2,
        "color": color,
        "font": int(style.get("Font", 0)),
        "kind": "source-han-sans",
        "weight": 700 if style.get("FauxBold") else 500,
        "letterSpacing": "0",
    }


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(f"PSD not found: {SOURCE}")

    psd = PSDImage.open(SOURCE)
    width, height = psd.size
    if (width, height) != (1920, 1080):
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
                    "src": f"./assets/psd-admin-suite-landscape/{filename}",
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

    groups = [
        {"name": layer.name, "children": [child.name for child in layer]}
        for layer in psd
        if isinstance(layer, Group)
    ]
    metadata = {
        "source": str(SOURCE),
        "width": width,
        "height": height,
        "dpi": 72,
        "topLevelOrder": [layer.name for layer in psd],
        "leafLayerOrder": order,
        "groups": groups,
        "assets": assets,
        "text": text,
    }
    (OUTPUT / "metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (OUTPUT / "README.md").write_text(
        "# PSD｜行政景观套房（横版）\n\n"
        f"来源：`{SOURCE}`\n\n"
        "- 原始画布：1920 × 1080 px，72 DPI（横版 16:9）\n"
        "- `preview.png`：原 PSD 合成预览，仅用于模板卡片参考\n"
        "- 9 个像素图层逐层导出为透明 PNG，并保留原始边界与堆叠顺序\n"
        "- 7 个 Photoshop Type 图层在编辑器中以独立 HTML 文字呈现，可双击编辑\n"
        "- `metadata.json`：记录 PSD 顶层、分组、叶子图层、像素边界、顺序和文字样式\n",
        encoding="utf-8",
    )

    print(f"Imported {len(assets)} bitmap layers and {len(text)} text layers into {OUTPUT}")


if __name__ == "__main__":
    main()
