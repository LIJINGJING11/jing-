#!/usr/bin/env python3
"""Import the supplied 1920×1080 hospitality PSDs as strict independent layers."""

from __future__ import annotations

import json
from pathlib import Path

from psd_tools import PSDImage
from psd_tools.api.layers import Group, TypeLayer


ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "psd-breakfast-time-landscape": {
        "source": Path("/Users/sigurd/Downloads/早餐时光_1920x1080_72DPI.psd"),
        "folder": "psd-breakfast-time-landscape",
        "prefix": "breakfast",
        "assets": {
            "图层 0": ("breakfast_background", "breakfast_background.png"),
            "早餐信息底框_原图比例复刻_透明外部": ("breakfast_info_panel", "breakfast_info_panel.png"),
            "DEC_02_顶部花纹_ALPHA": ("breakfast_top_ornament", "breakfast_top_ornament.png"),
            "DEC_03_标题分隔线_ALPHA": ("breakfast_divider", "breakfast_divider.png"),
            "植物叶子_原图五叶复刻_透明底 (1)": ("breakfast_leaf_decor", "breakfast_leaf_decor.png"),
            "ICON_01_供应时间_ALPHA": ("breakfast_icon_time", "breakfast_icon_time.png"),
            "ICON_02_用餐地点_ALPHA": ("breakfast_icon_location", "breakfast_icon_location.png"),
            "ICON_03_房卡用餐_ALPHA": ("breakfast_icon_card", "breakfast_icon_card.png"),
        },
        "texts": {
            "TXT_01_主标题_可编辑": "breakfast_title",
            "TXT_02_副标题_可编辑": "breakfast_subtitle",
            "TXT_03_供应时间_可编辑": "breakfast_time",
            "TXT_04_用餐地点_可编辑": "breakfast_location",
            "TXT_05_房卡提示_可编辑": "breakfast_card_note",
        },
    },
    "psd-room-service-landscape": {
        "source": Path("/Users/sigurd/Downloads/客房服务_1920x1080_72DPI.psd"),
        "folder": "psd-room-service-landscape",
        "prefix": "room_service",
        "assets": {
            "BG_01_客房实景_独立底层": ("room_service_background", "room_service_background.png"),
            "UI_01_右侧弧形米白面板_ALPHA": ("room_service_panel", "room_service_panel.png"),
            "LOGO_01_右上品牌占位标_ALPHA": ("room_service_logo_placeholder", "room_service_logo_placeholder.png"),
            "DEC_01_标题分隔线_ALPHA": ("room_service_divider", "room_service_divider.png"),
            "DEC_02_服务竖分隔线1_ALPHA": ("room_service_divider_service_1", "room_service_divider_service_1.png"),
            "DEC_03_服务竖分隔线2_ALPHA": ("room_service_divider_service_2", "room_service_divider_service_2.png"),
            "送物服务图标_原图提取_透明底": ("room_service_icon_delivery", "room_service_icon_delivery.png"),
            "前台服务图标_原图提取_透明底": ("room_service_icon_frontdesk", "room_service_icon_frontdesk.png"),
            "客房清洁图标_原图提取_透明底": ("room_service_icon_cleaning", "room_service_icon_cleaning.png"),
        },
        "texts": {
            "TXT_01_主标题_可编辑": "room_service_title",
            "TXT_02_副标题_可编辑": "room_service_subtitle",
            "TXT_03_客房清洁_可编辑": "room_service_cleaning",
            "TXT_04_前台电话_可编辑": "room_service_frontdesk",
            "TXT_05_送物服务_可编辑": "room_service_delivery",
        },
    },
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
    try:
        style = layer.engine_dict["StyleRun"]["RunArray"][0]["StyleSheet"]["StyleSheetData"]
    except Exception:
        style = {}
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
        "pointText": True,
    }


def import_one(config):
    source = config["source"]
    if not source.exists():
        raise FileNotFoundError(source)
    psd = PSDImage.open(source)
    width, height = psd.size
    if (width, height) != (1920, 1080):
        raise ValueError(f"Unexpected PSD canvas for {source.name}: {width} × {height}")
    output = ROOT / "demo/assets" / config["folder"]
    output.mkdir(parents=True, exist_ok=True)
    psd.composite().convert("RGB").save(output / "preview.png", dpi=(72, 72), quality=95)
    assets, text, order = [], [], []
    for index, layer in enumerate(leaves(psd), 1):
        order.append(layer.name)
        box = percentage_box(layer.bbox, width, height)
        if isinstance(layer, TypeLayer):
            key = config["texts"].get(layer.name)
            if not key:
                raise KeyError(f"Unmapped type layer in {source.name}: {layer.name}")
            text.append({"key": key, "name": layer.name, "value": layer.text.rstrip("\r"), **box, **text_style(layer), "zIndex": index, "bbox": list(layer.bbox)})
        else:
            mapped = config["assets"].get(layer.name)
            if not mapped:
                raise KeyError(f"Unmapped bitmap layer in {source.name}: {layer.name}")
            key, filename = mapped
            layer.composite().save(output / filename, dpi=(72, 72))
            assets.append({"key": key, "name": layer.name, "src": f"./assets/{config['folder']}/{filename}", **box, "zIndex": index, "bbox": list(layer.bbox), "size": list(layer.size), "kind": layer.kind})
    expected = set(config["assets"]) | set(config["texts"])
    if set(order) != expected:
        raise ValueError(f"PSD layer mismatch for {source.name}: missing={expected-set(order)}, extra={set(order)-expected}")
    metadata = {"source": str(source), "width": width, "height": height, "dpi": 72, "topLevelOrder": [layer.name for layer in psd], "leafLayerOrder": order, "assets": assets, "text": text}
    (output / "metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (output / "README.md").write_text(f"# {source.stem}（横版）\n\n来源：`{source}`\n\n- 原始画布：1920 × 1080 px，72 DPI\n- 预览和每个非文字叶子图层均独立保存；Photoshop Type 图层映射为可编辑文字。\n- `metadata.json` 记录原始叶子图层顺序、边界和样式。\n", encoding="utf-8")
    return output, metadata


if __name__ == "__main__":
    for config in SOURCES.values():
        output, metadata = import_one(config)
        print(f"Imported {len(metadata['assets'])} bitmap and {len(metadata['text'])} text layers into {output}")
