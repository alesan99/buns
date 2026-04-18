export const TILE_SIZE = 48;
export const WORLD_WIDTH_TILES = 14;
export const WORLD_HEIGHT_TILES = 72;
export const CAMERA_VISIBLE_TILES_ACROSS = 14;

export const TILE_EMPTY = 0;
export const TILE_SOLID = 1;

export const OBJECT_NONE = 0;
export const OBJECT_SPAWN = 1;
export const OBJECT_COLLECTIBLE = 2;

export type TileType = typeof TILE_EMPTY | typeof TILE_SOLID;
export type ObjectType =
  | typeof OBJECT_NONE
  | typeof OBJECT_SPAWN
  | typeof OBJECT_COLLECTIBLE;
export type LevelCell = [TileType, ObjectType];
export type LevelLayout = LevelCell[][];

// cell[0] = tile code, cell[1] = object code
function buildLevelLayout(): LevelLayout {
  const rows: LevelLayout = [];

  for (let row = 0; row < WORLD_HEIGHT_TILES; row += 1) {
    const cells: LevelCell[] = [];
    for (let col = 0; col < WORLD_WIDTH_TILES; col += 1) {
      cells.push([TILE_EMPTY, OBJECT_NONE]);
    }
    rows.push(cells);
  }

  const floorRow = WORLD_HEIGHT_TILES - 1;
  const spawnRow = WORLD_HEIGHT_TILES - 2;
  const spawnCol = 2;

  for (let col = 0; col < WORLD_WIDTH_TILES; col += 1) {
    rows[floorRow][col][0] = TILE_SOLID;
  }

  rows[spawnRow][spawnCol][1] = OBJECT_SPAWN;

  return rows;
}

export const LEVEL_LAYOUT: LevelLayout = buildLevelLayout();

export const WORLD_WIDTH_PX = WORLD_WIDTH_TILES * TILE_SIZE;
export const WORLD_HEIGHT_PX = WORLD_HEIGHT_TILES * TILE_SIZE;
