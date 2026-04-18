import type * as Phaser from "phaser";

export function setupCamera(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  worldWidth: number,
  worldHeight: number,
  tileSize: number,
  tilesAcross: number,
) {
  const camera = scene.cameras.main;

  const applyViewportAndZoom = () => {
    camera.setViewport(0, 0, scene.scale.width, scene.scale.height);
    const targetWorldWidth = tileSize * tilesAcross;
    const zoom = camera.width / targetWorldWidth;
    camera.setZoom(zoom > 0 ? zoom : 1);
  };

  camera.setBounds(0, 0, worldWidth, worldHeight);
  camera.startFollow(target, true, 0.12, 0.12);
  camera.setRoundPixels(true);
  applyViewportAndZoom();

  scene.scale.on("resize", applyViewportAndZoom);
  scene.events.once("shutdown", () => {
    scene.scale.off("resize", applyViewportAndZoom);
  });
}
