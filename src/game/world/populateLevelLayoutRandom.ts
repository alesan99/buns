import {
  OBJECT_COLLECTIBLE,
  OBJECT_NONE,
  OBJECT_SPAWN,
  type LevelGrid,
  TILE_SOLID,
} from "@/game/config";

const randInt = (rng: () => number, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

export function populateLevelLayoutRandom(
  layout: LevelGrid,
  rng: () => number = Math.random,
): LevelGrid {
  const height = layout.height;
  const width = layout.width;
  if (height < 4 || width < 4) return layout;

  const floorRow = height - 1;
  const spawnRow = height - 2;

  // Clear non-base cells so repeated calls still produce a fresh random layout.
  for (let row = 0; row < height - 1; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const object = row === spawnRow && layout.getTile(row, col, 1) === OBJECT_SPAWN
        ? OBJECT_SPAWN
        : OBJECT_NONE;
      layout.setTile(row, col, 0);
      layout.setTile(row, col, object, 1);
    }
  }

  // Build a random climb path by placing platform segments every 2-4 rows.
  let row = floorRow - 3;
  while (row > 2) {
    const segmentLength = randInt(rng, 3, 6);
    const maxStart = Math.max(width - segmentLength, 0);
    const startCol = randInt(rng, 0, maxStart);

    for (let col = startCol; col < startCol + segmentLength; col += 1) {
      layout.setTile(row, col, TILE_SOLID);
    }

    // Optional collectible one tile above the platform center.
    const collectibleRow = row - 1;
    if (collectibleRow > 1 && rng() < 0.45) {
      const centerCol = startCol + Math.floor(segmentLength / 2);
      if (layout.getTile(collectibleRow, centerCol, 1) === OBJECT_NONE) {
        layout.setTile(collectibleRow, centerCol, OBJECT_COLLECTIBLE, 1);
      }
    }

    row -= randInt(rng, 2, 4);
  }

  return layout;
}