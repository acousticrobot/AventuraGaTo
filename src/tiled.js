// ============================================================================
// TILED HELPERS — small functions for reading a map saved from the Tiled
// editor (assets/maps/<name>.tmj). Used by BootScene.js (to load a map's
// tileset image) and GameScene.js (to build the map and its walls).
// See README.md, "Designing rooms in Tiled", for the whole workflow.
// ============================================================================

// "../sprites/default/tilesets/world.png" -> "world". Tiled writes a
// tileset's image path relative to wherever the map was saved; only the
// file name matters to the game (BootScene.queueTilesetImage()).
export function tilesetBaseName(imagePath) {
  return imagePath.split(/[\\/]/).pop().replace(/\.[^.]+$/, "");
}

// Which tiles block walking: every tile that has the custom property
// `solid` = true on it in the tileset (set once per tile in Tiled's Tileset
// editor — see README). Returns the tile IDs as the map's layers store them
// ("global" IDs: the tile's number within its tileset + the tileset's
// firstgid), ready for TilemapLayer.setCollision().
export function solidTileIds(tilesets) {
  const ids = [];
  (tilesets || []).forEach((tileset) => {
    (tileset.tiles || []).forEach((tile) => {
      const props = tile.properties || [];
      const solid = props.find((p) => p.name === "solid");
      if (solid && solid.value === true) ids.push(tileset.firstgid + tile.id);
    });
  });
  return ids;
}

// Checks a loaded map for the things the game can't handle, and returns a
// list of plain-English problems (each one says how to fix it in Tiled) —
// empty if the map is fine. BootScene.js prints them as soon as the map
// loads; GameScene.js uses the same check to fall back to room1 instead of
// crashing on a map it can't draw. `file` is just for the messages.
export function tiledMapProblems(data, file) {
  const problems = [];
  if (data.infinite) {
    problems.push(`${file} is an "infinite" map — in Tiled, turn off Map Properties → Infinite (or start a new fixed-size map).`);
  }
  const tileLayers = (data.layers || []).filter((layer) => layer.type === "tilelayer");
  if (tileLayers.length === 0) {
    problems.push(`${file} has no tile layers — add one in Tiled (Layer → New → Tile Layer).`);
  }
  tileLayers.forEach((layer) => {
    if (layer.compression) {
      problems.push(
        `${file}, layer "${layer.name}" is compressed (${layer.compression}) — ` +
        `in Tiled, set Map Properties → Tile Layer Format to "CSV" and save again.`
      );
    }
  });
  (data.tilesets || []).forEach((tileset) => {
    if (!tileset.image) {
      problems.push(
        `${file} uses the tileset "${tileset.name || tileset.source}" as a separate file — ` +
        `in Tiled, click the tileset and choose "Embed Tileset", then save again.`
      );
    }
  });
  return problems;
}
