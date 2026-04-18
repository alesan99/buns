import type * as Phaser from "phaser";

export function setupPhysicsWorld(
  scene: Phaser.Scene,
  worldWidth: number,
  worldHeight: number,
) {
  scene.physics.world.gravity.y = 2400;
  scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);
}
