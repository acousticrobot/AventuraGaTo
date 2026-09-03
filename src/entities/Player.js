import { PLAYER_CONFIG, SWORD_CONFIG } from "../data/spriteConfig.js";

// ============================================================================
// PLAYER
// ----------------------------------------------------------------------------
// Everything about controlling the hero lives here: movement, which way
// they're facing, swinging the sword, taking damage, and hearts of health.
//
// The player is a normal Arcade Physics sprite (so it can collide with
// walls). The sword is a separate invisible physics "zone" that only turns
// on for a few frames when you swing — GameScene checks whether it's
// overlapping an enemy and applies damage if so.
// ============================================================================

export const FACING = { DOWN: "down", UP: "up", LEFT: "left", RIGHT: "right" };

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.cfg = PLAYER_CONFIG;

    this.sprite = scene.physics.add.sprite(x, y, this.cfg.key);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setSize(this.cfg.size * 0.8, this.cfg.size * 0.8);
    this.sprite.owner = this; // let collision callbacks get back to this class

    this.facing = FACING.DOWN;
    this.health = this.cfg.maxHealth;
    this.maxHealth = this.cfg.maxHealth;
    this.invulnerableUntil = 0;

    // The sword is a rectangle physics body we move around by hand and
    // only "turn on" (enable) while a swing is active.
    this.swordZone = scene.add.zone(x, y, SWORD_CONFIG.length, SWORD_CONFIG.thickness);
    scene.physics.add.existing(this.swordZone);
    this.swordZone.body.enable = false;
    this.swordActive = false;
    this.swordActiveUntil = 0;
    this.swordReadyAt = 0;

    // A tiny visible flash for the sword so you can actually see the swing
    // even though it's technically an invisible hitbox underneath.
    this.swordSprite = scene.add.rectangle(x, y, SWORD_CONFIG.length, SWORD_CONFIG.thickness, SWORD_CONFIG.color);
    this.swordSprite.setVisible(false);
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  isInvulnerable(timeMs) {
    return timeMs < this.invulnerableUntil;
  }

  // Called every frame from GameScene with the current input state.
  update(time, delta, input) {
    this.handleMovement(input);
    this.handleAttack(time, input);
    this.updateSwordPosition();

    // gentle flash while invulnerable so it's clear you just got hit
    if (this.isInvulnerable(time)) {
      this.sprite.setAlpha(Math.floor(time / 80) % 2 === 0 ? 0.4 : 1);
    } else {
      this.sprite.setAlpha(1);
    }
  }

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
  }

  handleAttack(time, input) {
    if (input.attackJustPressed && time >= this.swordReadyAt && !this.swordActive) {
      this.swordActive = true;
      this.swordActiveUntil = time + SWORD_CONFIG.activeMs;
      this.swordReadyAt = time + SWORD_CONFIG.cooldownMs;
      this.swordZone.body.enable = true;
      this.swordSprite.setVisible(true);
    }

    if (this.swordActive && time >= this.swordActiveUntil) {
      this.swordActive = false;
      this.swordZone.body.enable = false;
      this.swordSprite.setVisible(false);
    }
  }

  // Moves the (invisible) sword hitbox and (visible) sword flash to sit
  // just in front of the player, in whichever direction they're facing.
  updateSwordPosition() {
    const offset = this.cfg.size * 0.65;
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
    this.swordSprite.setPosition(sx, sy);
    this.swordSprite.setSize(w, h);
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
