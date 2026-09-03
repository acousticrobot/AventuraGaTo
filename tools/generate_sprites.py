#!/usr/bin/env python3
"""
Generates the 16x16 placeholder pixel-art sprite sheets for the prototype:
  assets/sprites/player.png   - 4 cols x 6 rows (walk down/up/side, attack down/up/side)
  assets/sprites/slime.png    - 4 cols x 1 row  (non-directional squish/wobble)
  assets/sprites/octorok.png  - 4 cols x 3 rows (walk down/up/side)

This is a one-time art generator, not part of the game itself. It exists so
the animation system has real, on-brand placeholder art to work with before
hand-drawn sprites replace it. Frames are built from simple blocky shapes
(no anti-aliasing) in the same style as the original generated-block sprites,
just now with a recognizable silhouette, a facing direction, and motion.

Run: python3 tools/generate_sprites.py
"""

import os
from PIL import Image

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "sprites")
PREVIEW_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "sprites", "_preview")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(PREVIEW_DIR, exist_ok=True)

FRAME = 16
TRANSPARENT = (0, 0, 0, 0)


def hex_to_rgba(h, alpha=255):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), alpha)


# ---------------------------------------------------------------------------
# Palettes (kept close to the existing spriteConfig.js colors)
# ---------------------------------------------------------------------------
PLAYER_PALETTE = {
    "skin": hex_to_rgba("f1c27d"),
    "hair": hex_to_rgba("5b3a29"),
    "tunic": hex_to_rgba("3fa7d6"),
    "pants": hex_to_rgba("1c2833"),
    "blade": hex_to_rgba("ffffff"),
    "hilt": hex_to_rgba("8a5a2b"),
    "eye": hex_to_rgba("1c2833"),
}
SLIME_PALETTE = {
    "body": hex_to_rgba("aa3355"),
    "shade": hex_to_rgba("4a1020"),
    "eye": hex_to_rgba("2b0a12"),
}
OCTOROK_PALETTE = {
    "body": hex_to_rgba("dd8822"),
    "shade": hex_to_rgba("5c3a0c"),
    "eye": hex_to_rgba("2b1a05"),
}


def new_frame():
    return Image.new("RGBA", (FRAME, FRAME), TRANSPARENT)


def rect(img, x0, y0, x1, y1, color):
    """Inclusive pixel rectangle."""
    px = img.load()
    for y in range(y0, y1 + 1):
        if y < 0 or y >= FRAME:
            continue
        for x in range(x0, x1 + 1):
            if x < 0 or x >= FRAME:
                continue
            px[x, y] = color


def px(img, x, y, color):
    if 0 <= x < FRAME and 0 <= y < FRAME:
        img.load()[x, y] = color


# ---------------------------------------------------------------------------
# PLAYER — parametric little "puppet": head, torso, two arms, two legs.
# direction: "down" | "up" | "side" (side always drawn facing right)
# walk_phase: 0-3 (used when action == "walk")
# action: "walk" | "attack"
# attack_phase: 0-3 (used when action == "attack")
# ---------------------------------------------------------------------------
def draw_player_frame(direction, action, phase):
    img = new_frame()
    p = PLAYER_PALETTE

    head_y0, head_y1 = 1, 5
    torso_y0, torso_y1 = 6, 10
    legs_y0, legs_y1 = 11, 15  # legs always start attached to the torso's bottom

    # --- Head ---
    rect(img, 5, head_y0, 10, head_y1, p["skin"])
    # rounded corners
    px(img, 5, head_y0, TRANSPARENT); px(img, 10, head_y0, TRANSPARENT)
    px(img, 5, head_y1, TRANSPARENT); px(img, 10, head_y1, TRANSPARENT)
    # hair/bangs strip along the top of the head
    rect(img, 5, head_y0, 10, head_y0, p["hair"])
    px(img, 5, head_y0, TRANSPARENT); px(img, 10, head_y0, TRANSPARENT)

    if direction == "down":
        px(img, 6, head_y0 + 2, p["eye"])
        px(img, 9, head_y0 + 2, p["eye"])
    elif direction == "up":
        # back of head: solid hair, no face
        rect(img, 5, head_y0 + 1, 10, head_y1, p["hair"])
    elif direction == "side":
        px(img, 9, head_y0 + 2, p["eye"])
        px(img, 11, head_y0 + 2, p["skin"])  # tiny nose bump

    # --- Torso (tunic) ---
    rect(img, 4, torso_y0, 11, torso_y1, p["tunic"])
    rect(img, 4, torso_y1, 11, torso_y1, p["pants"])  # belt line

    # --- Arms (skin nubs at rest; overridden below during attacks) ---
    left_arm_x, right_arm_x = 3, 12
    if not (action == "attack" and direction in ("down", "up", "side")):
        rect(img, left_arm_x, torso_y0 + 1, left_arm_x, torso_y0 + 3, p["skin"])
        if direction != "side":
            rect(img, right_arm_x, torso_y0 + 1, right_arm_x, torso_y0 + 3, p["skin"])

    # --- Legs ---
    # Both legs are always attached to the torso at legs_y0; a "stepping" leg
    # is simply drawn shorter (foot lifted off the ground), never shifted
    # upward as a whole block, so there's never a gap between torso and leg.
    left_leg = (4, 6)
    right_leg = (9, 11)
    lift = 2

    left_bottom = legs_y1 - lift if (action == "walk" and phase == 1) else legs_y1
    right_bottom = legs_y1 - lift if (action == "walk" and phase == 3) else legs_y1
    rect(img, left_leg[0], legs_y0, left_leg[1], left_bottom, p["pants"])
    rect(img, right_leg[0], legs_y0, right_leg[1], right_bottom, p["pants"])

    # --- Sword swing (attack only) ---
    if action == "attack":
        draw_sword(img, direction, phase, torso_y0)

    return img


def draw_sword(img, direction, phase, torso_y0):
    p = PLAYER_PALETTE
    blade, hilt, skin, outline = p["blade"], p["hilt"], p["skin"], p["pants"]

    def outlined_blade(x0, y0, x1, y1):
        # a dark 1px halo so the bright blade always pops against any
        # background, then the bright fill on top
        rect(img, x0 - 1, y0 - 1, x1 + 1, y1 + 1, outline)
        rect(img, x0, y0, x1, y1, blade)

    if direction == "down":
        arm_x = 12
        if phase == 0:      # windup: arm up near shoulder, blade cocked back
            rect(img, arm_x, torso_y0 - 1, arm_x + 1, torso_y0 + 1, skin)
            outlined_blade(arm_x + 2, torso_y0 - 3, arm_x + 3, torso_y0 - 1)
        elif phase == 1:    # strike: blade swings down past the feet
            rect(img, arm_x, torso_y0 + 2, arm_x + 1, torso_y0 + 4, skin)
            px(img, arm_x, torso_y0 + 1, hilt)
            outlined_blade(arm_x, 11, arm_x + 1, 15)
        elif phase == 2:    # follow-through: blade sweeps across the front
            rect(img, 2, torso_y0 + 3, 3, torso_y0 + 4, skin)
            outlined_blade(4, 13, 11, 14)
        else:               # recover
            rect(img, arm_x, torso_y0 + 1, arm_x + 1, torso_y0 + 3, skin)
            outlined_blade(arm_x, 11, arm_x + 1, 12)

    elif direction == "up":
        arm_x = 12
        if phase == 0:
            rect(img, arm_x, torso_y0 + 2, arm_x + 1, torso_y0 + 4, skin)
            outlined_blade(arm_x + 2, torso_y0 + 3, arm_x + 3, torso_y0 + 5)
        elif phase == 1:    # strike: blade thrusts up above the head
            rect(img, arm_x, torso_y0 - 2, arm_x + 1, torso_y0, skin)
            outlined_blade(arm_x, 1, arm_x + 1, torso_y0 - 3)
        elif phase == 2:    # follow-through: blade sweeps across, over the head
            rect(img, 2, torso_y0 - 2, 3, torso_y0 - 1, skin)
            outlined_blade(4, 0, 11, 1)
        else:
            rect(img, arm_x, torso_y0 - 1, arm_x + 1, torso_y0 + 1, skin)
            outlined_blade(arm_x, 2, arm_x + 1, 3)

    else:  # side (facing right)
        arm_y = torso_y0 + 1
        if phase == 0:
            rect(img, 12, arm_y - 3, 13, arm_y - 1, skin)
            outlined_blade(13, arm_y - 6, 14, arm_y - 4)
        elif phase == 1:    # strike: blade thrusts out to the right
            rect(img, 12, arm_y, 13, arm_y + 1, skin)
            outlined_blade(13, arm_y - 1, 15, arm_y)
        elif phase == 2:    # follow-through: blade drops toward the ground
            rect(img, 12, arm_y + 2, 13, arm_y + 4, skin)
            outlined_blade(12, arm_y + 5, 14, arm_y + 6)
        else:
            rect(img, 12, arm_y + 1, 13, arm_y + 2, skin)
            outlined_blade(13, arm_y + 2, 14, arm_y + 3)


def build_player_sheet():
    directions = ["down", "up", "side"]
    rows = []
    for d in directions:
        rows.append([draw_player_frame(d, "walk", ph) for ph in range(4)])
    for d in directions:
        rows.append([draw_player_frame(d, "attack", ph) for ph in range(4)])

    sheet = Image.new("RGBA", (FRAME * 4, FRAME * len(rows)), TRANSPARENT)
    for r, frames in enumerate(rows):
        for c, frame in enumerate(frames):
            sheet.paste(frame, (c * FRAME, r * FRAME))
    return sheet


# ---------------------------------------------------------------------------
# SLIME — a round blob that squishes/stretches in place, no facing direction.
# ---------------------------------------------------------------------------
def draw_slime_frame(phase):
    img = new_frame()
    p = SLIME_PALETTE

    shapes = {
        # phase: (y0, y1, x0, x1) for the main blob body
        0: (6, 11, 4, 11),
        1: (7, 10, 3, 12),   # squished: shorter and wider
        2: (6, 11, 4, 11),
        3: (5, 12, 5, 10),   # stretched: taller and narrower
    }
    y0, y1, x0, x1 = shapes[phase]
    rect(img, x0, y0, x1, y1, p["body"])
    # rounded top/bottom corners
    px(img, x0, y0, TRANSPARENT); px(img, x1, y0, TRANSPARENT)
    px(img, x0, y1, TRANSPARENT); px(img, x1, y1, TRANSPARENT)
    # a shaded underside for a bit of depth
    rect(img, x0 + 1, y1, x1 - 1, y1, p["shade"])
    # eyes
    mid_y = (y0 + y1) // 2
    cx = (x0 + x1) // 2
    px(img, cx - 2, mid_y, p["eye"])
    px(img, cx + 2, mid_y, p["eye"])

    return img


def build_slime_sheet():
    frames = [draw_slime_frame(ph) for ph in range(4)]
    sheet = Image.new("RGBA", (FRAME * 4, FRAME), TRANSPARENT)
    for c, frame in enumerate(frames):
        sheet.paste(frame, (c * FRAME, 0))
    return sheet


# ---------------------------------------------------------------------------
# OCTOROK — round-bodied waddler with a visible facing direction.
# ---------------------------------------------------------------------------
def draw_octorok_frame(direction, phase):
    img = new_frame()
    p = OCTOROK_PALETTE

    y_off = -1 if phase in (1, 3) else 0
    body_y0, body_y1 = 3 + y_off, 11 + y_off

    rect(img, 3, body_y0, 12, body_y1, p["body"])
    px(img, 3, body_y0, TRANSPARENT); px(img, 12, body_y0, TRANSPARENT)
    px(img, 3, body_y1, TRANSPARENT); px(img, 12, body_y1, TRANSPARENT)
    rect(img, 4, body_y1, 11, body_y1, p["shade"])

    if direction == "down":
        px(img, 6, body_y0 + 3, p["eye"])
        px(img, 9, body_y0 + 3, p["eye"])
    elif direction == "up":
        pass  # back of the creature: no face
    elif direction == "side":
        px(img, 10, body_y0 + 3, p["eye"])
        rect(img, 12, body_y0 + 4, 13, body_y0 + 5, p["body"])  # tiny snout

    # two little feet that alternate — same idea as the player's legs
    left_foot_x, right_foot_x = 5, 9
    foot_y = 12
    if phase == 1:
        rect(img, left_foot_x, foot_y - 1, left_foot_x + 1, foot_y, p["shade"])
        rect(img, right_foot_x, foot_y, right_foot_x + 1, foot_y + 1, p["shade"])
    elif phase == 3:
        rect(img, left_foot_x, foot_y, left_foot_x + 1, foot_y + 1, p["shade"])
        rect(img, right_foot_x, foot_y - 1, right_foot_x + 1, foot_y, p["shade"])
    else:
        rect(img, left_foot_x, foot_y, left_foot_x + 1, foot_y + 1, p["shade"])
        rect(img, right_foot_x, foot_y, right_foot_x + 1, foot_y + 1, p["shade"])

    return img


def build_octorok_sheet():
    directions = ["down", "up", "side"]
    sheet = Image.new("RGBA", (FRAME * 4, FRAME * len(directions)), TRANSPARENT)
    for r, d in enumerate(directions):
        for c in range(4):
            frame = draw_octorok_frame(d, c)
            sheet.paste(frame, (c * FRAME, r * FRAME))
    return sheet


def save_with_preview(img, name, scale=8):
    path = os.path.join(OUT_DIR, f"{name}.png")
    img.save(path)
    preview = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
    preview.save(os.path.join(PREVIEW_DIR, f"{name}_preview.png"))
    print(f"wrote {path} ({img.width}x{img.height})")


if __name__ == "__main__":
    save_with_preview(build_player_sheet(), "player")
    save_with_preview(build_slime_sheet(), "slime")
    save_with_preview(build_octorok_sheet(), "octorok")
