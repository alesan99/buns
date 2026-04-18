import type * as Phaser from "phaser";
import {
  type LevelGrid,
  OBJECT_COLLECTIBLE,
  OBJECT_SPAWN,
  TILE_EMPTY,
} from "@/game/config";
import { Collectible } from "@/game/entities/Collectible";
import { TileObject } from "@/game/entities/TileObject";

export class TiledWorld {
  private readonly tileObjects: TileObject[] = [];
  readonly solidTiles: Phaser.Physics.Arcade.StaticGroup;
  readonly collectibles: Collectible[] = [];
  readonly collectibleGroup: Phaser.Physics.Arcade.Group;
  readonly worldWidthPx: number;
  readonly worldHeightPx: number;
  spawnPoint = { x: 0, y: 0 };

  constructor(
    private readonly scene: Phaser.Scene,
    layout: LevelGrid,
    private readonly tileSize: number,
  ) {
    this.solidTiles = this.scene.physics.add.staticGroup();
    this.collectibleGroup = this.scene.physics.add.group();

    const widthTiles = layout.width;
    this.worldWidthPx = widthTiles * tileSize;
    this.worldHeightPx = layout.height * tileSize;

    this.build(layout);
  }

  private build(layout: LevelGrid) {
    for (let row = 0; row < layout.height; row += 1) {
      for (let col = 0; col < layout.width; col += 1) {
        const tile = layout.getTile(row, col);
        const object = layout.getTile(row, col, 1);
        const x = col * this.tileSize + this.tileSize / 2;
        const y = row * this.tileSize + this.tileSize / 2;

        if (tile !== TILE_EMPTY) {
          const tileObject = new TileObject(this.scene, x, y, this.tileSize, Number(tile));
          this.solidTiles.add(tileObject.sprite);
          this.tileObjects.push(tileObject);
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
        y: this.tileSize * Math.max(layout.height - 2, 1),
      };
    }
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
