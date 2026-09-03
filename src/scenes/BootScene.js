import { TILE_SIZE, TILE_LEGEND } from "../data/mapData.js";
import { PLAYER_CONFIG, ENEMY_TYPES } from "../data/spriteConfig.js";

// ============================================================================
// BOOT SCENE
// ----------------------------------------------------------------------------
// Runs once, before anything else. Its only job is to make sure every image
// the game needs exists as a "texture" before GameScene tries to use it.
//
// Instead of loading image files (this.load.image(...)), we DRAW simple
// shapes with Phaser's Graphics object and bake them into textures. That's
// what generateTexture() below does. This is why the game has zero asset
// files and still runs the instant you open index.html.
//
// When you're ready to use real drawn art instead, replace the bodies of
// the functions below with normal Phaser loading, e.g.:
//   this.load.image("player", "assets/player.png");
// and call it from preload() instead of create().
// ============================================================================

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create() {
    this.generateTileTextures();
    this.generateCharacterTexture(PLAYER_CONFIG);
    Object.values(ENEMY_TYPES).forEach((cfg) => this.generateCharacterTexture(cfg));
    this.generateHeartTextures();

    this.scene.start("Game");
  }

  // One square texture per tile letter in TILE_LEGEND (wall, grass, tree, water).
  generateTileTextures() {
    Object.values(TILE_LEGEND).forEach(({ name, color }) => {
      const g = this.add.graphics();
      g.fillStyle(color, 1);
      g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      // a subtle darker border so tiles read as separate squares
      g.lineStyle(1, 0x000000, 0.15);
      g.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
      g.generateTexture(`tile_${name}`, TILE_SIZE, TILE_SIZE);
      g.destroy();
    });
  }

  // Draws a simple "block person" facing down: a body square, a lighter
  // face patch, and two eyes, so it's easy to tell which way things face.
  generateCharacterTexture(cfg) {
    const s = cfg.size;
    const g = this.add.graphics();

    g.fillStyle(cfg.bodyColor, 1);
    g.fillRoundedRect(0, 0, s, s, 4);

    g.lineStyle(2, cfg.outlineColor, 1);
    g.strokeRoundedRect(0, 0, s, s, 4);

    // two little "eyes" near the top so the sprite has a default facing (down)
    g.fillStyle(0xffffff, 1);
    const eyeSize = Math.max(2, Math.round(s * 0.1));
    g.fillRect(s * 0.28 - eyeSize / 2, s * 0.32, eyeSize, eyeSize);
    g.fillRect(s * 0.72 - eyeSize / 2, s * 0.32, eyeSize, eyeSize);

    g.generateTexture(cfg.key, s, s);
    g.destroy();
  }

  // Two small heart textures (full/empty) for the HUD.
  generateHeartTextures() {
    const size = 16;
    [
      { key: "heart_full", color: 0xe63946 },
      { key: "heart_empty", color: 0x3a3a4a },
    ].forEach(({ key, color }) => {
      const g = this.add.graphics();
      g.fillStyle(color, 1);
      // two circles + a triangle-ish bottom = a simple heart blob
      g.fillCircle(size * 0.3, size * 0.35, size * 0.3);
      g.fillCircle(size * 0.7, size * 0.35, size * 0.3);
      g.fillTriangle(0, size * 0.35, size, size * 0.35, size * 0.5, size);
      g.generateTexture(key, size, size);
      g.destroy();
    });
  }
}
