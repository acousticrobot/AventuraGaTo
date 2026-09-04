import { ROOM_MAP, TILE_LEGEND, TILE_SIZE, PLAYER_START, ENEMY_SPAWNS } from "../data/mapData.js";
import { ENEMY_TYPES, SWORD_CONFIG, DISPLAY_SCALE } from "../data/spriteConfig.js";
import Player from "../entities/Player.js";
import Enemy from "../entities/Enemy.js";

// ============================================================================
// GAME SCENE
// ----------------------------------------------------------------------------
// Builds the room from mapData.js, spawns the player and enemies, wires up
// input/collision, and runs the per-frame update loop. This file is the
// "glue" — most of the interesting per-character logic lives in
// entities/Player.js and entities/Enemy.js.
// ============================================================================

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  create() {
    this.buildRoom();
    this.buildInput();

    this.player = new Player(
      this,
      PLAYER_START.col * TILE_SIZE + TILE_SIZE / 2,
      PLAYER_START.row * TILE_SIZE + TILE_SIZE / 2
    );
    this.physics.add.collider(this.player.sprite, this.wallsGroup);

    this.enemies = [];
    this.enemyGroup = this.physics.add.group();
    ENEMY_SPAWNS.forEach(({ type, row, col }) => {
      const cfg = ENEMY_TYPES[type];
      if (!cfg) {
        console.warn(`Unknown enemy type "${type}" in ENEMY_SPAWNS — check mapData.js`);
        return;
      }
      const enemy = new Enemy(this, col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2, cfg);
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy.sprite);
    });

    this.physics.add.collider(this.enemyGroup, this.wallsGroup);
    this.physics.add.collider(this.enemyGroup, this.enemyGroup);

    // Sword hits an enemy
    this.physics.add.overlap(this.player.swordZone, this.enemyGroup, (_zone, enemySprite) => {
      this.onSwordHitEnemy(enemySprite);
    });

    // Enemy touches the player
    this.physics.add.overlap(this.player.sprite, this.enemyGroup, (_playerSprite, enemySprite) => {
      this.onEnemyTouchPlayer(enemySprite);
    });

    this.buildHud();

    this.gameOver = false;
  }

  // ---- Room construction -------------------------------------------------

  buildRoom() {
    this.wallsGroup = this.physics.add.staticGroup();

    ROOM_MAP.forEach((rowStr, row) => {
      [...rowStr].forEach((char, col) => {
        const tile = TILE_LEGEND[char];
        if (!tile) {
          console.warn(`Unknown tile "${char}" at row ${row}, col ${col} — check TILE_LEGEND in mapData.js`);
          return;
        }
        const x = col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;
        // Tile art is drawn at 16x16 and shown at 2x, same as characters,
        // so it lines up with the 32px grid.
        const image = this.add.image(x, y, `tile_${tile.name}`).setScale(DISPLAY_SCALE);
        if (tile.solid) {
          this.physics.add.existing(image, true); // true = static body
          this.wallsGroup.add(image);
        }
      });
    });

    const width = ROOM_MAP[0].length * TILE_SIZE;
    const height = ROOM_MAP.length * TILE_SIZE;
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);
  }

  // ---- Input --------------------------------------------------------------

  buildInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.attackKeys = this.input.keyboard.addKeys({
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      z: Phaser.Input.Keyboard.KeyCodes.Z,
    });
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  readInput() {
    return {
      left: this.cursors.left.isDown || this.wasd.left.isDown,
      right: this.cursors.right.isDown || this.wasd.right.isDown,
      up: this.cursors.up.isDown || this.wasd.up.isDown,
      down: this.cursors.down.isDown || this.wasd.down.isDown,
      attackJustPressed:
        Phaser.Input.Keyboard.JustDown(this.attackKeys.space) ||
        Phaser.Input.Keyboard.JustDown(this.attackKeys.z),
    };
  }

  // ---- HUD ------------------------------------------------------------

  buildHud() {
    this.heartIcons = [];
    const totalHearts = this.player.maxHealth / 2;
    for (let i = 0; i < totalHearts; i++) {
      const icon = this.add.image(16 + i * 20, 16, "heart_full").setScrollFactor(0).setDepth(100);
      this.heartIcons.push(icon);
    }
    this.refreshHud();

    this.messageText = this.add.text(this.scale.width / 2, this.scale.height / 2, "", {
      fontFamily: "monospace",
      fontSize: "22px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 12, y: 8 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setVisible(false);
  }

  refreshHud() {
    const fullHearts = Math.ceil(this.player.health / 2);
    this.heartIcons.forEach((icon, i) => {
      icon.setTexture(i < fullHearts ? "heart_full" : "heart_empty");
    });
  }

  // ---- Combat events --------------------------------------------------

  onSwordHitEnemy(enemySprite) {
    const enemy = enemySprite.owner;
    if (!enemy || !enemy.alive) return;
    enemy.takeDamage(SWORD_CONFIG.damage, this.time.now, this.player.sprite);
  }

  onEnemyTouchPlayer(enemySprite) {
    const enemy = enemySprite.owner;
    if (!enemy || !enemy.alive || this.gameOver) return;
    this.player.takeDamage(enemy.cfg.contactDamage, this.time.now, enemySprite);
    this.refreshHud();

    if (this.player.isDead()) {
      this.showGameOver();
    }
  }

  showGameOver() {
    this.gameOver = true;
    this.messageText.setText("You were defeated!\nPress R to try again").setVisible(true);
    this.player.sprite.setTint(0x888888);
  }

  // ---- Main loop --------------------------------------------------------

  update(time, delta) {
    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }
      return;
    }

    const input = this.readInput();
    this.player.update(time, delta, input);
    this.enemies.forEach((enemy) => enemy.update(time, delta, this.player));
    this.refreshHud();
  }
}
