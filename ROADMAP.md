# Roadmap - A Aventura da Gata e do Tornado

## Ordered Wishlist

What order should we add new features and enhancements to the game? Kids get to vote on their favorites and learn about the development cycle.

- asset - Octorock
- asset - Player
- asset - Ground
- asset - Path
- asset - Monsters
- enhancement - change sword to punch (default attack), we will add a sword item later
- bugfix - don't allow monsters to leave the screen if there is a walkable tile on the boarder.
- testing - confirm monster sprites work with json config
- testing - confirm 8x8 other size tiles work too
- testing - what happens with taller tree tiles?
- Feature - Multiple rooms
- Feature - User Interface
- Feature - Game Config Files
- Feature - Start Screen
- Feature - New Items
- Feature - NPCs
- Feature - Enhanced Tiles

### Asset Development

Asset Development can continue outside of game development, and requires minimal coding, at most additional config added to spriteConfig or madData

- Player: Better Default Player sprite
- Octorock: Create default Octorock sprite and rename
- Ground: Create ground (dirt) tiles
- Path: Create directional path tiles
- Monsters: more monsters with more animations

### Features

#### Multiple rooms

- Allow for multiple rooms
- Each room can have several exits
- Each room can have several starting points, including one default
- Each exit in configured to enter a particular starting point in another room
- Each room has it's own mapData.js file
- Probably need to move mapData files into their own directory

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
- Weapons - sword and range weapons
- Hearts

#### NPCs

- Non combatants that the players can interact with
- New UI element - dialoge modal

#### Enhanced Tiles

How can we add more advanced tiles to the game for a better aesthetic experience? This may require some research and requirements gathering. 

- What are some ways to improve top-down games tiles?
- Do we want to add tiles with two surface types? For instance transitional grass/dirt tiles, or grass/water tiles.
- What about wall tiles that connect with endcaps and right angles?
- How about custom tiled areas? For example larger houses or interior details.
- Are there better strategies for tile layers and grids that we would want to implement?
- What about effect that allow us to reuse some assets? A nighttime overlay for instance
- What other lighting effects would be easy with Phaser and could enhance our game?

