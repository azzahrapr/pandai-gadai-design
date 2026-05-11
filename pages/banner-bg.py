"""
Banner background pattern — Pandai Gadai
343×102px @2x (686×204px output)
Subtle geometric texture on a soft blue-white gradient base
"""

from PIL import Image, ImageDraw
import numpy as np
import math
import os

SCALE   = 2
W, H    = 343 * SCALE, 102 * SCALE
OUT     = os.path.join(os.path.dirname(os.path.abspath(__file__)), "banner-bg.png")

# ── Palette ──────────────────────────────────────────────────────────────────
WHITE    = (255, 255, 255)
BLUE_50  = (229, 242, 255)   # #E5F2FF
BLUE_100 = (207, 231, 255)   # #CFE7FF
BLUE_200 = (168, 207, 255)   # #A8CFFF
BLUE_300 = (115, 174, 255)   # #73AEFF

# ── Layer 1: Soft directional gradient base ───────────────────────────────────
y_arr, x_arr = np.mgrid[0:H, 0:W].astype(np.float32)

# Diagonal gradient: top-left (white) → bottom-right (blue/50)
diag_t = np.clip((x_arr / W) * 0.55 + (y_arr / H) * 0.45, 0.0, 1.0)
diag_t = diag_t ** 1.4   # ease-in so most of the canvas stays near white

r_ch = np.clip(255 - diag_t * (255 - BLUE_50[0]), 0, 255).astype(np.uint8)
g_ch = np.clip(255 - diag_t * (255 - BLUE_50[1]), 0, 255).astype(np.uint8)
b_ch = np.full((H, W), 255, dtype=np.uint8)
a_ch = np.full((H, W), 255, dtype=np.uint8)

canvas = Image.fromarray(np.stack([r_ch, g_ch, b_ch, a_ch], axis=2), "RGBA")

# ── Layer 2: Soft corner accent circle (top-right) ────────────────────────────
accent = Image.new("RGBA", (W, H), (0, 0, 0, 0))
a_draw = ImageDraw.Draw(accent)

# Large faint circle bleeding off the top-right corner
circle_r = int(88 * SCALE)
cx, cy = W - int(18 * SCALE), int(-8 * SCALE)
a_draw.ellipse(
    [cx - circle_r, cy - circle_r, cx + circle_r, cy + circle_r],
    fill=(*BLUE_100, 55)
)

# Smaller second circle, slightly lower
r2 = int(52 * SCALE)
cx2, cy2 = W - int(12 * SCALE), int(54 * SCALE)
a_draw.ellipse(
    [cx2 - r2, cy2 - r2, cx2 + r2, cy2 + r2],
    fill=(*BLUE_200, 32)
)

# ── Layer 3: Dot grid texture ─────────────────────────────────────────────────
dots = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d_draw = ImageDraw.Draw(dots)

DOT_SPACING = int(14 * SCALE)
DOT_R       = int(1.1 * SCALE)

for col in range(0, W // DOT_SPACING + 2):
    for row in range(0, H // DOT_SPACING + 2):
        # Stagger every other column
        row_off = DOT_SPACING // 2 if col % 2 else 0
        dx = col * DOT_SPACING
        dy = row * DOT_SPACING + row_off

        # Fade dots out near the right edge (where accent circle is)
        edge_fade = 1.0 - max(0.0, (dx - W * 0.62) / (W * 0.38))
        if edge_fade <= 0:
            continue

        # Also fade with distance from top-left to keep right side clean
        base_alpha = int(22 * edge_fade)
        if base_alpha < 4:
            continue

        d_draw.ellipse(
            [dx - DOT_R, dy - DOT_R, dx + DOT_R, dy + DOT_R],
            fill=(*BLUE_200, base_alpha)
        )

# ── Layer 4: Subtle diagonal line texture ─────────────────────────────────────
lines = Image.new("RGBA", (W, H), (0, 0, 0, 0))
l_draw = ImageDraw.Draw(lines)

STRIPE_STEP = int(22 * SCALE)
for i in range(-H // STRIPE_STEP, (W + H) // STRIPE_STEP + 1):
    x0 = i * STRIPE_STEP
    # Diagonal from top-left to bottom-right (45°)
    l_draw.line([(x0, 0), (x0 + H, H)], fill=(*BLUE_100, 12), width=max(1, SCALE - 1))

# ── Composite ─────────────────────────────────────────────────────────────────
canvas = Image.alpha_composite(canvas, accent)
canvas = Image.alpha_composite(canvas, lines)
canvas = Image.alpha_composite(canvas, dots)
canvas.convert("RGB").save(OUT, "PNG", dpi=(144, 144))
print(f"✓  {OUT}  ({W}×{H}px @2x)")
