import type * as Phaser from "phaser";
import {
  OBJECT_COLLECTIBLE,
  OBJECT_NONE,
  OBJECT_SPAWN,
  TILE_EMPTY,
  TILE_SOLID,
  type LevelLayout,
} from "@/game/config";
import { Collectible } from "@/game/entities/Collectible";
import { TileObject } from "@/game/entities/TileObject";

export class TiledWorld {
  readonly solidTiles: Phaser.Physics.Arcade.StaticGroup;
  readonly collectibles: Collectible[] = [];
  readonly collectibleGroup: Phaser.Physics.Arcade.Group;
  readonly worldWidthPx: number;
  readonly worldHeightPx: number;
  spawnPoint = { x: 0, y: 0 };

  constructor(
    private readonly scene: Phaser.Scene,
    layout: LevelLayout,
    private readonly tileSize: number,
  ) {
    this.solidTiles = this.scene.physics.add.staticGroup();
    this.collectibleGroup = this.scene.physics.add.group();

    const widthTiles = layout[0]?.length ?? 1;
    this.worldWidthPx = widthTiles * tileSize;
    this.worldHeightPx = layout.length * tileSize;

    this.build(layout);
  }

  private build(layout: LevelLayout) {
    for (let row = 0; row < layout.length; row += 1) {
      const line = layout[row] ?? [];
      for (let col = 0; col < line.length; col += 1) {
        const cell = line[col] ?? [TILE_EMPTY, OBJECT_NONE];
        const tile = cell[0];
        const object = cell[1];
        const x = col * this.tileSize + this.tileSize / 2;
        const y = row * this.tileSize + this.tileSize / 2;

        if (tile === TILE_SOLID) {
          const tile = new TileObject(this.scene, x, y);
          this.solidTiles.add(tile.sprite);
        }

        if (object === OBJECT_COLLECTIBLE) {
          const collectible = new Collectible(this.scene, x, y);
          this.collectibles.push(collectible);
          this.collectibleGroup.add(collectible.sprite);
        }

        if (object === OBJECT_SPAWN) {
          this.spawnPoint = { x, y };
        }
      }
    }

    if (this.spawnPoint.x === 0 && this.spawnPoint.y === 0) {
      this.spawnPoint = {
        x: this.tileSize * 1.5,
        y: this.tileSize * Math.max(layout.length - 2, 1),
      };
    }
  }
}
