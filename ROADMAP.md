# Roadmap - A Aventura da Gata e do Tornado

## Ordered Wishlist

- sprites - add idle animations and test
- sprites - color tiles
- sprites - color sprites
- bugfix - don't reset the heart when moving into a new room
- bugfix - don't allow monsters to leave the screen if there is a walkable tile on the boarder.
- Feature - User Interface
- Feature - Start Screen
- Feature - New Items
- Feature - NPCs
- Feature - Enemy Attack Triggers
- Feature - Game Config Files
- Feature - Enhanced Tiles

### Asset Development

Asset Development can continue outside of game development, and requires minimal coding, at most additional config added to spriteConfig or mapData

- Monsters: more monsters with more animations

### Features

#### Multiple rooms @done

- Allow for multiple rooms
- Each room can have several exits
- Each room can have several starting points, including one default
- Each exit in configured to enter a particular starting point in another room
- Each room has it's own mapData.js file
- Probably need to move mapData files into their own directory

**Implementation notes:** rooms live in `src/data/rooms/` (one file per
room: `ROOM_MAP`, `TILE_LEGEND`, `STARTS`, `ENEMY_SPAWNS`, `EXITS`), listed
in `rooms/index.js`. `GameScene.init({ roomId, startId })` reads which room
to build and where to place the player; walking onto an `EXITS` tile calls
`scene.restart({ roomId, startId })` for the destination, with a brief
grace period so you don't instantly bounce back through the door you just
came through. Room state always resets on (re)entry for now (the "always
reset" option we talked about) — revisit once quests/treasure need rooms
to remember things.

The game window is a fixed size (`data/viewport.js`, based on room1) no
matter which room is loaded — a room bigger than that scrolls with the
camera following the player (clamped to the room's own walls); a room
smaller than that is centered on screen instead of pinned to a corner.
Player/tile pixel size never changes between rooms. There are 3 rooms
right now (room1 → room2 → room3, connected north/south) — room1 has two
more unused doorway gaps ready for a room 4.

#### Use Tiled to design tile maps @done

 - Design a workflow. 
 - Allow for the use of tilemaps

 Proposed workflow: 
1. Aseprite 
 - Working with tilemaps export tiles not as single files, but as tilemaps
 - should we export json data?
2. Tiled
 - working within a single project, we can design tilesets (.tsx files) and tilemaps (.tmx)
 - Tiled allows for layers, we can leverage this for the location of sprites and objects (this can come later)
 - Export (what do we export?)
3. Our Project
 - Our project can use assets from Tiled in place of the ROOM_MAP
 - ROOM_MAP can be a default, working exactly as it does now (text based maps, single files for each tile used by filename).
  

**Implementation notes:** a room file can say `export const TILED_MAP = "room4"`
instead of `ROOM_MAP`/`TILE_LEGEND`; the map is `assets/maps/room4.tmj`, saved
straight from Tiled as JSON (no export step) with its tileset **embedded**
(Phaser can't read external `.tsx` files). Tiles are 16x16 and scaled to
`TILE_SIZE`; every tile layer is drawn in order, and any tile whose tileset
entry has the custom property `solid = true` blocks walking. All tiles live in
one image per tileset, `assets/sprites/<theme>/tilesets/<name>.png`, with the
usual theme-then-default fallback (a theme's image must match the default's
size and layout). `STARTS`/`EXITS`/`ENEMY_SPAWNS` stay in the room's `.js` file.
Maps saved with an external tileset, compressed layers or "infinite" are
reported in the console and the room falls back to room1. See `src/tiled.js`,
BootScene's `queueTiledMaps()` and GameScene's `buildTiledRoom()`; the
workflow is in README.md ("Designing rooms in Tiled"). room4 is the first
Tiled room (reached from room1's east doorway); `assets/maps/world.tsx` is the
tileset source with the `solid` flags set.

Not done yet (ideas for later): Tiled object layers for starts/exits/enemy
spawns (one file per room); loading external `.tsx` tilesets so `solid` flags
are defined once for every map; letting a Tiled room be the viewport reference
(`viewport.js` still measures room1's `ROOM_MAP`); a layer property to draw
tiles above the player (tree canopies, roofs).

#### User Interface (UI)

- Add fonts
- Add heart png assets that include 3/4 1/2 and 1/4 hearts
- Add a styled boarder to the game area, and include user interface elements
- Style all game instructions, and include in the boarder

#### Game Config Files

- Allow for multiple games, each with their own config file
- base config will include 
  - starting room 
  - DEFAULT_THEME

#### Start Screen

- Add a start screen
- Include a menu to pick which game to start from
- start menu is populated by the Game Config Files

#### New Items

- New items can be added to the map that the player can acquire
- Coins
- Weapons - attack and range weapons
- Hearts

#### NPCs

- Non combatants that the players can interact with
- New UI element - dialog modal

#### Enemy Attack Triggers

*We only makes wiggleworm_attack, brute_attack_down, etc. available as animations — nothing in Enemy.js triggers one yet.*

- This feature will have an enemy actually perform an attack (a lunge, a projectile, whatever)
- add a new behavior case in Enemy.js deciding when to play it
- additional feature: look for idle animation tags in the json, and use when a character is not moving

#### Enhanced Tiles

How can we add more advanced tiles to the game for a better aesthetic experience? This may require some research and requirements gathering. 

- What are some ways to improve top-down games tiles?
- @done What about wall tiles that connect with end-caps and right angles?
- How about custom tiled areas? For example larger houses or interior details.
- Do we want to add tiles with two surface types? For instance transitional grass/dirt tiles, or grass/water tiles.
- Are there better strategies for tile layers and grids that we would want to implement?
- What would it take to implement a dual grid system, or start using Tiled for mapmaking?
- What about effect that allow us to reuse some assets? A nighttime overlay for instance
- What other lighting effects would be easy with Phaser and could enhance our game?

