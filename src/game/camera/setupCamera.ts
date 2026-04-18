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
  const targetObject = target as Phaser.GameObjects.GameObject & { x: number; y: number };
  const bottomCameraPadding = tileSize;
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);
  const lerp = (start: number, end: number, amount: number) =>
    start + (end - start) * amount;

  const applyViewportAndZoom = () => {
    camera.setViewport(0, 0, scene.scale.width, scene.scale.height);
    const targetWorldWidth = tileSize * tilesAcross;
    const zoom = camera.width / targetWorldWidth;
    camera.setZoom(zoom > 0 ? zoom : 1);
  };

  const updateCamera = () => {
    const zoom = camera.zoom || 1;
    const visibleWorldWidth = camera.width / zoom;
    const visibleWorldHeight = camera.height / zoom;

    camera.scrollX = targetObject.x - visibleWorldWidth / 2;

    const desiredScrollY = targetObject.y - visibleWorldHeight / 2;
    if (desiredScrollY < camera.scrollY) {
      camera.scrollY = lerp(camera.scrollY, desiredScrollY, 0.04);
    }

    camera.scrollX = clamp(camera.scrollX, 0, Math.max(0, worldWidth - visibleWorldWidth));
    camera.scrollY = clamp(
      camera.scrollY,
      0,
      Math.max(0, worldHeight + bottomCameraPadding - visibleWorldHeight),
    );
  };

  camera.setBounds(0, 0, worldWidth, worldHeight + bottomCameraPadding);
  camera.setRoundPixels(true);
  applyViewportAndZoom();
  {
    const zoom = camera.zoom || 1;
    const visibleWorldWidth = camera.width / zoom;
    const visibleWorldHeight = camera.height / zoom;
    camera.scrollX = targetObject.x - visibleWorldWidth / 2;
    camera.scrollY = targetObject.y - visibleWorldHeight / 2 + tileSize;
  }
  updateCamera();

  scene.scale.on("resize", applyViewportAndZoom);
  scene.events.once("shutdown", () => {
    scene.scale.off("resize", applyViewportAndZoom);
  });

  return updateCamera;
}
