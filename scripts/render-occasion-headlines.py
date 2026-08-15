#!/usr/bin/env python3
"""Render occasion headline PNGs with the Wibe Stories email headline font.

Reads a JSON manifest [{ "id": "...", "name": "..." }, ...] and writes one
960x240 PNG (2x for retina) per occasion into the output dir: cream #FFFFEB
canvas, ink #1A1A1A name as stored (sentence case, no ALL-CAPS), Dela Gothic
One, sized to fit (72px for <= 2 lines, smaller if it wraps to 3; fails
loudly if a name needs 4+ lines).
Images are then uploaded to ImageKit by scripts/generate-occasion-headlines.mjs.

Usage: python scripts/render-occasion-headlines.py <manifest.json> <outdir>
"""

import json
import sys
from PIL import Image, ImageDraw, ImageFont

CANVAS_W, CANVAS_H = 960, 240
CREAM = (255, 255, 235)
INK = (26, 26, 26)
FONT_PATH = r"assets\brand\fonts\DelaGothicOne-Regular.ttf"
MAX_TEXT_W = CANVAS_W - 40  # 20px padding each side


def wrap(text, font, draw):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= MAX_TEXT_W or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def render(item, out_path):
    name = item["name"]
    explicit = item.get("lines")
    lines = None
    size = 72
    for size in (72, 60, 52):
        font = ImageFont.truetype(FONT_PATH, size)
        d = ImageDraw.Draw(Image.new("RGB", (1, 1)))
        if explicit:
            if all(d.textlength(ln, font=font) <= MAX_TEXT_W for ln in explicit):
                lines = explicit
                break
        else:
            lines = wrap(name, font, d)
            if len(lines) <= 2:
                break
    if lines is None:
        raise RuntimeError(
            f"'{name}' explicit lines {explicit!r} don't fit at 52px "
            f"(max width {MAX_TEXT_W}) - split differently or grow the canvas"
        )
    if len(lines) > 3:
        raise RuntimeError(
            f"'{name}' wraps to {len(lines)} lines even at {size}px "
            f"(max supported: 3) - shorten the name or grow the canvas"
        )
    img = Image.new("RGB", (CANVAS_W, CANVAS_H), CREAM)
    d = ImageDraw.Draw(img)
    line_h = max(font.getbbox("Hg")[3] + 4, int(size * 1.2))
    total_h = len(lines) * line_h
    y = (CANVAS_H - total_h) // 2
    for ln in lines:
        w = d.textlength(ln, font=font)
        d.text(((CANVAS_W - w) / 2, y), ln, font=font, fill=INK)
        y += line_h
    img.save(out_path, "PNG")
    return len(lines), size


def main():
    manifest_path, outdir = sys.argv[1], sys.argv[2]
    with open(manifest_path, encoding="utf-8") as f:
        items = json.load(f)
    for item in items:
        out = f"{outdir}/{item['id']}.png"
        lines, size = render(item, out)
        print(f"  + {item['id']}.png ({item['name']!r}) lines={lines} fs={size}")


if __name__ == "__main__":
    main()