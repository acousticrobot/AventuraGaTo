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
cd AventuraGaTo
python3 -m http.server 8000
```

(No Python? `npx serve .` works the same way if you have Node.js installed.)

Then open **http://localhost:8000** in your browser.

**Controls:** Arrow keys or WASD to move. Space or Z to swing your sword.
If you run out of hearts, press R to try again.

## How the project is organized

```
AventuraGaTo/
  index.html              ← loads Phaser and starts the game
  lib/phaser.min.js       ← the Phaser game engine (vendored so it works offline)
  assets/
    sprites/
      default/            ← ⭐ the fallback art — always has every asset
        player.png
        slime.png
        octorok.png
      gata/               ← ⭐ a THEME — one kid's own art, drawn in Aseprite
        player.png
        player.json          (tells the game which frames are which animation)
      <your-name>/        ← ⭐ add one of these per kid — see below!
  src/
    main.js               ← game window setup (size, zoom, physics)
    scenes/
      BootScene.js        ← picks the theme, loads sprite sheets (with fallback),
                             draws tiles/hearts, defines animations
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

## Drawing your own pixel-art sprites — one folder per kid

Every character (the hero, the slime, the octorok) is drawn from a sprite
sheet: one PNG image that's really a grid of 16x16 pixel squares, one per
animation frame. The game shows them on screen at 2x size (32x32) so they
line up with the room's tiles, but you always *draw* at the true 16x16 size.

**Themes.** Sprite sheets live in `assets/sprites/<theme>/`, where a "theme"
is just a folder — one per kid, so each of them can have their own art
without touching anyone else's. `assets/sprites/default/` is special: it's
the placeholder art that ships with the game, and it's guaranteed to always
have every file the game needs. Any other theme folder (like `gata/`) only
needs to contain the files it wants to *change* — if a theme is missing a
file entirely (or the whole folder doesn't exist), the game quietly falls
back to that same file in `default/` instead. So a kid can start by adding
just a new `player.png` and nothing else, and everything besides the player
will keep using the placeholder art until they get around to it.

**Picking a theme.** For now (until there's an in-game menu for it), which
theme is active is a single line near the top of `src/scenes/BootScene.js`:

```js
const THEME = "gata";
```

Change the folder name in quotes to switch themes, save, and refresh the
browser. Setting it to `""` (or back to `"default"`) always uses the
placeholder art.

**Starting your own theme:**

1. Make a new folder under `assets/sprites/`, named after you (e.g.
   `assets/sprites/leo/`).
2. Draw a `player.png` (or `slime.png`, `octorok.png` — whichever you want
   to change first) as a 16x16-per-frame grid, using
   [Piskel](https://www.piskelapp.com/) (free, runs in the browser, has a
   spritesheet import/export mode built for exactly this) or any pixel art
   tool that can export a PNG grid of fixed-size frames. Opening the
   matching file in `assets/sprites/default/` as a spritesheet import
   (telling it the frames are 16x16) is the easiest way to see the frame
   grid you need to match.
3. Save it into your folder with the same file name as the one you're
   replacing.
4. Set `THEME` in `BootScene.js` to your folder name and refresh the
   browser.

**The frame grid, if you're drawing plain rows (no animation tags):**

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
want to reorganize the sheet layout itself.

**Drawing in Aseprite instead? You can name your rows and skip the grid
math.** If you draw in [Aseprite](https://www.aseprite.org/) and export a
sprite sheet, it can also export a matching `<name>.json` file (a "JSON
Hash" export) alongside the PNG — for example `player.json` next to
`player.png`, in the same theme folder. If that file uses Aseprite's *frame
tags* to name each animation, the game reads it and uses your tagged frame
ranges instead of the hardcoded row numbers above — which means your rows
don't have to be in any particular order, or even be 4 frames each. Name
your tags exactly (case doesn't matter):

- `player.png` tags: `Down`, `Up`, `Side` (walking), and `DownAtk`, `UpAtk`,
  `SideAtk` (sword swings)
- `octorok.png` tags: `Down`, `Up`, `Side`
- `slime.png` tag: `Wobble`

Any tag you leave out just falls back to that direction's hardcoded row, so
you don't need to tag everything at once. This is exactly how `gata/` was
built — `gata/player.png` was drawn with a completely different row order
than `default/player.png`, and `gata/player.json` is what tells the game
which frames are which.

**A brand new creature from scratch?** Draw a fresh 16x16-per-frame PNG (in
`default/`, since every asset needs to exist there), point a new entry in
`ENEMY_TYPES` at it (see `src/data/spriteConfig.js`), and it'll walk,
wander/chase, and take damage exactly like the existing enemies. Any theme
can then override it the same way as the built-in enemies.

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
