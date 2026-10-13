// ============================================================================
// ROOM 1 — "Home" — the room the game boots into.
// ============================================================================
//
// This is the file to hand to a kid who wants to design a room! See
// rooms/index.js for the full list of rooms and how to add another one, and
// README.md for more on drawing maps, tiles, and doorways.
//
// The room is just a grid of letters. Each letter is one 32x32 pixel tile.
// Every row must be exactly the same length (COLS characters wide), and
// there must be the same number of rows every time, or the game will
// complain when it loads. See TILE_LEGEND below for what each letter looks
// like and whether it blocks walking.
// ============================================================================

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
//
// Every room has its own TILE_LEGEND, so the same letter is free to mean
// something different in a different room's file if you want — this room
// has ten different wall tiles for variety; room2.js and room3.js keep it
// simple with a single "W" for every wall. Just be consistent within one
// room's own map.
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

// Named starting points — where the player appears in THIS room. "default"
// is used the very first time the game boots; the rest are used when you
// walk in through one of this room's doorways from another room (see
// EXITS in whichever room sends the player here — its `toStart` has to
// match one of these names).
export const STARTS = {
  default: { row: 9, col: 10 },
  fromRoom2North: { row: 13, col: 8 }, // stepping back in from room2, heading north
};

// Enemies to place in this room. `type` must match a key in ENEMY_TYPES
// (see spriteConfig.js). Add or remove entries to change what's in the room!
export const ENEMY_SPAWNS = [
  { type: "wiggleWorm", row: 1, col: 1 },
  { type: "slime", row: 4, col: 5 },
  { type: "sawblade", row: 12, col: 15 },
  { type: "seeker", row: 8, col: 4 },
];

// Doorways out of this room. Put one on a tile that's already walkable in
// ROOM_MAP above (usually a gap in the border wall) — walk onto it and
// you're sent to `toStart` in `toRoom`. Make sure `toRoom` actually has a
// STARTS entry named `toStart`!
//
// This room has two more walkable border gaps that aren't wired up to
// anything yet — the top wall at row 0, col 6, and the right wall at
// row 9, col 19. They're free doorways waiting for a room 4!
export const EXITS = [
  { row: 14, col: 8, toRoom: "room2", toStart: "fromRoom1South" },
];
