#!/usr/bin/env python3
"""Prepare the Hobbies photo wall from a folder of JPEG/PNG photographs.

For every photo this script
  1. re-encodes it with ffmpeg (which drops EXIF/GPS and other metadata),
     capped at 1440 px on the long edge, into assets/media/gallery/;
  2. measures its colour: a saturation-weighted mean hue, mean brightness
     and the average colour (used as the tile's placeholder);
  3. orders all photos around the colour wheel so the wall reads as one
     continuous gradient that also wraps around, since the wall loops;
  4. deals them into rows of near-equal length, keeping that order, and
     writes data/gallery.yaml.

Usage:  python3 scripts/build_gallery.py <source-folder> [--rows 3]
Needs ffmpeg and ffprobe on PATH. Re-running replaces the gallery.
"""
import argparse
import colorsys
import json
import math
import pathlib
import shutil
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "assets" / "media" / "gallery"
DATA_FILE = ROOT / "data" / "gallery.yaml"
LONG_EDGE = 1440
SAMPLE = 48

# Where on the wheel the wall starts (degrees). Dark photos are parked at
# NIGHT so night scenes sit between the blues and the warm reds.
START = 10.0
NIGHT = 285.0


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height", "-of", "json", str(path)],
        check=True, capture_output=True, text=True).stdout
    stream = json.loads(out)["streams"][0]
    return stream["width"], stream["height"]


def sample_pixels(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-vf",
         f"scale={SAMPLE}:{SAMPLE}:flags=area", "-f", "rawvideo",
         "-pix_fmt", "rgb24", "pipe:"],
        check=True, capture_output=True).stdout
    return [tuple(raw[i:i + 3]) for i in range(0, len(raw), 3)]


BINS = 36


def measure(pixels):
    """Dominant hue (the strongest band of a saturation-weighted hue
    histogram, refined by the mean inside that band), overall colourfulness,
    mean brightness and the average colour."""
    bins = [[0.0, 0.0, 0.0] for _ in range(BINS)]  # weight, cos, sin
    total = 0.0
    value_sum = 0.0
    r_sum = g_sum = b_sum = 0
    for r, g, b in pixels:
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        w = s * v
        k = int(h * BINS) % BINS
        bins[k][0] += w
        bins[k][1] += math.cos(2 * math.pi * h) * w
        bins[k][2] += math.sin(2 * math.pi * h) * w
        total += w
        value_sum += v
        r_sum, g_sum, b_sum = r_sum + r, g_sum + g, b_sum + b
    n = len(pixels)
    # Smooth over neighbouring bands so one sharp band does not win alone.
    smoothed = [sum(bins[(k + d) % BINS][0] for d in (-1, 0, 1)) for k in range(BINS)]
    peak = max(range(BINS), key=lambda k: smoothed[k])
    cx = sum(bins[(peak + d) % BINS][1] for d in (-1, 0, 1))
    cy = sum(bins[(peak + d) % BINS][2] for d in (-1, 0, 1))
    hue = (math.degrees(math.atan2(cy, cx)) + 360) % 360
    chroma = total / n
    value = value_sum / n
    avg = "#{:02x}{:02x}{:02x}".format(r_sum // n, g_sum // n, b_sum // n)
    return hue, chroma, value, avg


def wheel_position(hue, chroma, value):
    if value < 0.30:
        # Night: after the blues, darkest last, so the wall fades to night
        # and then wraps back to the warm end.
        return NIGHT + (0.30 - value) * 60
    if chroma < 0.06:
        # Nearly grey: overcast sea and dusk sky, between blue and night.
        return 255.0 + (1 - value) * 20
    if 180 <= hue < 262:
        # Blues run from bright daytime sky toward dusk.
        return 180 + (hue - 180) * 0.5 + (1 - value) * 40
    return hue


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source")
    parser.add_argument("--rows", type=int, default=3)
    args = parser.parse_args()

    sources = sorted(p for p in pathlib.Path(args.source).expanduser().iterdir()
                     if p.suffix.lower() in {".jpg", ".jpeg", ".png"})
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True)

    photos = []
    for index, src in enumerate(sources, 1):
        name = f"photo-{index:03d}.jpg"
        dest = OUT_DIR / name
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", str(src),
             "-vf", f"scale='min({LONG_EDGE},iw)':'min({LONG_EDGE},ih)':force_original_aspect_ratio=decrease",
             "-map_metadata", "-1", "-q:v", "5", str(dest)],
            check=True)
        width, height = probe(dest)
        hue, chroma, value, avg = measure(sample_pixels(dest))
        photos.append({
            "file": name, "width": width, "height": height, "color": avg,
            "position": wheel_position(hue, chroma, value),
        })

    photos.sort(key=lambda p: (p["position"] - START) % 360)

    rows = [[] for _ in range(args.rows)]
    lengths = [0.0] * args.rows
    for photo in photos:
        target = min(range(args.rows), key=lambda i: lengths[i])
        rows[target].append(photo)
        lengths[target] += photo["width"] / photo["height"]

    lines = ["# Generated by scripts/build_gallery.py. Optional per-photo key:",
             "# alt (a short description shown in the viewer). Re-running the",
             "# script rewrites this file.",
             "rows:"]
    for row, length in zip(rows, lengths):
        lines.append(f"  - units: {length:.2f}")
        lines.append("    photos:")
        for p in row:
            lines.append(f"      - file: {p['file']}")
            lines.append(f"        width: {p['width']}")
            lines.append(f"        height: {p['height']}")
            lines.append(f"        color: \"{p['color']}\"")
    DATA_FILE.write_text("\n".join(lines) + "\n")
    print(f"{len(photos)} photos, row lengths " +
          ", ".join(f"{x:.1f}" for x in lengths))


if __name__ == "__main__":
    main()
