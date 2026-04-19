import type * as Phaser from "phaser";
import { addCoffeeCaffeine } from "@/hooks/useUserStats";

export class Collectible {
  readonly row: number;
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly visual: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, row: number, x: number, y: number) {
    this.row = row;
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
    addCoffeeCaffeine(1);
    this.destroy();
  }

  destroy() {
    this.visual.destroy();
    this.sprite.disableBody(true, true);
  }
}