import { TILE_SIZE } from "./tileSize.js";
import { ROOMS } from "./rooms/index.js";

// ============================================================================
// VIEWPORT — the game window's fixed size, in pixels (before the `zoom` in
// main.js). It never changes no matter which room is on screen, so the
// player and every tile always look the same physical size everywhere —
// only the camera's scroll position moves.
// ----------------------------------------------------------------------------
// It's set once, here, from room1 (today's starting room, and the room
// every future one is measured against). See GameScene.js buildRoom() for
// exactly how a room bigger than this scrolls (the camera follows the
// player, clamped to the room's own walls) and a room smaller than this
// gets centered instead of pinned to a corner.
// ============================================================================

const referenceRoomMap = ROOMS.room1.ROOM_MAP;

export const VIEWPORT_COLS = referenceRoomMap[0].length;
export const VIEWPORT_ROWS = referenceRoomMap.length;
export const VIEWPORT_WIDTH = VIEWPORT_COLS * TILE_SIZE;
export const VIEWPORT_HEIGHT = VIEWPORT_ROWS * TILE_SIZE;
