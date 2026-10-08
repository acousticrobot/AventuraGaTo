import { getRoom } from "../data/rooms/index.js";
import { TILE_SIZE } from "../data/tileSize.js";
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from "../data/viewport.js";
import { GAME_CONFIG } from "../data/gameConfig.js";
import { ENEMY_TYPES, ATTACK_CONFIG, DISPLAY_SCALE } from "../data/spriteConfig.js";
import Player from "../entities/Player.js";
import Enemy from "../entities/Enemy.js";

// ============================================================================
// GAME SCENE
// ----------------------------------------------------------------------------
// Builds a room from data/rooms/, spawns the player and enemies, wires up
// input/collision, and runs the per-frame update loop. This file is the
// "glue" — most of the interesting per-character logic lives in
// entities/Player.js and entities/Enemy.js.
//
// ---- Rooms & transitions ------------------------------------------------
// Which room to build and where the player appears in it are passed in via
// init(data) as { roomId, startId } — read fresh every time this scene
// (re)starts, including the very first boot (BootScene.js starts "Game"
// with no data at all, so the defaults in init() below kick in: room1,
// "default"). Walking onto an EXIT tile (see buildExits()) calls
// this.scene.restart({ roomId, startId }) with the destination, which runs
// init()/create() all over again for the new room.
//
// Room state always resets on (re)entry for now — nothing about a room
// (which enemies are still alive, damage already dealt, etc.) is
// remembered between visits. That's deliberate: it's the simple version,
// good enough until the game has things worth persisting (quests,
// treasure) — see ROADMAP.md.
// ============================================================================

const EXIT_GRACE_MS = 400; // ignore exits for a moment after arriving, so you
                           // don't instantly walk back out through the
                           // doorway you just came in through

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  init(data = {}) {
    this.roomId = data.roomId || "room1";
    this.startId = data.startId || "default";
    this.room = getRoom(this.roomId);
    this.exitsEnabled = false;
    // Carried through scene.restart() (see the exit handler and the
    // death-restart in update()) so toggling the debug overlay sticks
    // across room changes instead of resetting every time.
    this.debugMode = data.debug !== undefined ? data.debug : GAME_CONFIG.debugStart;
  }

  create() {
    this.buildRoom();
    this.buildInput();
    this.debugTexts = [];
    if (this.debugMode) this.buildDebugOverlay();

    const start = this.room.STARTS[this.startId] || this.room.STARTS.default;
    this.player = new Player(
      this,
      start.col * TILE_SIZE + TILE_SIZE / 2,
      start.row * TILE_SIZE + TILE_SIZE / 2
    );
    this.physics.add.collider(this.player.sprite, this.wallsGroup);
    this.cameras.main.startFollow(this.player.sprite, true);

    this.enemies = [];
    this.enemyGroup = this.physics.add.group();
    (this.room.ENEMY_SPAWNS || []).forEach(({ type, row, col }) => {
      const cfg = ENEMY_TYPES[type];
      if (!cfg) {
        console.warn(`Unknown enemy type "${type}" in ${this.roomId}'s ENEMY_SPAWNS — check spriteConfig.js`);
        return;
      }
      const enemy = new Enemy(this, col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2, cfg);
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy.sprite);
    });

    this.physics.add.collider(this.enemyGroup, this.wallsGroup);
    this.physics.add.collider(this.enemyGroup, this.enemyGroup);

    // Attack hits an enemy
    this.physics.add.overlap(this.player.attackZone, this.enemyGroup, (_zone, enemySprite) => {
      this.onAttackHitEnemy(enemySprite);
    });

    // Enemy touches the player
    this.physics.add.overlap(this.player.sprite, this.enemyGroup, (_playerSprite, enemySprite) => {
      this.onEnemyTouchPlayer(enemySprite);
    });

    this.buildExits();

    this.buildHud();

    this.gameOver = false;

    // Brief grace period before exits can fire — see EXIT_GRACE_MS above.
    this.time.delayedCall(EXIT_GRACE_MS, () => { this.exitsEnabled = true; });
  }

  // ---- Room construction -------------------------------------------------

  buildRoom() {
    this.wallsGroup = this.physics.add.staticGroup();

    this.room.ROOM_MAP.forEach((rowStr, row) => {
      [...rowStr].forEach((char, col) => {
        const tile = this.room.TILE_LEGEND[char];
        if (!tile) {
          console.warn(`Unknown tile "${char}" at row ${row}, col ${col} in ${this.roomId} — check its TILE_LEGEND`);
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

    const roomWidth = this.room.ROOM_MAP[0].length * TILE_SIZE;
    const roomHeight = this.room.ROOM_MAP.length * TILE_SIZE;
    this.physics.world.setBounds(0, 0, roomWidth, roomHeight);

    // The window on screen is always VIEWPORT_WIDTH x VIEWPORT_HEIGHT (fixed
    // in data/viewport.js), no matter how big or small this particular room
    // is:
    //  - a room BIGGER than the viewport: the camera's bounds are just the
    //    room itself, so startFollow() (in create(), once the player
    //    exists) scrolls it around, clamped so you never see past the walls.
    //  - a room SMALLER than the viewport (in either direction): we pad the
    //    camera's bounds out to the viewport size, centered on the room, so
    //    there's nowhere for the camera to scroll TO — the room just sits
    //    centered on screen with a calm margin around it, instead of pinned
    //    into a corner.
    const boundsWidth = Math.max(roomWidth, VIEWPORT_WIDTH);
    const boundsHeight = Math.max(roomHeight, VIEWPORT_HEIGHT);
    const boundsX = (roomWidth - boundsWidth) / 2;
    const boundsY = (roomHeight - boundsHeight) / 2;
    this.cameras.main.setBounds(boundsX, boundsY, boundsWidth, boundsHeight);
  }

  // ---- Exits (doorways to other rooms) -----------------------------------

  buildExits() {
    this.exitZones = this.physics.add.staticGroup();
    (this.room.EXITS || []).forEach((exit) => {
      const x = exit.col * TILE_SIZE + TILE_SIZE / 2;
      const y = exit.row * TILE_SIZE + TILE_SIZE / 2;
      const zone = this.add.zone(x, y, TILE_SIZE, TILE_SIZE);
      this.physics.add.existing(zone, true); // true = static body
      zone.exitData = exit;
      this.exitZones.add(zone);
    });

    this.physics.add.overlap(this.player.sprite, this.exitZones, (_playerSprite, zone) => {
      if (!this.exitsEnabled) return;
      this.exitsEnabled = false; // don't let this fire twice while we restart
      const { toRoom, toStart } = zone.exitData;
      this.scene.restart({ roomId: toRoom, startId: toStart, debug: this.debugMode });
    });
  }

  // ---- Debug overlay (row,col labels on every tile) ----------------------
  // Handy while drawing/editing a room's ROOM_MAP — counting characters in a
  // text editor to find a tile's row/col is tedious, so press G to see them
  // drawn right on the map instead. Toggled with GameScene's debugKey (G);
  // GAME_CONFIG.debugStart in data/gameConfig.js just sets whether it's on
  // when the game first boots.

  buildDebugOverlay() {
    this.room.ROOM_MAP.forEach((rowStr, row) => {
      [...rowStr].forEach((_char, col) => {
        const x = col * TILE_SIZE + 2;
        const y = row * TILE_SIZE + 1;
        const label = this.add.text(x, y, `${row},${col}`, {
          fontFamily: "Mojang, monospace",
          fontSize: "9px",
          color: "#000000",
          stroke: "#FFFFFF",
          strokeThickness: 0,
        }).setDepth(200);
        this.debugTexts.push(label);
      });
    });
  }

  destroyDebugOverlay() {
    this.debugTexts.forEach((label) => label.destroy());
    this.debugTexts = [];
  }

  toggleDebug() {
    this.debugMode = !this.debugMode;
    if (this.debugMode) {
      this.buildDebugOverlay();
    } else {
      this.destroyDebugOverlay();
    }
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
    this.debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
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

  onAttackHitEnemy(enemySprite) {
    const enemy = enemySprite.owner;
    if (!enemy || !enemy.alive) return;
    enemy.takeDamage(ATTACK_CONFIG.damage, this.time.now, this.player.sprite);
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
    if (Phaser.Input.Keyboard.JustDown(this.debugKey)) {
      this.toggleDebug();
    }

    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        // Respawn in the same room, the same way you entered it, rather
        // than always bouncing back to room1.
        this.scene.restart({ roomId: this.roomId, startId: this.startId, debug: this.debugMode });
      }
      return;
    }

    const input = this.readInput();
    this.player.update(time, delta, input);
    this.enemies.forEach((enemy) => enemy.update(time, delta, this.player));
    this.refreshHud();
  }
}
