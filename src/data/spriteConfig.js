// ============================================================================
// SPRITE CONFIG — tweak how characters look and behave.
// ============================================================================
//
// Characters are drawn from real 16x16 pixel-art sprite sheets, shown on
// screen at 2x size (32x32) so they match the room's 32px tiles.
// BootScene.js loads these sheets and defines the animations; this file
// just says which *file* each character uses and, for sheets that don't
// come with their own animation tags, which frames belong to which
// animation (see PLAYER_WALK_ROWS etc. below).
//
// ---- Themes ----------------------------------------------------------
// Every character's art actually lives at assets/sprites/<theme>/<file>,
// where <theme> is a folder name (see the THEME constant at the top of
// BootScene.js). Each kid can have their own theme folder with their own
// drawings — a theme only needs to provide the files it wants to change;
// anything it doesn't have quietly falls back to assets/sprites/default/,
// which always has every asset. See README.md ("Drawing your own
// pixel-art sprites") for the full guide, including how to keep your
// animations correct no matter what order you drew your frames in.
// ============================================================================

export const FRAME_SIZE = 16;   // every sprite sheet is a grid of 16x16 frames
export const DISPLAY_SCALE = 2; // shown on screen at 32x32 (matches TILE_SIZE)

export const ASSET_ROOT = "assets/sprites";
export const DEFAULT_THEME = "default"; // always has every asset — the ultimate fallback

export const PLAYER_CONFIG = {
  key: "player",
  sheetFile: "player.png",
  speed: 140,            // pixels per second
  maxHealth: 6,          // number of heart pieces (each heart = 2 health)
  invulnerableMs: 900,   // how long you flash/can't be hurt after taking damage
  walkFrameRate: 8,
  attackFrameRate: 16,
};

// Fallback row layout of player.png — 4 columns x 6 rows of 16x16 frames —
// used ONLY when a theme's sheet doesn't come with its own animation tags
// (see BootScene.js). Each row is a 4-frame animation; "side" is drawn
// facing right and flipped in code for left-facing movement, so there's no
// separate left-facing art.
export const PLAYER_WALK_ROWS = { down: 0, up: 1, side: 2 };
export const PLAYER_ATTACK_ROWS = { down: 3, up: 4, side: 5 };

export const SWORD_CONFIG = {
  color: 0xe0e0e0,
  length: 22,
  thickness: 6,
  activeMs: 160,   // how long the sword hitbox stays out per swing
  cooldownMs: 250, // time before you can swing again
  damage: 1,
};

// Each enemy "type" is a little recipe: how it looks, how tough it is, and
// which behavior script it uses (see Enemy.js for what each behavior does).
// The property name here (what ENEMY_SPAWNS' `type` refers to in mapData.js)
// and `key` (the texture/animation name) don't have to match, but keeping
// them the same avoids mix-ups — and every property name MUST be unique,
// same as any JS object: two entries with the same name silently collapse
// into one (the second wins, the first just vanishes) with no warning.
//
// Want a whole new kind of enemy? Just add another entry here — BootScene.js
// loads and animates every entry in this list automatically, and GameScene.js
// spawns whatever ENEMY_SPAWNS in mapData.js asks for. Nothing else to touch,
// as long as `behavior` is "wander" or "chase" (see Enemy.js for those) and
// `directional` correctly says whether it has its own down/up/side art.
//
// ---- Animation cycles (walk/wobble, and an optional attack) ----------
// `animFrameRate` is used for the walk/wobble loop; `attackFrameRate` is
// optional and only matters for an enemy that has an attack tag (see
// below) — it defaults to `animFrameRate` if you don't set it.
//
// A plain PNG with no `<name>.json` next to it always gets the same basic
// shape: non-directional = one 4-frame "wobble" row, directional = three
// 4-frame down/up/side rows (see ENEMY_WALK_ROWS). That's a fine default
// for a quick first sprite, but it can't express anything more than
// that — a longer wobble, frames in a different order, or an attack cycle.
//
// For any of that, give the sheet a matching Aseprite JSON export (same
// idea as gata/player.json — see README.md, "Drawing your own pixel-art
// sprites"), tagged with whichever of these apply:
//   - non-directional: "Wobble" (required for anything beyond 4 frames),
//     and optionally "Attack"
//   - directional: "Down"/"Up"/"Side" (required for anything beyond the
//     basic 4-frame rows), and optionally "DownAtk"/"UpAtk"/"SideAtk"
// BootScene.js reads each tag's *actual* frame range from the JSON, so the
// cycle can be any length and the rows can be in any order — exactly like
// the player's animations already work. A missing tag just means that one
// clip falls back to the plain-grid default (or, for an attack tag that
// isn't there at all, no attack animation gets created — nothing plays it
// until an enemy's `behavior` actually calls for one).
export const ENEMY_TYPES = {
  wiggleWorm: {
    key: "wiggleWorm",
    sheetFile: "wiggleWorm.png",
    speed: 30,
    health: 2,
    contactDamage: 1,
    behavior: "wander",       // moves in a random direction, changes every couple seconds
    knockback: 120,
    directional: false,       // one wobble animation, plays regardless of movement direction
    animFrameRate: 6,
  },
  slimeSpectre: {
    key: "slimeSpectre",
    sheetFile: "slimeSpectre.png",
    speed: 45,
    health: 2,
    contactDamage: 1,
    behavior: "wander",       // moves in a random direction, changes every couple seconds
    knockback: 120,
    directional: false,       // one wobble animation, plays regardless of movement direction
    animFrameRate: 8,
  },
  seeker: {
    key: "seeker",
    sheetFile: "seeker.png",
    speed: 60,
    health: 3,
    contactDamage: 1,
    behavior: "chase",        // notices the player within range and follows them
    chaseRange: 160,
    knockback: 140,
    directional: true,        // has its own down/up/side walk animations, like the player
    animFrameRate: 8,
  },
};

// Fallback row layout for ANY directional enemy sheet with no JSON tags
// (down/up/side, 4 columns x 3 rows) — same idea as PLAYER_WALK_ROWS, just
// shared across every directional enemy instead of one row-set per type.
export const ENEMY_WALK_ROWS = { down: 0, up: 1, side: 2 };
