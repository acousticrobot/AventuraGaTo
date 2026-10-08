# Roadmap - A Aventura da Gata e do Tornado

## Ordered Wishlist

What order should we add new features and enhancements to the game? Kids get to vote on their favorites and learn about the development cycle.

- Feature - Multiple rooms @done
- bugfix - don't allow monsters to leave the screen if there is a walkable tile on the boarder.
- Feature - User Interface
- Feature - Start Screen
- Feature - New Items
- Feature - NPCs
- Feature - Enemy Attack Triggers
- Feature - Game Config Files
- Feature - Enhanced Tilesx

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

