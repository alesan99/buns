import type * as Phaser from "phaser";

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly visual: Phaser.GameObjects.Sprite;
  private readonly scene: Phaser.Scene;
  private readonly standAnimationKey: string;
  private readonly jumpAnimationKey: string;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null;
  private readonly keyW: Phaser.Input.Keyboard.Key | null;
  private readonly keyA: Phaser.Input.Keyboard.Key | null;
  private readonly keyD: Phaser.Input.Keyboard.Key | null;
  private readonly godModeKey: Phaser.Input.Keyboard.Key | null;
  private readonly speed = 260;
  private readonly jumpVelocity = -1240;
  private readonly extraJumpVelocity = -1200;
  private readonly jumpCutVelocity = -350;
  private readonly godModeFloatVelocity = 420;
  private readonly visualOffsetX = 0;
  private readonly visualOffsetY = -30;
  private readonly baseVisualScale = 0.20;
  private controlsEnabled: boolean;
  private walkBobTime = 0;
  private previousJumpHeld = false;
  private previousGodModeToggleHeld = false;
  private godModeEnabled = false;
  private jumpSpamArmed = false;
  private jumpSpamPresses = 0;
  private extraBoostUsed = false;
  private boostStretchTween: Phaser.Tweens.Tween | undefined;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey = "bun",
    standAnimationKey = "bun-stand",
    jumpAnimationKey = "bun-jump",
    controlsEnabled = true,
  ) {
    this.scene = scene;
    this.standAnimationKey = standAnimationKey;
    this.jumpAnimationKey = jumpAnimationKey;
    this.controlsEnabled = controlsEnabled;

    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setOrigin(0.5, 0.5);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(34, 34, true);
    this.sprite.setVisible(false);

    this.visual = scene.add.sprite(x, y, textureKey, 0);
    this.visual.setOrigin(0.5, 0.5);
    this.visual.setScale(this.baseVisualScale, this.baseVisualScale);
    this.visual.setDepth(2);
    this.visual.play(this.standAnimationKey);
    this.syncVisual(0);

    this.cursors = scene.input.keyboard?.createCursorKeys() ?? null;
    this.keyW = scene.input.keyboard?.addKey("W") ?? null;
    this.keyA = scene.input.keyboard?.addKey("A") ?? null;
    this.keyD = scene.input.keyboard?.addKey("D") ?? null;
    this.godModeKey = scene.input.keyboard?.addKey("ZERO") ?? null;
  }

  setControlsEnabled(enabled: boolean) {
    this.controlsEnabled = enabled;
  }

  private triggerExtraJumpBoost() {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;

    body.setVelocityY(Math.min(body.velocity.y, this.extraJumpVelocity));

    if (this.boostStretchTween) {
      this.boostStretchTween.stop();
    }

    this.boostStretchTween = this.scene.tweens.add({
      targets: this.visual,
      scaleX: this.baseVisualScale * 0.62,
      scaleY: this.baseVisualScale * 3.02,
      duration: 90,
      yoyo: true,
      ease: "Quad.out",
      onComplete: () => {
        this.boostStretchTween = undefined;
      },
    });
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

    const left = this.cursors.left?.isDown || this.keyA?.isDown;
    const right = this.cursors.right?.isDown || this.keyD?.isDown;
    const jumpHeld = this.cursors.up?.isDown || this.cursors.space?.isDown || this.keyW?.isDown || false;
    const jumpJustPressed = jumpHeld && !this.previousJumpHeld;
    this.previousJumpHeld = jumpHeld;
    const godModeToggleHeld = this.godModeKey?.isDown ?? false;
    const godModeToggleJustPressed = godModeToggleHeld && !this.previousGodModeToggleHeld;
    this.previousGodModeToggleHeld = godModeToggleHeld;

    if (godModeToggleJustPressed) {
      this.godModeEnabled = !this.godModeEnabled;
    }

    if (left && this.controlsEnabled) {
      this.sprite.setVelocityX(-this.speed);
      this.visual.setFlipX(true);
    } else if (right && this.controlsEnabled) {
      this.sprite.setVelocityX(this.speed);
      this.visual.setFlipX(false);
    } else {
      this.sprite.setVelocityX(0);
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
    const isGrounded = body?.blocked?.down ?? false;

    if (body) {
      body.setAllowGravity(!this.godModeEnabled);
    }

    if (this.godModeEnabled) {
      this.jumpSpamArmed = false;
      this.jumpSpamPresses = 0;
      this.extraBoostUsed = false;

      if (godModeToggleHeld) {
        this.sprite.setVelocityY(-this.godModeFloatVelocity);
      } else {
        this.sprite.setVelocityY(0);
      }

      this.visual.play(this.standAnimationKey, true);
      this.syncVisual(0);
      return;
    }

    if (isGrounded) {
      this.jumpSpamArmed = false;
      this.jumpSpamPresses = 0;
      this.extraBoostUsed = false;
    }

    if (jumpJustPressed && isGrounded && this.controlsEnabled) {
      this.sprite.setVelocityY(this.jumpVelocity);
      this.jumpSpamArmed = true;
      this.jumpSpamPresses = 0;
      this.extraBoostUsed = false;
    }

    if (jumpJustPressed && !isGrounded && this.jumpSpamArmed && !this.extraBoostUsed) {
      this.jumpSpamPresses += 1;
      if (this.jumpSpamPresses >= 3) {
        this.extraBoostUsed = true;
        this.triggerExtraJumpBoost();
      }
    }

    if (!jumpHeld && !isGrounded && body && body.velocity.y < 0) {
      this.sprite.setVelocityY(Math.max(body.velocity.y, this.jumpCutVelocity));
    }

    // Animation state machine: jump while airborne, run while moving on ground, stand otherwise.
    if (!isGrounded) {
      if (this.visual.anims.currentAnim?.key !== this.jumpAnimationKey) {
        this.visual.play(this.jumpAnimationKey, true);
      }
      this.syncVisual(0);
      return;
    }

    const movingHorizontally = Math.abs(this.sprite.body?.velocity.x ?? 0) > 1;
    if (movingHorizontally) {
      this.visual.setScale(this.baseVisualScale, this.baseVisualScale);
      const dt = this.sprite.scene.game.loop.delta / 1000;
      this.walkBobTime += dt * 28;
      const bobOffsetY = -Math.abs(Math.sin(this.walkBobTime) * 12);
      this.syncVisual(bobOffsetY);
      if (this.visual.anims.currentAnim?.key !== this.standAnimationKey) {
        this.visual.play(this.standAnimationKey, true);
      }
    } else if (this.visual.anims.currentAnim?.key !== this.standAnimationKey) {
      this.walkBobTime = 0;
      this.visual.setScale(this.baseVisualScale, this.baseVisualScale);
      this.syncVisual(0);
      this.visual.play(this.standAnimationKey, true);
    } else {
      this.walkBobTime = 0;
      this.visual.setScale(this.baseVisualScale, this.baseVisualScale);
      this.syncVisual(0);
    }
  }
}

