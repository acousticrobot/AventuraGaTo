# A Aventura da Gata e do Tornado

A tiny top-down adventure game, built with [Phaser 3](https://phaser.io), in
the spirit of the original *Legend of Zelda*: one room, a sword, a couple of
enemies, walls and trees you bump into, hearts for health, and a little
animated hero and cast of enemies drawn as 16x16 pixel art. No build tools,
no install step — just open it and play.

## Running it

Because the game loads its own files with `import`/`export` (ES modules),
your browser won't run it from a plain double-clicked `index.html` — it
needs to come from a tiny local web server. That's normal for basically all
web games, and it takes one command:

```
cd zelda-prototype
python3 -m http.server 8000
```

(No Python? `npx serve .` works the same way if you have Node.js installed.)

Then open **http://localhost:8000** in your browser.

**Controls:** Arrow keys or WASD to move. Space or Z to swing your sword.
If you run out of hearts, press R to try again.

## How the project is organized

```
zelda-prototype/
  index.html              ← loads Phaser and starts the game
  lib/phaser.min.js       ← the Phaser game engine (vendored so it works offline)
  assets/
    sprites/
      player.png          ← ⭐ the hero's animation frames — very kid-editable
      slime.png           ← ⭐ slime's animation frames
      octorok.png         ← ⭐ octorok's animation frames
  tools/
    generate_sprites.py   ← the Python script that DREW the placeholder art above
                             (not part of the game — a one-time art generator;
                             see "Drawing your own pixel-art sprites" below)
  src/
    main.js               ← game window setup (size, zoom, physics)
    scenes/
      BootScene.js        ← loads the sprite sheets, draws tiles/hearts, defines animations
      GameScene.js        ← builds the room, spawns everyone, runs the main loop
    entities/
      Player.js           ← movement, facing direction, sword swing, health
      Enemy.js            ← enemy AI ("wander" and "chase" behaviors)
    data/
      mapData.js          ← ⭐ THE ROOM LAYOUT — most kid-editable file
      spriteConfig.js      ← ⭐ speed, health, damage, animation frame rates
```

The files marked ⭐ are deliberately the easiest to play with and the
safest to break (worst case, undo your change or copy from this README).
Everything else is the "engine room" — the code that makes those files come
to life.

## Things your kids can change right now, no coding required

Open `src/data/mapData.js` in any text editor.

**Redesign the room.** `ROOM_MAP` is just rows of letters — one letter per
tile. `W` is wall, `.` is grass, `T` is a tree, `~` is water. Draw a new
room using those four letters (every row has to stay the same length!),
save, and refresh the browser. This is basically drawing a picture with a
keyboard.

**Move the enemies, or add more.** `ENEMY_SPAWNS` is a list of `{ type, row,
col }`. Change the `row`/`col` to move one, copy a line to add another, or
delete a line to remove one. `type` can be `"slime"` or `"octorok"` (defined
in `spriteConfig.js`).

Then open `src/data/spriteConfig.js`:

**Change how things feel to play.** You can change `speed` (how fast
something moves), `health` (how many sword hits it takes to defeat),
`contactDamage` (how much it hurts the player to touch it), and the
`walkFrameRate`/`attackFrameRate`/`animFrameRate` numbers (how fast the
animations play — higher is faster/twitchier, lower is slower/floatier).

**Change how things *look*** — that's real pixel art now, in
`assets/sprites/`, and it's the best next thing to hand your kids. See the
next section.

## Drawing your own pixel-art sprites

Every character (the hero, the slime, the octorok) is drawn from a sprite
sheet: one PNG image in `assets/sprites/` that's really a grid of 16x16
pixel squares, one per animation frame, read left-to-right then top-to-bottom.
The game shows them on screen at 2x size (32x32) so they line up with the
room's tiles, but you always *draw* at the true 16x16 size.

This is the single best task to hand your kids, in [Piskel](https://www.piskelapp.com/)
(free, runs in the browser, has a spritesheet import/export mode built for
exactly this) or any other pixel art tool that can export a PNG grid of
fixed-size frames:

1. Open the existing sheet (say `assets/sprites/player.png`) in Piskel as a
   spritesheet import, telling it the frames are 16x16.
2. Redraw any frame — change hair color, add a hat, whatever. You don't have
   to touch every frame at once; even recoloring just the "down" walk row
   is a fun first project.
3. Export back to a PNG grid at the *same* 16x16-per-frame size and the same
   number of rows/columns, and save it over the original file (same name,
   same folder).
4. Refresh the browser. That's it — nothing else needs to change, because
   the game only cares about *which frame index* belongs to which animation,
   not how that frame was drawn.

**The frame grid, so you know what goes where:**

`player.png` is 4 columns × 6 rows:
- Row 0/1/2 = walking, facing down / up / sideways (4 frames each — frame 0
  is also the "standing still" pose)
- Row 3/4/5 = sword swing, facing down / up / sideways (4 frames each)
- "Sideways" is always drawn facing **right** — the game automatically
  flips it for left-facing movement, so there's no separate left-facing row
  to draw.

`octorok.png` is 4 columns × 3 rows: walking down / up / sideways, same
flip-for-left trick as the player.

`slime.png` is 4 columns × 1 row: a single squish/stretch loop that plays
no matter which way the slime is drifting (it's round — it doesn't really
have a "facing side").

These row/column assignments live in `src/data/spriteConfig.js`
(`PLAYER_WALK_ROWS`, `PLAYER_ATTACK_ROWS`, `OCTOROK_WALK_ROWS`) if you ever
want to reorganize the sheet layout itself, and `src/scenes/BootScene.js` is
where those rows get turned into named animations.

Want to design a brand new creature from scratch instead of editing the
placeholder? Draw a fresh 16x16-per-frame PNG in the same grid shape, drop
it in `assets/sprites/`, point a new entry in `ENEMY_TYPES` at it (see
`src/data/spriteConfig.js`), and it'll walk, wander/chase, and take damage
exactly like the existing enemies.

(The placeholder art itself was generated by `tools/generate_sprites.py`, a
small Python script — not something you need to run, but it's there to read
if you're curious how the current frames were built.)

## Things that involve a little actual coding (good next step for the 11-year-old)

- **A new enemy behavior.** Open `src/entities/Enemy.js` and look at the
  `updateBehavior()` method — it's a `switch` statement with `"wander"` and
  `"chase"`. Try adding a `"flee"` behavior that runs away from the player
  instead of chasing.
- **A new tile type.** Add a letter to `TILE_LEGEND` in `mapData.js` (say,
  `"S"` for sand — walkable, different color), then use it in `ROOM_MAP`.
- **Tune the sword.** `SWORD_CONFIG` in `spriteConfig.js` controls how long
  the sword stays out and how often you can swing — try making it swing
  faster or hit harder.

## Roadmap — where this could go next

This prototype is deliberately just *one room*. The natural next steps, in
roughly the order they build on each other:

1. **A second room + screen transitions.** Classic Zelda is really a grid of
   rooms; walking off one edge of the screen loads the next room. This is
   the single biggest step toward "it feels like Zelda."
2. **Items.** A key that opens a locked door (a `'D'` tile that turns into
   `.` when you have a key), a heart container that raises max health, a
   pushable block.
3. **A simple inventory / HUD icon** for whatever item you just picked up.
4. **A boss room** with a tougher enemy and a locked door that only opens
   once it's defeated.
5. **Sound effects** for the sword swing, taking damage, and defeating an
   enemy (Phaser's audio support is simple; freesound.org has kid-safe
   effects to start from).

Happy building!
