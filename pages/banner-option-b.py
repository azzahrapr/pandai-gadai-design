"""
Option B: Radial Arc Burst
Concentric arcs radiating from the bottom-left — directional, modern
686×204px @2x
"""
from PIL import Image, ImageDraw
import numpy as np, os

SCALE = 2
W, H = 343 * SCALE, 102 * SCALE
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "banner-option-b.png")

# Base: clean white to very faint blue gradient
y_arr, x_arr = np.mgrid[0:H, 0:W].astype(np.float32)
t = np.clip((x_arr / W) * 0.4 + (1 - y_arr / H) * 0.2, 0, 1) ** 1.6
BLUE_50 = (229, 242, 255)
r = (255 - t * (255 - BLUE_50[0])).astype(np.uint8)
g = (255 - t * (255 - BLUE_50[1])).astype(np.uint8)
b = np.full((H, W), 255, dtype=np.uint8)
a = np.full((H, W), 255, dtype=np.uint8)
canvas = Image.fromarray(np.stack([r, g, b, a], axis=2), "RGBA")

arcs = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(arcs)

# Origin: bottom-left corner
OX, OY = int(-10 * SCALE), int(H + 8 * SCALE)

BLUE_200 = (168, 207, 255)
BLUE_300 = (115, 174, 255)
BLUE_400 = (61, 122, 255)

# 8 concentric arcs, spacing 28px @2x, fading outward
radii    = [r * SCALE for r in [28, 56, 85, 115, 148, 182, 220, 262]]
colors   = [BLUE_400, BLUE_300, BLUE_300, BLUE_200, BLUE_200, BLUE_200, BLUE_200, BLUE_200]
alphas   = [70, 55, 45, 36, 28, 22, 16, 11]
widths   = [max(1, int(1.5 * SCALE)), max(1, int(1.2 * SCALE))] + [max(1, SCALE)] * 6

for radius, color, alpha, width in zip(radii, colors, alphas, widths):
    box = [OX - radius, OY - radius, OX + radius, OY + radius]
    d.arc(box, start=270, end=360, fill=(*color, alpha), width=width)

canvas = Image.alpha_composite(canvas, arcs)
canvas.convert("RGB").save(OUT, "PNG", dpi=(144, 144))
print(f"✓ {OUT}")
