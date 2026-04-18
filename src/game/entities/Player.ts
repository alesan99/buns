import type * as Phaser from "phaser";

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null;
  private readonly speed = 260;
  private readonly jumpVelocity = -620;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "player-bunny");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setSize(34, 34);
    this.sprite.setOffset(7, 11);
    this.cursors = scene.input.keyboard?.createCursorKeys() ?? null;
  }

  update() {
    if (!this.cursors) return;

    const left = this.cursors.left?.isDown;
    const right = this.cursors.right?.isDown;
    const jumpPressed = this.cursors.up?.isDown || this.cursors.space?.isDown;

    if (left) {
      this.sprite.setVelocityX(-this.speed);
    } else if (right) {
      this.sprite.setVelocityX(this.speed);
    } else {
      this.sprite.setVelocityX(0);
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
    if (jumpPressed && body?.blocked?.down) {
      this.sprite.setVelocityY(this.jumpVelocity);
    }
  }
}
