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
export type LevelLayer = 0 | 1;
export type LevelValue = TileType | ObjectType;

export class LevelGrid {
  private readonly rows: LevelLayout;
  readonly width: number;
  readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.rows = [];

    for (let row = 0; row < height; row += 1) {
      const cells: LevelCell[] = [];
      for (let col = 0; col < width; col += 1) {
        cells.push([TILE_EMPTY, OBJECT_NONE]);
      }
      this.rows.push(cells);
    }
  }

  getTile(row: number, col: number, layer: LevelLayer = 0): LevelValue {
    const cell = this.rows[row]?.[col];
    if (!cell) return layer === 0 ? TILE_EMPTY : OBJECT_NONE;
    return cell[layer];
  }

  setTile(row: number, col: number, value: LevelValue, layer: LevelLayer = 0): void {
    const cell = this.rows[row]?.[col];
    if (!cell) return;

    if (layer === 0) {
      cell[0] = value as TileType;
      return;
    }

    cell[1] = value as ObjectType;
  }

  toLayout(): LevelLayout {
    return this.rows;
  }
}

// cell[0] = tile code, cell[1] = object code
export function createBaseLevelLayout(): LevelGrid {
  const grid = new LevelGrid(WORLD_WIDTH_TILES, WORLD_HEIGHT_TILES);

  const floorRow = WORLD_HEIGHT_TILES - 1;
  const spawnRow = WORLD_HEIGHT_TILES - 2;
  const spawnCol = 2;

  for (let col = 0; col < WORLD_WIDTH_TILES; col += 1) {
    grid.setTile(floorRow, col, TILE_SOLID);
  }

  grid.setTile(spawnRow, spawnCol, OBJECT_SPAWN, 1);

  return grid;
}

export const WORLD_WIDTH_PX = WORLD_WIDTH_TILES * TILE_SIZE;
export const WORLD_HEIGHT_PX = WORLD_HEIGHT_TILES * TILE_SIZE;
