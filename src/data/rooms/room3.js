// ============================================================================
// ROOM 3 — connects north to room2. A dead end for now — a good spot for a
// room 4!
// ============================================================================
// See room1.js for the full explanation of how a room file works.
// ============================================================================

export const ROOM_MAP = [
  "[EEEEEEEEEEEEEEEEEEEEEEEEE|EEEEEEEEEEEER",
  "W......................................W",
  "W.TT....~~....................~~...TTT.W",
  "W.TT...............................TTT.W",
  "W......................................W",
  "W................................CD....W",
  "W~~~~~~~~~....................~........W",
  "W~~~~~~~~~....................~~~~.T...W",
  "W~~~~~~~~~....................~~~~~~~|~W",
  "W......~~~....................~~~~~~~|~W",
  "W......~~..............................W",
  "WTTTT................................SSW",
  "W..TT..............................SSSSW",
  "W................................SSSSSSW",
  "LEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE]",
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
  fromRoom2South: { row: 1, col: 26 }, // arrived from room2's south doorway
};

export const ENEMY_SPAWNS = [
  { type: "slimeSpectre", row: 4, col: 5 },
  { type: "slimeSpectre", row: 12, col: 15 },
  { type: "seeker", row: 8, col: 4 },
];

export const EXITS = [
  { row: 0, col: 26, toRoom: "room2", toStart: "fromRoom3North" },
];
