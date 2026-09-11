// ============================================================================
// ROOM 2 — connects north to room1, and south to room3.
// ============================================================================
// See room1.js for the full explanation of how a room file works; this one
// keeps the comments short since it's the same idea.
// ============================================================================

export const ROOM_MAP = [
  "[EEEED|CEEEER",
  "W.....|.....W",
  "W.TT..|.~~~.W",
  "W.TT..|..+..W",
  "W....+|.....W",
  "W+.+++||....W",
  "W...+++|||||W",
  "W....++||...W",
  "W...TTTT|...W",
  "W++++...|...W",
  "W..++++.|.+.W",
  "LEEEEEED|CEE]",
];

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

export const STARTS = {
  default: { row: 1, col: 6 },
  fromRoom1South: { row: 1, col: 6 },   // arrived from room1's south doorway
  fromRoom3North: { row: 10, col: 8 },  // arrived from room3's north doorway
};


export const EXITS = [
  { row: 0, col: 6, toRoom: "room1", toStart: "fromRoom2North" },
  { row: 11, col: 8, toRoom: "room3", toStart: "fromRoom2South" },
];
