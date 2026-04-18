import type * as Phaser from "phaser";

export class Collectible {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "collectible-carrot");
    this.sprite.setImmovable(true);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      body.allowGravity = false;
    }

    scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 8,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  collect() {
    this.sprite.disableBody(true, true);
  }
}
