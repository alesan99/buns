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

  constructor(
    private readonly scene: Phaser.Scene,
    layout: LevelGrid,
    private readonly tileSize: number,
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
    for (let row = startRowInclusive; row <= endRowInclusive; row += 1) {
      const width = this.worldWidthPx / this.tileSize;
      const platformCount = randInt(Math.random, 1, 2);

      for (let i = 0; i < platformCount; i += 1) {
        const length = randInt(Math.random, 3, 6);
        const startCol = randInt(Math.random, 0, Math.max(0, width - length));
        const tileId = randInt(Math.random, 1, 3);

        for (let col = startCol; col < startCol + length; col += 1) {
          this.createTile(row, col, tileId);
        }

        if (Math.random() < 0.35) {
          const collectibleCol = startCol + Math.floor(length / 2);
          this.createCollectible(row - 1, collectibleCol);
        }
      }
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
