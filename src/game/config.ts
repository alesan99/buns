export const TILE_SIZE = 48;

// # = solid tile, C = collectible, P = player spawn, . = empty.
export const LEVEL_LAYOUT: string[] = [
  "................................",
  "................................",
  "................................",
  "............C...................",
  ".......###......................",
  "............................C...",
  "....................####........",
  "....C...........................",
  "########..............######....",
  "................................",
  "................................",
  "################################",
];

export const WORLD_WIDTH_TILES = LEVEL_LAYOUT[0]?.length ?? 1;
export const WORLD_HEIGHT_TILES = LEVEL_LAYOUT.length;

export const WORLD_WIDTH_PX = WORLD_WIDTH_TILES * TILE_SIZE;
export const WORLD_HEIGHT_PX = WORLD_HEIGHT_TILES * TILE_SIZE;
