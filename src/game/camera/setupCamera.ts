import type * as Phaser from "phaser";

export function setupCamera(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  worldWidth: number,
  worldHeight: number,
) {
  const camera = scene.cameras.main;
  camera.setBounds(0, 0, worldWidth, worldHeight);
  camera.startFollow(target, true, 0.12, 0.12);
  camera.setRoundPixels(true);
}
