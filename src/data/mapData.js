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
  "[EEEED|CEEEEEEEEEEER",
  "W.....|............W",
  "W.TT..|.~~~~...TTT.W",
  "W.TT..|..+.....TTT.W",
  "W....+|............W",
  "W+.+++||.....CR....W",
  "W~~~~~~|~~~...LD...W",
  "W~~~~~~|~~~~...+...W",
  "W~~~~~~|~~~...++...U",
  "W...+++|||||||||||||",
  "W....++||..........M",
  "W...TTTT|...TTTT..C]",
  "W++++...|.....+..SSS",
  "W..++++.|.++......SS",
  "LEEEEEED|CEEEEEDSSSS",
];

// What each letter means. `name` picks which PNG to draw it with — the
// game loads assets/sprites/<theme>/tiles/<name>.png for each one (see
// BootScene.js), falling back to assets/sprites/default/tiles/<name>.png
// the same way character sprites do. `solid: true` means the player and
// enemies cannot walk through it.
export const TILE_LEGEND = {
  "C": { name: "wall1", solid: true },
  "E": { name: "wall2", solid: true },
  "D": { name: "wall3", solid: true },
  "U": { name: "wall4", solid: true },
  "W": { name: "wall5", solid: true },
  "M": { name: "wall6", solid: true },
  "[": { name: "wall7", solid: true },
  "R": { name: "wall8", solid: true },
  "]": { name: "wall9", solid: true },
  "L": { name: "wall10", solid: true },
  ".": { name: "ground", solid: false },
  "+": { name: "grass", solid: false },
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
  { type: "wiggleworm", row: 1, col: 1 },
  { type: "slimeSpectre", row: 4, col: 5 },
  { type: "slimeSpectre", row: 12, col: 15 },
  { type: "seeker", row: 8, col: 4 },
];
