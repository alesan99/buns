import type * as Phaser from "phaser";
import { addCoffeeCaffeine } from "@/hooks/useUserStats";

type CollectibleType = "coffee" | "energy" | "tea";

const CAFFEINE_VALUE: Record<CollectibleType, number> = {
  coffee: 1,
  energy: 2, 
  tea:    1,
};

function pickType(): CollectibleType {
  const roll = Math.random();
  if (roll < 1 / 3) return "coffee";
  if (roll < 2 / 3) return "energy";
  return "tea";
}

function getTextureConfig(type: CollectibleType): { key: string; frame?: number; anim?: string } {
  switch (type) {
    case "coffee": return { key: "coffee", anim: "coffee-idle" };
    case "energy": return { key: "beverages", frame: 0 };
    case "tea":    return { key: "beverages", frame: 1 };
  }
}

export class Collectible {
  readonly row: number;
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly visual: Phaser.GameObjects.Sprite;
  private readonly type: CollectibleType;

  constructor(scene: Phaser.Scene, row: number, x: number, y: number) {
    this.row = row;
    this.type = pickType();
    const { key, frame, anim } = getTextureConfig(this.type);

    this.sprite = scene.physics.add.sprite(x, y, key, frame);
    this.sprite.setImmovable(true);
    this.sprite.setVisible(false);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      body.setAllowGravity(false);
      body.moves = false;
      body.setSize(24, 24, true);
    }

    this.visual = scene.add.sprite(x, y, key, frame);
    this.visual.setDepth(2);
    if (anim) {
      this.visual.play(anim);
    }

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
    addCoffeeCaffeine(CAFFEINE_VALUE[this.type]);
    this.destroy();
  }

  destroy() {
    this.visual.destroy();
    this.sprite.disableBody(true, true);
  }
}