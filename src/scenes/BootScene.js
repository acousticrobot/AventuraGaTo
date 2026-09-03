import { TILE_SIZE, TILE_LEGEND } from "../data/mapData.js";
import {
  PLAYER_CONFIG, PLAYER_WALK_ROWS, PLAYER_ATTACK_ROWS,
  ENEMY_TYPES, OCTOROK_WALK_ROWS, FRAME_SIZE,
} from "../data/spriteConfig.js";

// ============================================================================
// BOOT SCENE
// ----------------------------------------------------------------------------
// Runs once, before anything else. It loads the pixel-art sprite sheets,
// builds the tile/heart textures, defines every animation, and then hands
// off to GameScene.
//
// Tiles and hearts are still simple drawn shapes (Phaser Graphics baked into
// a texture) — there's no motion to animate there, so there's no need for
// sprite sheet art yet. Characters (player + enemies), which now walk and
// swing a sword, load from real 16x16 PNGs in assets/sprites/.
// ============================================================================

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    this.load.spritesheet(PLAYER_CONFIG.key, PLAYER_CONFIG.sheet, {
      frameWidth: FRAME_SIZE,
      frameHeight: FRAME_SIZE,
    });
    Object.values(ENEMY_TYPES).forEach((cfg) => {
      this.load.spritesheet(cfg.key, cfg.sheet, {
        frameWidth: FRAME_SIZE,
        frameHeight: FRAME_SIZE,
      });
    });
  }

  create() {
    this.generateTileTextures();
    this.generateHeartTextures();
    this.createAnimations();

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

  // Every animation used in the game is defined once, here, by name.
  // Player.js and Enemy.js just call sprite.play("player_walk_down") etc.
  createAnimations() {
    const DIRS = ["down", "up", "side"];

    DIRS.forEach((dir) => {
      const row = PLAYER_WALK_ROWS[dir];
      this.anims.create({
        key: `player_walk_${dir}`,
        frames: this.anims.generateFrameNumbers(PLAYER_CONFIG.key, {
          start: row * 4, end: row * 4 + 3,
        }),
        frameRate: PLAYER_CONFIG.walkFrameRate,
        repeat: -1,
      });
    });

    DIRS.forEach((dir) => {
      const row = PLAYER_ATTACK_ROWS[dir];
      this.anims.create({
        key: `player_attack_${dir}`,
        frames: this.anims.generateFrameNumbers(PLAYER_CONFIG.key, {
          start: row * 4, end: row * 4 + 3,
        }),
        frameRate: PLAYER_CONFIG.attackFrameRate,
        repeat: 0,
      });
    });

    this.anims.create({
      key: "slime_wobble",
      frames: this.anims.generateFrameNumbers(ENEMY_TYPES.slime.key, { start: 0, end: 3 }),
      frameRate: ENEMY_TYPES.slime.animFrameRate,
      repeat: -1,
    });

    DIRS.forEach((dir) => {
      const row = OCTOROK_WALK_ROWS[dir];
      this.anims.create({
        key: `octorok_walk_${dir}`,
        frames: this.anims.generateFrameNumbers(ENEMY_TYPES.octorok.key, {
          start: row * 4, end: row * 4 + 3,
        }),
        frameRate: ENEMY_TYPES.octorok.animFrameRate,
        repeat: -1,
      });
    });
  }
}
