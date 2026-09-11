import { DISPLAY_SCALE } from "../data/spriteConfig.js";

// ============================================================================
// ENEMY
// ----------------------------------------------------------------------------
// A small, reusable enemy class. What an enemy looks like and how tough it
// is comes from ENEMY_TYPES in spriteConfig.js — this file only knows how
// to run two simple "behavior scripts":
//
//   "wander" — pick a random direction, walk that way for a bit, repeat.
//   "chase"  — same as wander, but if the player gets close enough, beeline
//              straight at them instead.
//
// Animation: an enemy with `directional: true` (like the seeker) plays a
// down/up/side walk clip that follows its current velocity, flipping
// horizontally for leftward movement — the same trick Player.js uses. An
// enemy with `directional: false` (like the slime) just plays one looping
// animation no matter which way it's moving, since a round blob doesn't
// really have a "facing side."
//
// Want a new kind of enemy? Add an entry to ENEMY_TYPES with a `behavior`
// of "wander" or "chase" and it'll just work. Want a genuinely new behavior
// (patrols a path, shoots something, runs away at low health)? Add another
// `case` in updateBehavior() below.
// ============================================================================

export default class Enemy {
  constructor(scene, x, y, cfg) {
    this.scene = scene;
    this.cfg = cfg;

    this.sprite = scene.physics.add.sprite(x, y, cfg.key);
    this.sprite.setScale(DISPLAY_SCALE);
    this.sprite.body.setSize(9, 9);
    this.sprite.body.setOffset(3.5, 5);
    this.sprite.owner = this;

    this.health = cfg.health;
    this.nextDecisionAt = 0;
    this.invulnerableUntil = 0;
    this.alive = true;
    this.facingDir = "down"; // only meaningful for directional enemies

    if (cfg.directional) {
      this.sprite.play(`${cfg.key}_walk_${this.facingDir}`);
      this.sprite.anims.stop(); // start on a standing frame, not mid-stride
    } else {
      this.sprite.play(`${cfg.key}_idle`);
    }
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  update(time, delta, player) {
    if (!this.alive) return;

    // Briefly freeze movement right after being hit, so knockback reads clearly.
    if (time < this.invulnerableUntil) {
      this.sprite.setAlpha(Math.floor(time / 60) % 2 === 0 ? 0.3 : 1);
      return;
    }
    this.sprite.setAlpha(1);

    this.updateBehavior(time, player);
    if (this.cfg.directional) this.updateDirectionalAnimation();
  }

  updateBehavior(time, player) {
    switch (this.cfg.behavior) {
      case "chase": {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (dist <= this.cfg.chaseRange) {
          const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
          this.sprite.setVelocity(Math.cos(angle) * this.cfg.speed, Math.sin(angle) * this.cfg.speed);
          return;
        }
        this.wander(time);
        return;
      }
      case "wander":
      default:
        this.wander(time);
    }
  }

  wander(time) {
    if (time >= this.nextDecisionAt) {
      // Every so often, pick a new random direction (including "stand still").
      const choices = [
        { x: 0, y: 0 },
        { x: 1, y: 0 }, { x: -1, y: 0 },
        { x: 0, y: 1 }, { x: 0, y: -1 },
      ];
      const dir = Phaser.Utils.Array.GetRandom(choices);
      this.sprite.setVelocity(dir.x * this.cfg.speed, dir.y * this.cfg.speed);
      this.nextDecisionAt = time + Phaser.Math.Between(900, 2200);
    }
  }

  // Picks the walk/idle clip that matches this enemy's current velocity,
  // the same "which axis wins" logic Player.js uses for its own facing.
  updateDirectionalAnimation() {
    const { x: vx, y: vy } = this.sprite.body.velocity;
    const isMoving = Math.abs(vx) > 1 || Math.abs(vy) > 1;

    if (isMoving) {
      if (Math.abs(vx) >= Math.abs(vy)) {
        this.facingDir = "side";
        this.sprite.setFlipX(vx < 0);
      } else {
        this.facingDir = vy > 0 ? "down" : "up";
      }
    }

    const key = `${this.cfg.key}_walk_${this.facingDir}`;
    if (isMoving) {
      this.sprite.play(key, true);
    } else if (this.sprite.anims.currentAnim?.key !== key || this.sprite.anims.isPlaying) {
      this.sprite.play(key);
      this.sprite.anims.stop();
    }
  }

  // Returns true if this hit killed the enemy.
  takeDamage(amount, time, knockbackFrom) {
    if (time < this.invulnerableUntil) return false;

    this.health -= amount;
    this.invulnerableUntil = time + 300;

    if (knockbackFrom) {
      const angle = Phaser.Math.Angle.Between(knockbackFrom.x, knockbackFrom.y, this.x, this.y);
      this.sprite.setVelocity(Math.cos(angle) * this.cfg.knockback, Math.sin(angle) * this.cfg.knockback);
    }

    if (this.health <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  die() {
    this.alive = false;
    this.sprite.body.enable = false;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 0.2,
      duration: 200,
      onComplete: () => this.sprite.destroy(),
    });
  }
}
