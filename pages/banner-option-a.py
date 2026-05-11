"""
Option A: Aurora Mesh
Soft overlapping color blobs — 2025 mesh gradient trend
686×204px @2x
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np, os

SCALE = 2
W, H = 343 * SCALE, 102 * SCALE
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "banner-option-a.png")

# Base: very light cool white
base = np.ones((H, W, 4), dtype=np.uint8) * 255
base[:, :, :3] = [248, 251, 255]
canvas = Image.fromarray(base, "RGBA")

def add_blob(img, cx, cy, rx, ry, color, alpha):
    blob = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(blob)
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(*color, alpha))
    blob = blob.filter(ImageFilter.GaussianBlur(radius=int(min(rx, ry) * 0.6)))
    return Image.alpha_composite(img, blob)

# Blob palette — brand blue family + teal accent
BLUE_300 = (115, 174, 255)
BLUE_200 = (168, 207, 255)
BLUE_400 = (61, 122, 255)
TEAL     = (100, 210, 230)
PURPLE   = (160, 130, 255)

blobs = [
    # (cx,   cy,    rx,   ry,   color,    alpha)
    (int(W*0.82), int(H*0.25), int(W*0.28), int(H*0.90), BLUE_200,  90),
    (int(W*0.95), int(H*0.70), int(W*0.20), int(H*0.65), TEAL,      55),
    (int(W*0.70), int(H*0.80), int(W*0.22), int(H*0.55), BLUE_300,  60),
    (int(W*0.10), int(H*0.20), int(W*0.18), int(H*0.70), PURPLE,    30),
    (int(W*0.05), int(H*0.75), int(W*0.14), int(H*0.40), BLUE_200,  45),
]

for cx, cy, rx, ry, color, alpha in blobs:
    canvas = add_blob(canvas, cx, cy, rx, ry, color, alpha)

canvas.convert("RGB").save(OUT, "PNG", dpi=(144, 144))
print(f"✓ {OUT}")
