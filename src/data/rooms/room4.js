// ============================================================================
// ROOM 4 — "Tiled Garden" — the first room drawn in the Tiled editor.
// ============================================================================
//
// Unlike room1–3, this room has no ROOM_MAP of letters (and no TILE_LEGEND):
// its look and its walls come from assets/maps/room4.tmj, a map saved from
// Tiled. TILED_MAP below is that file's name, without the ".tmj". This file
// still holds everything that isn't tiles — where the player can start,
// the enemies, and the doorways — using the same row/col numbers as any
// other room (turn on the debug overlay with G to see them on the map).
// See README.md, "Designing rooms in Tiled".
// ============================================================================

export const TILED_MAP = "room4";

export const STARTS = {
  default: { row: 9, col: 2 },
  fromRoom1East: { row: 9, col: 1 }, // stepping in from room1's east doorway
};

export const ENEMY_SPAWNS = [
  { type: "slime", row: 5, col: 10 },
  { type: "seeker", row: 11, col: 20 },
  { type: "wiggleWorm", row: 15, col: 8 },
];

export const EXITS = [
  { row: 9, col: 0, toRoom: "room1", toStart: "fromRoom4West" },
];
