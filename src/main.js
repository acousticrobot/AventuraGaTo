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

// The "Mojang" font (index.html has its @font-face) is a normal browser
// font, not a Phaser asset — the browser only actually fetches it the
// first time something on the page uses it, and Phaser's canvas-drawn
// Text objects don't automatically redraw once a late-arriving font
// finishes loading. So we ask the browser to load it up front, before the
// game (and anything that might draw text with it, like the debug overlay
// in GameScene.js) even starts — that way the very first bit of text drawn
// in "Mojang" already has it. If the font ever fails to load (missing
// file, etc.) we just start the game anyway; Phaser falls back to the
// second name in any "Mojang, monospace"-style fontFamily.
Promise.all([
  document.fonts.load("400 16px Mojang"),
  document.fonts.load("700 16px Mojang"),
]).catch((err) => {
  console.warn("AventuraGaTo: the Mojang font didn't load — using the fallback font instead.", err);
}).then(() => {
  new Phaser.Game(config);
});
