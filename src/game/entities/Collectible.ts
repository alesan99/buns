import type * as Phaser from "phaser";

export class Collectible {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly visual: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "coffee");
    this.sprite.setImmovable(true);
    this.sprite.setVisible(false);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      body.setAllowGravity(false);
      body.moves = false;
      body.setSize(24, 24, true);
    }

    this.visual = scene.add.sprite(x, y, "coffee");
    this.visual.setDepth(2);
    this.visual.play("coffee-idle");

    scene.tweens.add({
      targets: this.visual,
      y: y - 8,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  collect() {
    this.visual.destroy();
    this.sprite.disableBody(true, true);
  }
}