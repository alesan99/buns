import { createPlatformerScene } from "@/game/scenes/PlatformerScene";

export function createPhaserGame(
  Phaser: typeof import("phaser"),
  mountNode: HTMLElement,
  options?: {
    onDeath?: () => void;
    onCameraStartMoving?: () => void;
    controlsEnabled?: boolean;
  },
) {
  const scene = createPlatformerScene(
    Phaser,
    options?.onDeath,
    options?.onCameraStartMoving,
    options?.controlsEnabled ?? true,
  );

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: mountNode,
    backgroundColor: "#f5e8cc",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: mountNode.clientWidth || 1,
      height: mountNode.clientHeight || 1,
    },
    scene,
  });
}