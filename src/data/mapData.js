// ============================================================================
// MAP DATA — this is the file to hand to a kid who wants to design the room!
// ============================================================================
//
// The room is just a grid of letters. Each letter is one 32x32 pixel tile.
// Every row must be exactly the same length (COLS characters wide), and
// there must be exactly ROWS rows, or the game will complain when it loads.
//
// Legend (see TILE_LEGEND below for what each letter looks like/does):
//   W = wall / rock  (solid, blocks walking)
//   . = grass floor  (walkable)
//   T = tree         (solid, blocks walking)
//   ~ = water        (solid for now — no swimming yet!)
//   S = space        (solid, blocks walking)
//
// Want to design your own room? Copy this whole ROOM_MAP block into a text
// editor, draw your room using only these letters (keep every row the
// same length!), and paste it back in. Try adding more trees, building a
// maze out of W's, or making a bigger pond.
// ============================================================================

export const TILE_SIZE = 32;

export const ROOM_MAP = [
  "WWWWWW|WWWWWWWWWWWWW",
  "W.....|............W",
  "W.TT..|.~~~~...TTT.W",
  "W.TT..|........TTT.W",
  "W.....|............W",
  "W.....||.....WW....W",
  "W~~~~~~|~~~...WW...W",
  "W~~~~~~|~~~~.......W",
  "W~~~~~~|~~~........W",
  "W......|||||||||||||",
  "W......||..........W",
  "W...TTTT|...TTTT...W",
  "W.......|........SSS",
  "W.......|.........SS",
  "WWWWWWWW|WWWWWWWSSSS",
];

// What each letter means. `name` picks which PNG to draw it with — the
// game loads assets/sprites/<theme>/tiles/<name>.png for each one (see
// BootScene.js), falling back to assets/sprites/default/tiles/<name>.png
// the same way character sprites do. `solid: true` means the player and
// enemies cannot walk through it.
export const TILE_LEGEND = {
  "W": { name: "wall", solid: true },
  ".": { name: "grass", solid: false },
  "|": { name: "path", solid: false },
  "T": { name: "tree", solid: true },
  "~": { name: "water", solid: true },
  "S": { name: "space", solid: true },
};

// Where things start out. Row/col are grid positions (0 = top-left),
// NOT pixels — the game does that math for you.
export const PLAYER_START = { row: 9, col: 10 };

// Enemies to place in the room. `type` must match a key in ENEMY_TYPES
// (see spriteConfig.js). Add or remove entries to change what's in the room!
export const ENEMY_SPAWNS = [
  { type: "slime", row: 4, col: 5 },
  { type: "slime", row: 12, col: 15 },
  { type: "octorok", row: 8, col: 4 },
];
