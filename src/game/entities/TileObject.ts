import type * as Phaser from "phaser";

export class TileObject {
  readonly sprite: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  private readonly outlineVisual: Phaser.GameObjects.Image;
  private readonly visual: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, tileSize: number, tileId: number) {
    const frameIndex = Math.max(0, Math.min(5, tileId - 1));
    this.sprite = scene.physics.add.staticImage(x, y, "tiles", frameIndex);
    this.sprite.setDisplaySize(tileSize, tileSize);
    this.sprite.setVisible(false);
    this.sprite.refreshBody();

    this.outlineVisual = scene.add.image(x, y, "tiles", frameIndex);
    this.outlineVisual.setDisplaySize(tileSize * 1.7, tileSize * 1.7);
    this.outlineVisual.setTint(0x444444);
    this.outlineVisual.setDepth(0);

    this.visual = scene.add.image(x, y, "tiles", frameIndex);
    this.visual.setDisplaySize(tileSize * 1.5, tileSize * 1.5);
    this.visual.setDepth(1);
  }

  setVisible(isVisible: boolean) {
    this.outlineVisual.setVisible(isVisible);
    this.visual.setVisible(isVisible);
  }
}
