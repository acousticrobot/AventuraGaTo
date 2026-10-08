import { ROOMS } from "../data/rooms/index.js";
import {
  ASSET_ROOT, DEFAULT_THEME, FRAME_SIZE,
  PLAYER_CONFIG, PLAYER_WALK_ROWS, PLAYER_ATTACK_ROWS,
  ENEMY_TYPES, ENEMY_WALK_ROWS,
} from "../data/spriteConfig.js";

// ============================================================================
// BOOT SCENE
// ----------------------------------------------------------------------------
// Runs once, before anything else. It loads the pixel-art sprite sheets and
// tile images for the current theme (falling back to the default art
// piece-by-piece when the theme doesn't provide something), builds the
// heart textures, defines every animation, and then hands off to GameScene.
// ============================================================================

// ---- Pick a theme! -----------------------------------------------------
// This should match a folder name under assets/sprites/ (e.g. "gata" for
// assets/sprites/gata/). Each theme only needs to supply the files it wants
// to change — character sheets directly in the folder (player.png, etc.)
// and/or tile images under a tiles/ subfolder (tiles/wall.png, etc.). For
// anything it's missing (the folder doesn't exist, or just one file in it
// is missing), that one asset quietly falls back to assets/sprites/default/
// instead, which is guaranteed to have everything.
// Set this to "" (or DEFAULT_THEME) to always use the default art.
const THEME = "default";
// --------------------------------------------------------------------------

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    // Tracks sprite sheets / tile images currently loading, so a 404 can be
    // retried against the default theme instead of just failing outright.
    //   key (e.g. "player" or "tile_wall") ->
    //     { sheetFile, stage: "theme" | "default", kind: "spritesheet" | "image", tileName? }
    this._pendingSheets = new Map();

    // Tracks the *optional* animation-tag metadata (an Aseprite JSON export)
    // that may sit alongside a sprite sheet. Most sheets won't have one.
    //   metaKey (e.g. "player__meta") -> characterKey (e.g. "player")
    this._pendingMeta = new Map();

    this.load.on("filecomplete", this.handleFileComplete, this);
    this.load.on("loaderror", this.handleLoadError, this);

    this.queueCharacterSheet(PLAYER_CONFIG.key, PLAYER_CONFIG.sheetFile);
    Object.values(ENEMY_TYPES).forEach((cfg) => {
      this.queueCharacterSheet(cfg.key, cfg.sheetFile);
    });

    this.queueTileImages();
  }

  // Queues a character's sprite sheet from THEME (or, if `stage` is passed
  // in as "default", straight from the default theme). Called once per
  // character up front, and again automatically by handleLoadError() if the
  // themed version turns out to be missing.
  queueCharacterSheet(key, sheetFile, stage) {
    if (!stage) {
      stage = THEME && THEME !== DEFAULT_THEME ? "theme" : "default";
    }
    const theme = stage === "theme" ? THEME : DEFAULT_THEME;

    this._pendingSheets.set(key, { sheetFile, stage, kind: "spritesheet" });
    this.load.spritesheet(key, `${ASSET_ROOT}/${theme}/${sheetFile}`, {
      frameWidth: FRAME_SIZE,
      frameHeight: FRAME_SIZE,
    });
  }

  // One plain (non-animated) image per distinct tile name across every
  // room's TILE_LEGEND — e.g. a "W" entry (name: "wall") loads as texture
  // "tile_wall". Every room has its own TILE_LEGEND (see data/rooms/), so
  // we preload the union of all of them here — whichever room the game
  // actually starts in, or transitions to later, its tiles are ready.
  queueTileImages() {
    const tileNames = new Set();
    Object.values(ROOMS).forEach((room) => {
      Object.values(room.TILE_LEGEND).forEach((tile) => tileNames.add(tile.name));
    });
    tileNames.forEach((name) => this.queueTileImage(name));
  }

  // Queues one tile's image from THEME (or "default", same theme/fallback
  // convention as queueCharacterSheet). GameScene always looks the result up
  // as `tile_<name>`, regardless of which theme it actually came from.
  queueTileImage(name, stage) {
    if (!stage) {
      stage = THEME && THEME !== DEFAULT_THEME ? "theme" : "default";
    }
    const theme = stage === "theme" ? THEME : DEFAULT_THEME;
    const key = `tile_${name}`;

    this._pendingSheets.set(key, { sheetFile: `${name}.png`, stage, kind: "image", tileName: name });
    this.load.image(key, `${ASSET_ROOT}/${theme}/tiles/${name}.png`);
  }

  // A sprite sheet finished loading — see if that same theme folder also
  // has a matching <name>.json (an Aseprite export naming each animation's
  // frames). If it does, buildPlayerAnimations()/buildEnemyAnimations()
  // will use it instead of the hardcoded *_ROWS frame numbers. Plain tile
  // images don't have any of this — they're done as soon as they load.
  handleFileComplete(key, type) {
    const pending = this._pendingSheets.get(key);
    if (!pending) return;

    if (pending.kind === "image") {
      this._pendingSheets.delete(key);
      return;
    }
    if (type !== "spritesheet") return;

    const theme = pending.stage === "theme" ? THEME : DEFAULT_THEME;
    const baseName = pending.sheetFile.replace(/\.png$/i, "");
    const metaKey = `${key}__meta`;

    this._pendingMeta.set(metaKey, key);
    this.load.json(metaKey, `${ASSET_ROOT}/${theme}/${baseName}.json`);
    this._pendingSheets.delete(key);
  }

  handleLoadError(file) {
    const pendingSheet = this._pendingSheets.get(file.key);
    if (pendingSheet) {
      if (pendingSheet.stage === "theme") {
        console.warn(
          `AventuraGaTo: theme "${THEME}" has no ${pendingSheet.sheetFile} — ` +
          `using the default art for "${file.key}".`
        );
        if (pendingSheet.kind === "image") {
          this.queueTileImage(pendingSheet.tileName, "default");
        } else {
          this.queueCharacterSheet(file.key, pendingSheet.sheetFile, "default");
        }
      } else {
        console.error(
          `AventuraGaTo: the default theme is missing ${pendingSheet.sheetFile} ` +
          `for "${file.key}" — it won't display correctly.`
        );
        this._pendingSheets.delete(file.key);
      }
      return;
    }

    if (this._pendingMeta.has(file.key)) {
      // No animation-tag JSON for this character/theme — totally normal,
      // it just means we'll animate it using the default frame-grid layout.
      this._pendingMeta.delete(file.key);
    }
  }

  create() {
    this.generateHeartTextures();
    this.registerAtlasFrames(PLAYER_CONFIG.key);
    Object.values(ENEMY_TYPES).forEach((cfg) => this.registerAtlasFrames(cfg.key));
    this.createAnimations();

    this.scene.start("Game");
  }

  // If this character's sheet came with an Aseprite JSON, add its exact
  // per-frame pixel rects as extra named frames on top of the texture's
  // existing 0/1/2/3... grid frames (from the plain frameWidth/frameHeight
  // slicing in queueCharacterSheet). We need these because Aseprite's own
  // frame numbering (what frameTags' from/to refer to) is just a count of
  // however many frames actually exist, packed with no gaps — it does NOT
  // match Phaser's grid-cell numbering once a row has fewer drawn frames
  // than the widest row (e.g. an 8-frame walk cycle next to a 5-frame
  // attack in the same sheet: Aseprite calls the attack's first frame "24",
  // but Phaser's grid calls that same pixel position "24" only if every
  // earlier row was completely full — otherwise the numbers drift apart
  // row by row). Reading each frame's real x/y/w/h from the JSON sidesteps
  // that mismatch entirely, so buildPlayerAnimations()/buildEnemyAnimations()
  // can play back the actual drawn pixels no matter how the rows line up.
  //
  // This is also where we learn each sheet's CANVAS size — how big one
  // animation frame is. Every frame of a character is drawn on the same
  // canvas (16x16 for the old sheets, 32x32 for sheets with room for sword
  // swings that reach outside the 16x16 body), and Aseprite writes that
  // size into the JSON as each frame's `sourceSize`. We stash it on the
  // texture (texture.customData.canvas) so Player.js can line up its
  // collision body with the character in the middle of the canvas.
  // Sheets with no JSON are plain 16x16 grids.
  registerAtlasFrames(key) {
    const texture = this.textures.get(key);
    texture.customData.canvas = { width: FRAME_SIZE, height: FRAME_SIZE };

    const atlasData = this.getAtlasData(key);
    if (!atlasData) return; // no JSON for this sheet — plain grid frames are all there is

    let warnedTrim = false;
    Object.entries(atlasData.frames).forEach(([name, info]) => {
      if (info.trimmed && !warnedTrim) {
        warnedTrim = true;
        console.warn(
          `AventuraGaTo: ${key}.json was exported with "Trim" turned on — the ` +
          `frames get cropped to their pixels and will jump around. Turn Trim ` +
          `off in Aseprite's Export Sprite Sheet dialog.`
        );
      }
      if (texture.has(name)) return;
      const { x, y, w, h } = info.frame;
      texture.add(name, 0, x, y, w, h);
    });

    const first = Object.values(atlasData.frames)[0];
    if (first) {
      const size = first.sourceSize || { w: first.frame.w, h: first.frame.h };
      texture.customData.canvas = { width: size.w, height: size.h };
    }
  }

  // A tag's `from`/`to` are indices into the JSON's own frame list, in the
  // exact order Aseprite wrote them — NOT a row/column position. Object.keys
  // preserves that same order, so slicing it is the correct (and only
  // reliable) way to turn a tag into the actual frame names to play.
  tagFrameNames(atlasData, tag) {
    return Object.keys(atlasData.frames).slice(tag.from, tag.to + 1);
  }

  // Builds an animation's frame list: named frames (from the tag, via the
  // JSON's real pixel data) when a tag was found, otherwise the hardcoded
  // row/column fallback for sheets with no JSON at all.
  animFrames(key, atlasData, tag, fallbackRow) {
    if (tag) {
      return this.anims.generateFrameNames(key, { frames: this.tagFrameNames(atlasData, tag) });
    }
    return this.anims.generateFrameNumbers(key, {
      start: fallbackRow * 4,
      end: fallbackRow * 4 + 3,
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

  // ---- Animation-tag metadata helpers -----------------------------------

  // Returns the parsed <name>.json for this character, or null if that
  // theme's sheet didn't come with one (the common case). This is the raw
  // Aseprite export — an object shaped like { frames: {...}, meta: {...} }
  // — frame tags live at .meta.frameTags, which is what findTag() reads.
  getAtlasData(key) {
    const metaKey = `${key}__meta`;
    return this.cache.json.exists(metaKey) ? this.cache.json.get(metaKey) : null;
  }

  // Looks up one named animation tag (Aseprite calls these "frame tags") by
  // name, case-insensitively, e.g. findTag(atlasData, "downAtk") matches a
  // tag named "downAtk". Returns null if there's no metadata, or no tag
  // with that name — either way, the caller falls back to the hardcoded rows.
  findTag(atlasData, name) {
    const frameTags = atlasData && atlasData.meta && atlasData.meta.frameTags;
    if (!frameTags) return null;
    const wanted = name.toLowerCase();
    return frameTags.find((tag) => tag.name.toLowerCase() === wanted) || null;
  }

  // Every animation used in the game is defined once, here, by name.
  // Player.js and Enemy.js just call sprite.play("player_walk_down") etc.
  createAnimations() {
    this.buildPlayerAnimations();
    this.buildEnemyAnimations();
  }

  buildPlayerAnimations() {
    const key = PLAYER_CONFIG.key;
    const meta = this.getAtlasData(key);
    const DIRS = ["down", "up", "side"];

    // Walking. If the loaded sheet has a tag named "down"/"up"/"side", use
    // its exact frames (however many there are); otherwise fall back to
    // PLAYER_WALK_ROWS' hardcoded 4-frame rows.
    DIRS.forEach((dir) => {
      const tag = this.findTag(meta, dir);
      this.anims.create({
        key: `player_walk_${dir}`,
        frames: this.animFrames(key, meta, tag, PLAYER_WALK_ROWS[dir]),
        frameRate: PLAYER_CONFIG.walkFrameRate,
        repeat: -1,
      });
    });

    // Attack swings. Tag names are "downAtk"/"upAtk"/"sideAtk" — this is the
    // whole reason tag-based lookup exists: two artists can draw their
    // attack rows with a totally different number of frames (or in a
    // different order) and both still animate correctly, as long as their
    // Aseprite tags use these exact names.
    DIRS.forEach((dir) => {
      const tag = this.findTag(meta, `${dir}Atk`);
      this.anims.create({
        key: `player_attack_${dir}`,
        frames: this.animFrames(key, meta, tag, PLAYER_ATTACK_ROWS[dir]),
        frameRate: PLAYER_CONFIG.attackFrameRate,
        repeat: 0,
      });
    });

    // Idle (standing still). Optional: tags named "downIdle"/"upIdle"/
    // "sideIdle". A direction without an idle tag just doesn't get an
    // animation here — Player.js then falls back to freezing on the first
    // frame of that direction's walk cycle, same as before idle existed.
    DIRS.forEach((dir) => {
      const tag = this.findTag(meta, `${dir}Idle`);
      if (!tag) return;
      this.anims.create({
        key: `player_idle_${dir}`,
        frames: this.animFrames(key, meta, tag, 0),
        frameRate: PLAYER_CONFIG.idleFrameRate,
        repeat: -1,
      });
    });
  }

  // Builds every enemy's animation(s) straight from ENEMY_TYPES — add a new
  // entry there (see spriteConfig.js) and it's animated automatically, no
  // changes needed here. `directional` decides the walk/idle shape: a
  // directional enemy (like the seeker) gets a down/up/side walk cycle,
  // exactly like the player's; a non-directional one (like slime or
  // wiggleworm) gets a single looping "idle" clip that plays no matter
  // which way it moves.
  //
  // An attack cycle is always OPTIONAL and always tag-driven — there's no
  // hardcoded fallback row for it (unlike walk/idle), since there's no
  // sensible "default" attack to guess at. It only gets built if the
  // enemy's JSON actually has the tag; otherwise that animation simply
  // doesn't exist yet, same as if the enemy never had one at all. Nothing
  // has to play it — this just makes it available for whenever an enemy
  // behavior wants to trigger one.
  buildEnemyAnimations() {
    Object.values(ENEMY_TYPES).forEach((cfg) => {
      const meta = this.getAtlasData(cfg.key);
      const attackFrameRate = cfg.attackFrameRate || cfg.animFrameRate;

      if (cfg.directional) {
        ["down", "up", "side"].forEach((dir) => {
          const tag = this.findTag(meta, dir);
          this.anims.create({
            key: `${cfg.key}_walk_${dir}`,
            frames: this.animFrames(cfg.key, meta, tag, ENEMY_WALK_ROWS[dir]),
            frameRate: cfg.animFrameRate,
            repeat: -1,
          });
        });

        // Optional: "downAtk"/"upAtk"/"sideAtk" tags, same convention as
        // the player's attack swings.
        ["down", "up", "side"].forEach((dir) => {
          const tag = this.findTag(meta, `${dir}Atk`);
          if (!tag) return;
          this.anims.create({
            key: `${cfg.key}_attack_${dir}`,
            frames: this.animFrames(cfg.key, meta, tag, 0),
            frameRate: attackFrameRate,
            repeat: 0,
          });
        });
      } else {
        const idleTag = this.findTag(meta, "idle");
        this.anims.create({
          key: `${cfg.key}_idle`,
          frames: this.animFrames(cfg.key, meta, idleTag, 0),
          frameRate: cfg.animFrameRate,
          repeat: -1,
        });

        // Optional: a single "Attack" tag (no direction — same idea as idle).
        const attackTag = this.findTag(meta, "attack");
        if (attackTag) {
          this.anims.create({
            key: `${cfg.key}_attack`,
            frames: this.animFrames(cfg.key, meta, attackTag, 0),
            frameRate: attackFrameRate,
            repeat: 0,
          });
        }
      }
    });
  }
}
