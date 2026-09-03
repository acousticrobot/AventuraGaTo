import { PLAYER_CONFIG, SWORD_CONFIG, FRAME_SIZE, DISPLAY_SCALE } from "../data/spriteConfig.js";

// ============================================================================
// PLAYER
// ----------------------------------------------------------------------------
// Everything about controlling the hero lives here: movement, which way
// they're facing, swinging the sword, taking damage, and hearts of health.
//
// The player is a normal Arcade Physics sprite (so it can collide with
// walls), drawn from the player.png sprite sheet and animated using the
// clips BootScene.js defined ("player_walk_down", "player_attack_side", …).
// The sword is a separate invisible physics "zone" that only turns on for a
// few frames when you swing — GameScene checks whether it's overlapping an
// enemy and applies damage if so. The visible sword-swing animation is
// purely cosmetic; the hitbox is what actually does damage.
// ============================================================================

export const FACING = { DOWN: "down", UP: "up", LEFT: "left", RIGHT: "right" };

// The sprite sheet only draws a right-facing "side" pose — left-facing just
// flips it horizontally, so both directions map to the same anim/frame set.
const ANIM_DIR = { down: "down", up: "up", left: "side", right: "side" };

const DISPLAY_SIZE = FRAME_SIZE * DISPLAY_SCALE; // 32 — matches TILE_SIZE

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.cfg = PLAYER_CONFIG;

    this.sprite = scene.physics.add.sprite(x, y, this.cfg.key);
    this.sprite.setScale(DISPLAY_SCALE);
    this.sprite.setCollideWorldBounds(true);
    // Body size is in the sprite's original (un-scaled) 16x16 frame space;
    // Phaser applies the display scale to it automatically for collisions.
    this.sprite.body.setSize(10, 13);
    this.sprite.body.setOffset(3, 3);
    this.sprite.owner = this; // let collision callbacks get back to this class

    this.facing = FACING.DOWN;
    this.health = this.cfg.maxHealth;
    this.maxHealth = this.cfg.maxHealth;
    this.invulnerableUntil = 0;

    this.sprite.play(`player_walk_${ANIM_DIR[this.facing]}`);
    this.sprite.anims.stop(); // start on frame 0 (standing still), not mid-walk

    // The sword is a rectangle physics body we move around by hand and
    // only "turn on" (enable) while a swing is active.
    this.swordZone = scene.add.zone(x, y, SWORD_CONFIG.length, SWORD_CONFIG.thickness);
    scene.physics.add.existing(this.swordZone);
    this.swordZone.body.enable = false;
    this.swordActive = false;
    this.swordActiveUntil = 0;
    this.swordReadyAt = 0;
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  isInvulnerable(timeMs) {
    return timeMs < this.invulnerableUntil;
  }

  // Called every frame from GameScene with the current input state.
  update(time, delta, input) {
    const isMoving = this.handleMovement(input);
    this.handleAttack(time, input);
    this.updateSwordPosition();
    this.updateAnimation(isMoving);

    // gentle flash while invulnerable so it's clear you just got hit
    if (this.isInvulnerable(time)) {
      this.sprite.setAlpha(Math.floor(time / 80) % 2 === 0 ? 0.4 : 1);
    } else {
      this.sprite.setAlpha(1);
    }
  }

  // Returns true if the player is currently moving (used to pick an animation).
  handleMovement(input) {
    const { left, right, up, down } = input;
    const speed = this.cfg.speed;
    let vx = 0;
    let vy = 0;

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    // update facing direction (prioritize whichever axis was just pressed;
    // simple version: horizontal wins ties, which feels fine in practice)
    if (vx !== 0 || vy !== 0) {
      if (Math.abs(vx) >= Math.abs(vy)) {
        this.facing = vx > 0 ? FACING.RIGHT : FACING.LEFT;
      } else {
        this.facing = vy > 0 ? FACING.DOWN : FACING.UP;
      }
    }

    // normalize so diagonal movement isn't faster than straight movement
    if (vx !== 0 && vy !== 0) {
      const norm = Math.SQRT1_2;
      vx *= norm;
      vy *= norm;
    }

    this.sprite.setVelocity(vx * speed, vy * speed);
    return vx !== 0 || vy !== 0;
  }

  handleAttack(time, input) {
    if (input.attackJustPressed && time >= this.swordReadyAt && !this.swordActive) {
      this.swordActive = true;
      this.swordActiveUntil = time + SWORD_CONFIG.activeMs;
      this.swordReadyAt = time + SWORD_CONFIG.cooldownMs;
      this.swordZone.body.enable = true;
      this.sprite.play(`player_attack_${ANIM_DIR[this.facing]}`);
    }

    if (this.swordActive && time >= this.swordActiveUntil) {
      this.swordActive = false;
      this.swordZone.body.enable = false;
    }
  }

  // Picks the right walk/idle/attack clip for the current facing + motion.
  // An attack in progress always wins; otherwise walk while moving, or hold
  // on the first frame of the walk cycle (a clean standing pose) when still.
  updateAnimation(isMoving) {
    this.sprite.setFlipX(this.facing === FACING.LEFT);

    if (this.swordActive) {
      return; // let the attack animation (started in handleAttack) play out
    }

    const dir = ANIM_DIR[this.facing];
    const walkKey = `player_walk_${dir}`;

    if (isMoving) {
      this.sprite.play(walkKey, true); // true = don't restart if already playing
    } else if (this.sprite.anims.currentAnim?.key !== walkKey || this.sprite.anims.isPlaying) {
      // Standing still: land on frame 0 of the matching walk cycle (a clean
      // standing pose) and freeze there, rather than mid-stride.
      this.sprite.play(walkKey);
      this.sprite.anims.stop();
    }
  }

  // Moves the (invisible) sword hitbox to sit just in front of the player,
  // in whichever direction they're facing.
  updateSwordPosition() {
    const offset = DISPLAY_SIZE * 0.55;
    let sx = this.x;
    let sy = this.y;
    let w = SWORD_CONFIG.length;
    let h = SWORD_CONFIG.thickness;

    switch (this.facing) {
      case FACING.LEFT:
        sx -= offset; w = SWORD_CONFIG.thickness; h = SWORD_CONFIG.length; break;
      case FACING.RIGHT:
        sx += offset; w = SWORD_CONFIG.thickness; h = SWORD_CONFIG.length; break;
      case FACING.UP:
        sy -= offset; break;
      case FACING.DOWN:
      default:
        sy += offset; break;
    }

    this.swordZone.setPosition(sx, sy);
    this.swordZone.body.setSize(w, h);
  }

  takeDamage(amount, time, knockbackFrom) {
    if (this.isInvulnerable(time)) return;

    this.health = Math.max(0, this.health - amount);
    this.invulnerableUntil = time + this.cfg.invulnerableMs;

    if (knockbackFrom) {
      const angle = Phaser.Math.Angle.Between(knockbackFrom.x, knockbackFrom.y, this.x, this.y);
      this.sprite.setVelocity(Math.cos(angle) * 220, Math.sin(angle) * 220);
    }
  }

  isDead() {
    return this.health <= 0;
  }
}
