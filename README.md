# Kingdom of Pixeltopia (Prototype)

A tiny top-down adventure game, built with [Phaser 3](https://phaser.io), in
the spirit of the original *Legend of Zelda*: one room, a sword, a couple of
enemies, walls and trees you bump into, hearts for health. No art files, no
build tools, no install step — just open it and play.

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
  src/
    main.js               ← game window setup (size, zoom, physics)
    scenes/
      BootScene.js        ← draws all the character/tile shapes before the game starts
      GameScene.js        ← builds the room, spawns everyone, runs the main loop
    entities/
      Player.js           ← movement, facing direction, sword swing, health
      Enemy.js            ← enemy AI ("wander" and "chase" behaviors)
    data/
      mapData.js          ← ⭐ THE ROOM LAYOUT — most kid-editable file
      spriteConfig.js      ← ⭐ colors, speed, health, damage — also very kid-editable
```

The two files under `data/` are deliberately the easiest to play with and
the safest to break (worst case, undo your change or copy from this README).
Everything else is the "engine room" — the code that makes those data files
come to life.

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

**Change how things look and feel.** Colors are hex codes like `0x3fa7d6` —
search "hex color picker" online, pick a color, and paste its code in. You
can also change `speed` (how fast something moves), `health` (how many
sword hits it takes to defeat), and `contactDamage` (how much it hurts the
player to touch it).

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
4. **Real sprite art.** Swap the generated colored-block textures for
   hand-drawn ones (Piskel is a free, browser-based pixel art tool that's
   very approachable for kids). `BootScene.js` has notes on exactly where
   this plugs in.
5. **A boss room** with a tougher enemy and a locked door that only opens
   once it's defeated.
6. **Sound effects** for the sword swing, taking damage, and defeating an
   enemy (Phaser's audio support is simple; freesound.org has kid-safe
   effects to start from).

Happy building!
