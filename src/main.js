import BootScene from "./scenes/BootScene.js";
import GameScene from "./scenes/GameScene.js";
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from "./data/viewport.js";

// ============================================================================
// MAIN — Phaser game configuration.
// ----------------------------------------------------------------------------
// The canvas size is a fixed viewport (see data/viewport.js) — with several
// rooms now, it no longer depends on any one room's size. A room bigger or
// smaller than this viewport is handled by the camera in GameScene.js
// (scrolls to follow the player, or centers a smaller room on screen).
// ============================================================================

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: VIEWPORT_WIDTH,
  height: VIEWPORT_HEIGHT,
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
