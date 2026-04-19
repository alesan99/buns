import type * as Phaser from "phaser";
import {
  type LevelGrid,
  OBJECT_COLLECTIBLE,
  OBJECT_SPAWN,
  TILE_EMPTY,
} from "@/game/config";
import { Collectible } from "@/game/entities/Collectible";
import { TileObject } from "@/game/entities/TileObject";

const CHUNK_HEIGHT = 50;
const GENERATE_AHEAD_TILES = 20;
const DESPAWN_BELOW_TILES = 70;

const randInt = (rng: () => number, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

// ── Noise helpers ─────────────────────────────────────────────────────────────

function fract(n: number): number {
  return n - Math.floor(n);
}

function valueNoise(x: number, seed: number): number {
  const xi = Math.floor(x);
  const xf = x - xi;
  const h0 = fract(Math.sin((xi + seed) * 127.1) * 43758.545);
  const h1 = fract(Math.sin((xi + 1 + seed) * 127.1) * 43758.545);
  const t = xf * xf * (3 - 2 * xf);
  return h0 + (h1 - h0) * t;
}

function fbm(x: number, seed: number, octaves = 3): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1.0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * valueNoise(x * frequency, seed + i * 31);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

function gaussian(distance: number, sigma: number): number {
  return Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

// Derive a deterministic seed for a given chunk index so each chunk gets
// a fresh noise curve that can never degenerate over long play sessions.
function chunkSeed(baseSeed: number, chunkIndex: number): number {
  return fract(Math.sin((baseSeed + chunkIndex * 127.1) * 43758.545)) * 1000;
}

export class TiledWorld {
  private readonly tileObjects: TileObject[] = [];
  readonly solidTiles: Phaser.Physics.Arcade.StaticGroup;
  readonly collectibles: Collectible[] = [];
  readonly collectibleGroup: Phaser.Physics.Arcade.Group;
  readonly worldWidthPx: number;
  readonly worldHeightPx: number;
  private minGeneratedRow = 0;
  private readonly maxGeneratedRow: number;
  spawnPoint = { x: 0, y: 0 };

  // Stable base seed for the whole session — all chunk seeds derive from this.
  private readonly baseSeed: number = Math.random() * 1000;

  // Tracks the topmost occupied row per column across chunks so gap
  // enforcement works across chunk boundaries. Expired lazily per chunk.
  private readonly topOccupiedRow = new Map<number, number>();

  constructor(
    private readonly scene: Phaser.Scene,
    layout: LevelGrid,
    private readonly tileSize: number,
    private readonly options?: {
      forcedGeneratedTileId?: number;
    },
  ) {
    this.solidTiles = this.scene.physics.add.staticGroup();
    this.collectibleGroup = this.scene.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    const widthTiles = layout.width;
    this.worldWidthPx = widthTiles * tileSize;
    this.worldHeightPx = layout.height * tileSize;
    this.maxGeneratedRow = layout.height - 1;

    this.build(layout);
  }

  get worldTopY(): number {
    return this.minGeneratedRow * this.tileSize;
  }

  get worldBottomY(): number {
    return this.worldHeightPx;
  }

  private createTile(row: number, col: number, tileId: number) {
    const x = col * this.tileSize + this.tileSize / 2;
    const y = row * this.tileSize + this.tileSize / 2;
    const tileObject = new TileObject(this.scene, row, x, y, this.tileSize, tileId);
    this.solidTiles.add(tileObject.sprite);
    this.tileObjects.push(tileObject);
  }

  private createCollectible(row: number, col: number) {
    const x = col * this.tileSize + this.tileSize / 2;
    const y = row * this.tileSize + this.tileSize / 2;
    const collectible = new Collectible(this.scene, row, x, y);
    this.collectibles.push(collectible);
    this.collectibleGroup.add(collectible.sprite);
  }

  private build(layout: LevelGrid) {
    for (let row = 0; row < layout.height; row += 1) {
      for (let col = 0; col < layout.width; col += 1) {
        const tile = layout.getTile(row, col);
        const object = layout.getTile(row, col, 1);

        if (tile !== TILE_EMPTY) {
          this.createTile(row, col, Number(tile));
        }

        if (object === OBJECT_COLLECTIBLE) {
          this.createCollectible(row, col);
        }

        if (object === OBJECT_SPAWN) {
          const x = col * this.tileSize + this.tileSize / 2;
          const y = row * this.tileSize + this.tileSize / 2;
          this.spawnPoint = { x, y };
        }
      }
    }

    if (this.spawnPoint.x === 0 && this.spawnPoint.y === 0) {
      this.spawnPoint = {
        x: this.tileSize * 1.5,
        y: this.tileSize * Math.max(layout.height - 6, 1),
      };
    }
  }

  private generateRowsAbove(startRowInclusive: number, endRowInclusive: number) {
    const width = Math.floor(this.worldWidthPx / this.tileSize);

    // Each call gets its own seed derived from its absolute row position so
    // the same chunk always produces the same tiles (deterministic), and
    // different chunks always produce different noise curves (no degeneration).
    const chunkIndex = Math.abs(Math.floor(startRowInclusive / CHUNK_HEIGHT));
    const seed = chunkSeed(this.baseSeed, chunkIndex);

    // Expire topOccupiedRow entries that are too far below this chunk to matter.
    const gapWindow = CHUNK_HEIGHT * 2;
    for (const [col, occupiedRow] of this.topOccupiedRow) {
      if (occupiedRow > endRowInclusive + gapWindow) {
        this.topOccupiedRow.delete(col);
      }
    }

    const getTop = (col: number): number =>
      this.topOccupiedRow.get(col) ?? endRowInclusive + 1;

    // ── Tuning ──────────────────────────────────────────────────────────────
    const hSigma         = width * 0.09;
    const hThreshold     = 0.35;
    const maxThickness   = 4;
    const vSigma         = 5;
    const warpAmp        = 4;
    const warpFreq       = 0.3;
    const collectibleChance = 0.4;

    // Walk upward through the chunk placing one platform per pass.
    // Step size is fBM-modulated so spacing is organic, not uniform.
    let row = endRowInclusive - 2;
    let passIndex = 0;
    let prevCenterCol = -1;

    while (row >= startRowInclusive) {
      const noiseX = passIndex * 1.8;

      // centerCol from fBM — well-behaved because noiseX never exceeds
      // chunkSize * 1.8 before the seed resets on the next chunk.
      let centerCol = Math.round(fbm(noiseX, seed) * (width - 1));

      // Enforce minimum horizontal distance from previous platform.
      if (prevCenterCol !== -1) {
        const minOffset = Math.floor(width * 0.25);
        if (Math.abs(centerCol - prevCenterCol) < minOffset) {
          centerCol = prevCenterCol > width / 2
            ? randInt(Math.random, 0, Math.floor(width * 0.4))
            : randInt(Math.random, Math.floor(width * 0.6), width - 1);
        }
      }

      prevCenterCol = centerCol;
      const platformTile = this.options?.forcedGeneratedTileId ?? randInt(Math.random, 1, 3);
      let collectibleRow = row - 1;

      for (let col = 0; col < width; col += 1) {
        // Horizontal Gaussian with fBM-warped column position.
        const colWarp = fbm(col * 0.8, seed) * 2 - 1;
        const warpedCol = col + colWarp * 3;
        const hWeight = gaussian(warpedCol - centerCol, hSigma);
        if (hWeight < hThreshold) continue;

        // Round cross-section: edge columns are thinner than the center.
        const colThickness = Math.max(
          1,
          Math.round(maxThickness * Math.pow(hWeight, 0.5) + maxThickness * 0.3 * Math.pow(hWeight, 1.5)),
        );

        // Surface warp: slightly uneven roofline.
        const warpNoise = fbm(col * warpFreq, seed + passIndex * 17);
        const warpOffset = Math.round((warpNoise - 0.5) * 2 * warpAmp);
        const surfaceRow = row + warpOffset;

        for (let depth = 0; depth < colThickness; depth += 1) {
          const tileRow = surfaceRow + depth;
          if (tileRow > endRowInclusive || tileRow < startRowInclusive) continue;

          const vWeight = gaussian(depth, vSigma);
          if (vWeight < 0.2) continue;

          // Gap enforcement: at least 1 empty row between platforms.
          if (tileRow >= getTop(col) - 1) continue;

          this.createTile(tileRow, col, platformTile);

          if (tileRow < getTop(col)) {
            this.topOccupiedRow.set(col, tileRow);
          }
        }

        if (col === centerCol) {
          const cWarp = Math.round((fbm(col * warpFreq, seed + passIndex * 17) - 0.5) * 2 * warpAmp);
          collectibleRow = row + cWarp - 1;
        }
      }

      // Collectible above platform peak.
      if (collectibleRow >= startRowInclusive && Math.random() < collectibleChance) {
        this.createCollectible(collectibleRow, centerCol);
      }

      // fBM-modulated vertical step — organic spacing, never degenerates.
      const stepNoise = fbm(noiseX + 99, seed);
      const step = Math.max(2, Math.round(2 + stepNoise * 2));
      row -= step;
      passIndex += 1;
    }
  }

  private ensureGeneratedAbove(camera: Phaser.Cameras.Scene2D.Camera) {
    const generateTriggerY = this.worldTopY + GENERATE_AHEAD_TILES * this.tileSize;
    if (camera.worldView.top > generateTriggerY) {
      return;
    }

    const newTopRow = this.minGeneratedRow - CHUNK_HEIGHT;
    this.generateRowsAbove(newTopRow, this.minGeneratedRow - 1);
    this.minGeneratedRow = newTopRow;
  }

  private pruneBelow(camera: Phaser.Cameras.Scene2D.Camera) {
    const despawnY = camera.worldView.bottom + DESPAWN_BELOW_TILES * this.tileSize;

    for (let i = this.tileObjects.length - 1; i >= 0; i -= 1) {
      const tileObject = this.tileObjects[i];
      if (tileObject.sprite.y <= despawnY) continue;
      tileObject.destroy();
      this.tileObjects.splice(i, 1);
    }

    for (let i = this.collectibles.length - 1; i >= 0; i -= 1) {
      const collectible = this.collectibles[i];
      if (!collectible.sprite.active || collectible.sprite.y <= despawnY) continue;
      collectible.destroy();
      this.collectibles.splice(i, 1);
    }
  }

  private syncPhysicsBounds() {
    const top = this.worldTopY;
    const height = Math.max(this.tileSize, this.worldBottomY - top);
    this.scene.physics.world.setBounds(0, top, this.worldWidthPx, height);
  }

  updateStreaming(camera: Phaser.Cameras.Scene2D.Camera) {
    this.ensureGeneratedAbove(camera);
    this.pruneBelow(camera);
    this.syncPhysicsBounds();
  }

  updateTileVisibility(camera: Phaser.Cameras.Scene2D.Camera) {
    const view = camera.worldView;
    const pad = this.tileSize;

    for (const tileObject of this.tileObjects) {
      const sprite = tileObject.sprite;
      const isVisible =
        sprite.x + pad >= view.x &&
        sprite.x - pad <= view.right &&
        sprite.y + pad >= view.y &&
        sprite.y - pad <= view.bottom;

      tileObject.setVisible(isVisible);
    }
  }
}