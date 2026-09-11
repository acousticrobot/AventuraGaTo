// ============================================================================
// GAME CONFIG — options about the game itself, not any one room or
// character. The natural home for more of these later (a starting room, a
// default theme, etc. — see ROADMAP.md's "Game Config Files" idea).
// ============================================================================

export const GAME_CONFIG = {
  // Whether the row,col debug overlay is on when the game boots. Press G
  // any time during play to toggle it — this only sets the STARTING state;
  // see GameScene.js buildInput()/toggleDebug().
  debugStart: false,
};
