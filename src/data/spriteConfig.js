// ============================================================================
// SPRITE CONFIG — tweak how characters look and behave.
// ============================================================================
//
// Characters are drawn from real 16x16 pixel-art sprite sheets in
// assets/sprites/ (player.png, slime.png, octorok.png), shown on screen at
// 2x size (32x32) so they match the room's 32px tiles. BootScene.js loads
// these sheets and defines the animations; this file just says which frames
// belong to which animation, and how fast each one plays.
//
// Want to draw your OWN sprite sheet (in Piskel, Aseprite, or any pixel art
// tool)? Replace the PNG in assets/sprites/ and keep the same grid: each
// frame is a 16x16 square, laid out left-to-right, top-to-bottom, in the
// order described by *_ANIM_ROWS below. As long as the grid matches, nothing
// else in the code needs to change. See README.md for the full guide.
// ============================================================================

export const FRAME_SIZE = 16;   // every sprite sheet is a grid of 16x16 frames
export const DISPLAY_SCALE = 2; // shown on screen at 32x32 (matches TILE_SIZE)

export const PLAYER_CONFIG = {
  key: "player",
  sheet: "assets/sprites/player.png",
  speed: 140,            // pixels per second
  maxHealth: 6,          // number of heart pieces (each heart = 2 health)
  invulnerableMs: 900,   // how long you flash/can't be hurt after taking damage
  walkFrameRate: 8,
  attackFrameRate: 16,
};

// Row layout of player.png — 4 columns x 6 rows of 16x16 frames.
// Each row is a 4-frame animation; "side" is drawn facing right and flipped
// in code for left-facing movement, so there's no separate left-facing art.
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
export const ENEMY_TYPES = {
  slime: {
    key: "slime",
    sheet: "assets/sprites/slime.png",
    speed: 45,
    health: 2,
    contactDamage: 1,
    behavior: "wander",       // moves in a random direction, changes every couple seconds
    knockback: 120,
    directional: false,       // one wobble animation, plays regardless of movement direction
    animFrameRate: 6,
  },
  octorok: {
    key: "octorok",
    sheet: "assets/sprites/octorok.png",
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

// Row layout of octorok.png — 4 columns x 3 rows (down/up/side), same idea
// as PLAYER_WALK_ROWS. slime.png has no directional rows — it's a single
// 4-frame row used no matter which way the slime is moving.
export const OCTOROK_WALK_ROWS = { down: 0, up: 1, side: 2 };
