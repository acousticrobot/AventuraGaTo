import { PLAYER_CONFIG, ATTACK_CONFIG, FRAME_SIZE, DISPLAY_SCALE } from "../data/spriteConfig.js";

// ============================================================================
// PLAYER
// ----------------------------------------------------------------------------
// Everything about controlling the hero lives here: movement, which way
// they're facing, swinging the attack, taking damage, and hearts of health.
//
// The player is a normal Arcade Physics sprite (so it can collide with
// walls), drawn from the player.png sprite sheet and animated using the
// clips BootScene.js defined ("player_walk_down", "player_attack_side", …).
// The attack is a separate invisible physics "zone" that only turns on for a
// few frames when you swing — GameScene checks whether it's overlapping an
// enemy and applies damage if so. The visible attack-swing animation is
// purely cosmetic; the hitbox is what actually does damage.
// ============================================================================

export const FACING = { DOWN: "down", UP: "up", LEFT: "left", RIGHT: "right" };

// The sprite sheet only draws a right-facing "side" pose — left-facing just
// flips it horizontally, so both directions map to the same anim/frame set.
const ANIM_DIR = { down: "down", up: "up", left: "side", right: "side" };

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.cfg = PLAYER_CONFIG;

    this.sprite = scene.physics.add.sprite(x, y, this.cfg.key);
    this.sprite.setScale(DISPLAY_SCALE);
    this.sprite.setCollideWorldBounds(true);
    // Body size/offset are in the sprite's original (un-scaled) frame space;
    // Phaser applies the display scale to them automatically for collisions.
    //
    // The character is drawn in the middle 16x16 of the sheet's canvas. A
    // 16x16 canvas has no padding; a 32x32 canvas (room for sword swings that
    // reach outside the body) has 8px of padding on every side — so the body's
    // offset just has to skip that padding. The canvas size comes from the
    // sheet's JSON (BootScene.registerAtlasFrames records it on the texture).
    const canvas = scene.textures.get(this.cfg.key).customData.canvas
      || { width: FRAME_SIZE, height: FRAME_SIZE };
    const padX = (canvas.width - FRAME_SIZE) / 2;
    const padY = (canvas.height - FRAME_SIZE) / 2;
    this.sprite.body.setSize(10, 13);
    this.sprite.body.setOffset(3 + padX, 3 + padY);
    this.sprite.owner = this; // let collision callbacks get back to this class

    this.facing = FACING.DOWN;
    this.health = this.cfg.maxHealth;
    this.maxHealth = this.cfg.maxHealth;
    this.invulnerableUntil = 0;

    // The attack is a rectangle physics body we move around by hand and
    // only "turn on" (enable) while a swing is active.
    this.attackZone = scene.add.zone(x, y, ATTACK_CONFIG.length, ATTACK_CONFIG.thickness);
    scene.physics.add.existing(this.attackZone);
    this.attackZone.body.enable = false;
    this.attackActive = false;
    this.attackActiveUntil = 0;
    this.attackReadyAt = 0;

    this.updateAnimation(false); // start standing still, facing down
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
    this.updateAttackPosition();
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
    if (input.attackJustPressed && time >= this.attackReadyAt && !this.attackActive) {
      this.attackActive = true;
      this.attackActiveUntil = time + ATTACK_CONFIG.activeMs;
      this.attackReadyAt = time + ATTACK_CONFIG.cooldownMs;
      this.attackZone.body.enable = true;
      this.sprite.play(`player_attack_${ANIM_DIR[this.facing]}`);
    }

    if (this.attackActive && time >= this.attackActiveUntil) {
      this.attackActive = false;
      this.attackZone.body.enable = false;
    }
  }

  // Picks the right walk/idle/attack clip for the current facing + motion.
  // An attack swing always plays out in full (the hitbox is only live for
  // ATTACK_CONFIG.activeMs, but the drawn swing can last longer — e.g. the
  // follow-through); otherwise walk while moving, or when still, play the
  // sheet's idle animation if it has one for this direction. With no idle
  // tag, hold on the first frame of the walk cycle (a clean standing pose).
  updateAnimation(isMoving) {
    this.sprite.setFlipX(this.facing === FACING.LEFT);

    const anims = this.sprite.anims;
    const swinging = anims.isPlaying && anims.currentAnim?.key.startsWith("player_attack_");
    if (this.attackActive || swinging) {
      return; // let the attack animation (started in handleAttack) play out
    }

    const dir = ANIM_DIR[this.facing];
    const walkKey = `player_walk_${dir}`;
    const idleKey = `player_idle_${dir}`;

    if (isMoving) {
      this.sprite.play(walkKey, true); // true = don't restart if already playing
    } else if (this.scene.anims.exists(idleKey)) {
      this.sprite.play(idleKey, true);
    } else if (anims.currentAnim?.key !== walkKey || anims.isPlaying) {
      // No idle art: land on frame 0 of the matching walk cycle and freeze
      // there, rather than mid-stride.
      this.sprite.play(walkKey);
      anims.stop();
    }
  }

  // Moves the (invisible) attack hitbox to sit just in front of the player,
  // in whichever direction they're facing.
  updateAttackPosition() {
    const offset = ATTACK_CONFIG.reach;
    let sx = this.x;
    let sy = this.y;
    let w = ATTACK_CONFIG.length;
    let h = ATTACK_CONFIG.thickness;

    switch (this.facing) {
      case FACING.LEFT:
        sx -= offset; w = ATTACK_CONFIG.thickness; h = ATTACK_CONFIG.length; break;
      case FACING.RIGHT:
        sx += offset; w = ATTACK_CONFIG.thickness; h = ATTACK_CONFIG.length; break;
      case FACING.UP:
        sy -= offset; break;
      case FACING.DOWN:
      default:
        sy += offset; break;
    }

    this.attackZone.setPosition(sx, sy);
    this.attackZone.body.setSize(w, h);
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
