import BootScene from "./scenes/BootScene.js";
import GameScene from "./scenes/GameScene.js";
import { ROOM_MAP, TILE_SIZE } from "./data/mapData.js";

// ============================================================================
// MAIN — Phaser game configuration.
// ----------------------------------------------------------------------------
// The canvas size is calculated FROM the map, so if you make the room in
// mapData.js bigger or smaller, everything just adapts automatically.
// ============================================================================

const roomWidth = ROOM_MAP[0].length * TILE_SIZE;
const roomHeight = ROOM_MAP.length * TILE_SIZE;

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: roomWidth,
  height: roomHeight,
  zoom: 1.5,             // scales the whole crisp pixel-art canvas up, retro-style
  pixelArt: true,
  roundPixels: true,
  backgroundColor: "#1a1a2e",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,       // flip to true if you want to SEE collision boxes
    },
  },
  scene: [BootScene, GameScene],
};

new Phaser.Game(config);
