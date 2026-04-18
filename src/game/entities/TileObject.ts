import type * as Phaser from "phaser";

export class TileObject {
  readonly sprite: Phaser.Types.Physics.Arcade.ImageWithStaticBody;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.staticImage(x, y, "tile-block");
    this.sprite.refreshBody();
  }
}
