import type * as Phaser from "phaser";
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
    layout: string[],
    private readonly tileSize: number,
  ) {
    this.solidTiles = this.scene.physics.add.staticGroup();
    this.collectibleGroup = this.scene.physics.add.group();

    const widthTiles = layout[0]?.length ?? 1;
    this.worldWidthPx = widthTiles * tileSize;
    this.worldHeightPx = layout.length * tileSize;

    this.build(layout);
  }

  private build(layout: string[]) {
    for (let row = 0; row < layout.length; row += 1) {
      const line = layout[row] ?? "";
      for (let col = 0; col < line.length; col += 1) {
        const ch = line[col];
        const x = col * this.tileSize + this.tileSize / 2;
        const y = row * this.tileSize + this.tileSize / 2;

        if (ch === "#") {
          const tile = new TileObject(this.scene, x, y);
          this.solidTiles.add(tile.sprite);
          continue;
        }

        if (ch === "C") {
          const collectible = new Collectible(this.scene, x, y);
          this.collectibles.push(collectible);
          this.collectibleGroup.add(collectible.sprite);
          continue;
        }

        if (ch === "P") {
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
