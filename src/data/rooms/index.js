import * as room1 from "./room1.js";
import * as room2 from "./room2.js";
import * as room3 from "./room3.js";
import * as room4 from "./room4.js";

// ============================================================================
// ROOM REGISTRY — every room in the game, keyed by the id used in each
// room's EXITS (`toRoom`) and passed around as `roomId` when a scene starts
// or restarts (see GameScene.js init()).
// ----------------------------------------------------------------------------
// To add a new room: copy an existing room file (room3.js is a good
// starting point — it has just one doorway), give it a new name, add it to
// the import list and ROOMS object below, then add an EXITS entry in
// whichever existing room should lead to it (and a matching STARTS entry
// in the new room for the way back).
//
// A room can also be drawn in the Tiled editor instead of as a ROOM_MAP of
// letters — see room4.js for an example, and README.md ("Designing rooms in
// Tiled") for the workflow.
// ============================================================================

export const ROOMS = { room1, room2, room3, room4 };

export function getRoom(roomId) {
  const room = ROOMS[roomId];
  if (!room) {
    console.warn(`Unknown room "${roomId}" — check rooms/index.js. Falling back to room1.`);
    return ROOMS.room1;
  }
  return room;
}
