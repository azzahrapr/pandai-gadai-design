"""
Option C: Blueprint Micro-grid
Fine orthogonal + diagonal crosshatch grid — architectural, minimal
686×204px @2x
"""
from PIL import Image, ImageDraw
import numpy as np, os

SCALE = 2
W, H = 343 * SCALE, 102 * SCALE
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "banner-option-c.png")

# Base: pure white
canvas = Image.new("RGBA", (W, H), (255, 255, 255, 255))

BLUE_300 = (115, 174, 255)
BLUE_200 = (168, 207, 255)
BLUE_400 = (61, 122, 255)

grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
g = ImageDraw.Draw(grid)

MINOR = int(8 * SCALE)   # minor grid every 8px
MAJOR = int(40 * SCALE)  # major grid every 40px

# Minor grid lines — very faint
for x in range(0, W, MINOR):
    g.line([(x, 0), (x, H)], fill=(*BLUE_200, 18), width=1)
for y in range(0, H, MINOR):
    g.line([(0, y), (W, y)], fill=(*BLUE_200, 18), width=1)

# Major grid lines — slightly more visible
for x in range(0, W, MAJOR):
    g.line([(x, 0), (x, H)], fill=(*BLUE_300, 32), width=max(1, SCALE - 1))
for y in range(0, H, MAJOR):
    g.line([(0, y), (W, y)], fill=(*BLUE_300, 32), width=max(1, SCALE - 1))

# Intersection dots at major crossings — tiny accent
DOT_R = max(1, int(1.4 * SCALE))
for x in range(0, W, MAJOR):
    for y in range(0, H, MAJOR):
        g.ellipse([x - DOT_R, y - DOT_R, x + DOT_R, y + DOT_R],
                  fill=(*BLUE_400, 55))

# Subtle diagonal hatching in one corner — adds life
DIAG_STEP = int(12 * SCALE)
for i in range(-H // DIAG_STEP, (W // 3) // DIAG_STEP + 2):
    x0 = i * DIAG_STEP
    g.line([(x0, 0), (x0 + H // 2, H // 2)], fill=(*BLUE_200, 12), width=1)

canvas = Image.alpha_composite(canvas, grid)
canvas.convert("RGB").save(OUT, "PNG", dpi=(144, 144))
print(f"✓ {OUT}")
