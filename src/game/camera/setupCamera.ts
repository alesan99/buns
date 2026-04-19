import type * as Phaser from "phaser";

export function setupCamera(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  worldWidth: number,
  worldHeight: number,
  tileSize: number,
  tilesAcross: number,
  getWorldTopY?: () => number,
  getWorldBottomY?: () => number,
) {
  const camera = scene.cameras.main;
  const targetObject = target as Phaser.GameObjects.GameObject & { x: number; y: number };
  const bottomCameraPadding = tileSize;
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);
  const lerp = (start: number, end: number, amount: number) =>
    start + (end - start) * amount;
  const startY = targetObject.y;
  let autoScrollStarted = false;

  const applyViewportAndZoom = () => {
    camera.setViewport(0, 0, scene.scale.width, scene.scale.height);
    const targetWorldWidth = tileSize * tilesAcross;
    const zoom = camera.width / targetWorldWidth;
    camera.setZoom(zoom > 0 ? zoom : 1);
  };

  const applyBounds = () => {
    const topY = getWorldTopY ? getWorldTopY() : 0;
    const bottomY = getWorldBottomY ? getWorldBottomY() : worldHeight;
    camera.setBounds(
      0,
      topY,
      worldWidth,
      Math.max(tileSize, bottomY - topY + bottomCameraPadding),
    );
  };

  const updateCamera = () => {
    const zoom = camera.zoom || 1;
    const visibleWorldWidth = camera.width / zoom;
    const visibleWorldHeight = camera.height / zoom;
    const dt = scene.game.loop.delta / 1000;
    const minScrollY = getWorldTopY ? getWorldTopY() : 0;
    const maxWorldBottomY = getWorldBottomY ? getWorldBottomY() : worldHeight;

    camera.scrollX = targetObject.x - visibleWorldWidth / 2;

    if (!autoScrollStarted && targetObject.y < startY - 2) {
      autoScrollStarted = true;
    }

    if (autoScrollStarted) {
      const climbProgress = clamp(1 - targetObject.y / Math.max(1, worldHeight), 0, 1);
      const baseAutoScrollSpeed = tileSize * 0.60;
      const maxExtraAutoScrollSpeed = tileSize * 0.18;
      const maxAutoScrollSpeed = tileSize * 3;
      const autoScrollSpeed = Math.min(
        baseAutoScrollSpeed + maxExtraAutoScrollSpeed * climbProgress,
        maxAutoScrollSpeed,
      );
      camera.scrollY -= autoScrollSpeed * dt;
    }

    const desiredScrollY = targetObject.y - visibleWorldHeight * 0.25;
    if (desiredScrollY < camera.scrollY) {
      camera.scrollY = lerp(camera.scrollY, desiredScrollY, 0.08);
    }

    camera.scrollX = clamp(camera.scrollX, 0, Math.max(0, worldWidth - visibleWorldWidth));
    camera.scrollY = clamp(
      camera.scrollY,
      minScrollY,
      Math.max(minScrollY, maxWorldBottomY + bottomCameraPadding - visibleWorldHeight),
    );

    applyBounds();
  };

  applyBounds();
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
