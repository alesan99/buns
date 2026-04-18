import type * as Phaser from "phaser";

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly visual: Phaser.GameObjects.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null;
  private readonly speed = 260;
  private readonly jumpVelocity = -1000;
  private readonly visualOffsetX = 0;
  private readonly visualOffsetY = -30;
  private walkBobTime = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "bun");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setOrigin(0.5, 0.5);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(34, 34, true);
    this.sprite.setVisible(false);

    this.visual = scene.add.sprite(x, y, "bun", 0);
    this.visual.setOrigin(0.5, 0.5);
    this.visual.setScale(0.20);
	this.visual.setDepth(2);
    this.visual.play("bun-stand");
    this.syncVisual(0);

    this.cursors = scene.input.keyboard?.createCursorKeys() ?? null;
  }

  private syncVisual(bobOffsetY = 0) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;

    this.visual.setPosition(
      body.center.x + this.visualOffsetX,
      body.center.y + this.visualOffsetY + bobOffsetY,
    );
  }

  update() {
    if (!this.cursors) return;

    const left = this.cursors.left?.isDown;
    const right = this.cursors.right?.isDown;
    const jumpPressed = this.cursors.up?.isDown || this.cursors.space?.isDown;

    if (left) {
      this.sprite.setVelocityX(-this.speed);
      this.visual.setFlipX(true);
    } else if (right) {
      this.sprite.setVelocityX(this.speed);
      this.visual.setFlipX(false);
    } else {
      this.sprite.setVelocityX(0);
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
    const isGrounded = body?.blocked?.down ?? false;

    if (jumpPressed && isGrounded) {
      this.sprite.setVelocityY(this.jumpVelocity);
    }

    // Animation state machine: jump while airborne, run while moving on ground, stand otherwise.
    if (!isGrounded) {
      if (this.visual.anims.currentAnim?.key !== "bun-jump") {
        this.visual.play("bun-jump", true);
      }
      this.syncVisual(0);
      return;
    }

    const movingHorizontally = Math.abs(this.sprite.body?.velocity.x ?? 0) > 1;
    if (movingHorizontally) {
      const dt = this.sprite.scene.game.loop.delta / 1000;
      this.walkBobTime += dt * 28;
      const bobOffsetY = -Math.abs(Math.sin(this.walkBobTime) * 12);
      this.syncVisual(bobOffsetY);
      if (this.visual.anims.currentAnim?.key !== "bun-stand") {
        this.visual.play("bun-stand", true);
      }
    } else if (this.visual.anims.currentAnim?.key !== "bun-stand") {
      this.walkBobTime = 0;
      this.syncVisual(0);
      this.visual.play("bun-stand", true);
    } else {
      this.walkBobTime = 0;
      this.syncVisual(0);
    }
  }
}

