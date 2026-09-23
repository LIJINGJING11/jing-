#!/usr/bin/env python3
"""Import TCL-Hotel-Dinner-Layered-72DPI.psd as strict web layers.

The source file is intentionally kept outside the app bundle.  Visible
non-text leaf layers are exported as independent PNGs in their original
stacking order, while Photoshop Type layers become editable HTML text specs.
The hidden clean-plate layer is recorded in metadata but is not rendered,
because the visible smart-object scene is the actual PSD background layer.
"""

from __future__ import annotations

import json
from pathlib import Path

from psd_tools import PSDImage
from psd_tools.api.layers import Group, TypeLayer


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("/Users/sigurd/Downloads/TCL-Hotel-Dinner-Layered-72DPI.psd")
OUTPUT = ROOT / "demo/assets/psd-dinner-portrait"

ASSET_KEYS = {
    "WechatIMG5619 1": ("dinner_scene", "dinner_scene.png"),
    "矩形 1": ("dinner_lower_panel", "dinner_lower_panel.png"),
    "背景_金边蒙层_透明": ("dinner_gold_frame", "dinner_gold_frame.png"),
    "05_装饰_副标题左线": ("dinner_subtitle_rule_left", "dinner_subtitle_rule_left.png"),
    "06_装饰_副标题右线": ("dinner_subtitle_rule_right", "dinner_subtitle_rule_right.png"),
    "07_LOGO_TCL": ("dinner_logo", "dinner_logo.png"),
    "09_图形_环境图标圆环": ("dinner_icon_ring_environment", "dinner_icon_ring_environment.png"),
    "10_图形_菜品图标圆环": ("dinner_icon_ring_dishes", "dinner_icon_ring_dishes.png"),
    "11_图形_品质图标圆环": ("dinner_icon_ring_quality", "dinner_icon_ring_quality.png"),
    "12_图标_环境雅致_沙发落地灯": ("dinner_icon_environment", "dinner_icon_environment.png"),
    "13_图标_菜品丰富_餐罩": ("dinner_icon_dishes", "dinner_icon_dishes.png"),
    "14_图标_品质优选_钻石": ("dinner_icon_quality", "dinner_icon_quality.png"),
    "15_分隔线_卖点左": ("dinner_feature_rule_left", "dinner_feature_rule_left.png"),
    "16_分隔线_卖点右": ("dinner_feature_rule_right", "dinner_feature_rule_right.png"),
    "20_边框_底部联系信息": ("dinner_contact_frame", "dinner_contact_frame.png"),
    "21_图形_电话圆环": ("dinner_phone_ring", "dinner_phone_ring.png"),
    "22_图形_定位圆环": ("dinner_location_ring", "dinner_location_ring.png"),
    "23_图标_电话": ("dinner_phone_icon", "dinner_phone_icon.png"),
    "24_图标_地址定位": ("dinner_location_icon", "dinner_location_icon.png"),
}

TEXT_KEYS = {
    "02_主标题_TCL酒店": "dinner_title_brand",
    "03_主标题_自助晚餐": "dinner_title_dinner",
    "04_副标题_品味精致_尊享美味": "dinner_subtitle",
    "17_卖点文字_环境雅致": "dinner_feature_environment",
    "18_卖点文字_菜品丰富": "dinner_feature_dishes",
    "19_卖点文字_品质优选": "dinner_feature_quality",
    "25_联系文字_预约热线": "dinner_contact_hotline_label",
    "26_联系文字_电话号码": "dinner_contact_hotline",
    "27_联系文字_地址标签": "dinner_contact_address_label",
    "28_联系文字_详细地址": "dinner_contact_address",
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
    font_set = layer.resource_dict.get("FontSet", [])
    font_index = int(style.get("Font", 0))
    font_name = str(font_set[font_index].get("Name", "") if font_set and font_index < len(font_set) else "")
    semi_bold = "SemiBold" in font_name or "Bold" in font_name
    kind = "serif" if "Serif" in font_name else "sans"
    return {
        "fontSize": float(style.get("FontSize", 24)),
        "lineHeight": 1.2,
        "color": color,
        "font": font_index,
        "fontName": font_name,
        "kind": kind,
        "fontStyle": "normal",
        "weight": 600 if semi_bold else 400,
        "letterSpacing": f"{float(style.get('Tracking', 0)) / 1000:.3f}em",
    }


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(f"PSD not found: {SOURCE}")

    psd = PSDImage.open(SOURCE)
    width, height = psd.size
    if (width, height) != (941, 1672):
        raise ValueError(f"Unexpected PSD canvas: {width} x {height}")

    OUTPUT.mkdir(parents=True, exist_ok=True)
    psd.composite().save(OUTPUT / "preview.png", dpi=(72, 72))

    assets = []
    text = []
    order = []
    hidden = []
    z_index = 1
    for layer in leaves(psd):
        order.append(layer.name)
        if not layer.visible:
            hidden.append(layer.name)
            continue
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
                raise KeyError(f"Unmapped visible layer: {layer.name}")
            key, filename = ASSET_KEYS[layer.name]
            layer.composite().save(OUTPUT / filename, dpi=(72, 72))
            assets.append(
                {
                    "key": key,
                    "name": layer.name,
                    "src": f"./assets/psd-dinner-portrait/{filename}",
                    **box,
                    "zIndex": z_index,
                    "bbox": list(layer.bbox),
                    "size": list(layer.size),
                    "kind": layer.kind,
                }
            )
        z_index += 1

    expected = set(ASSET_KEYS) | set(TEXT_KEYS) | set(hidden)
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
        "hiddenLayers": hidden,
        "assets": assets,
        "text": text,
    }
    (OUTPUT / "metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (OUTPUT / "README.md").write_text(
        "# PSD｜TCL酒店自助晚餐（竖版）\n\n"
        f"来源：`{SOURCE}`\n\n"
        "- 原始画布：941 × 1672 px，72 DPI（竖版约 9:16）\n"
        "- `preview.png`：原 PSD 合成预览，仅用于模板卡片参考\n"
        "- 19 个可见非文字图层逐层导出为 PNG，并保留原始边界与堆叠顺序\n"
        "- 10 个 Photoshop Type 图层在编辑器中以独立 HTML 文字呈现，可双击编辑\n"
        "- 隐藏的 `01_背景_餐厅无字修复图` 按 PSD 原状态保留在 metadata，不参与可见合成\n"
        "- `metadata.json`：记录 PSD 图层顺序、像素边界和文字样式\n",
        encoding="utf-8",
    )
    print(f"Imported {len(assets)} bitmap layers and {len(text)} text layers into {OUTPUT}")


if __name__ == "__main__":
    main()
