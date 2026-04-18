import type * as Phaser from "phaser";

export function createPrimitiveTextures(scene: Phaser.Scene, tileSize: number) {
  void tileSize;

  if (!scene.textures.exists("collectible-carrot")) {
    const g = scene.add.graphics();
    g.fillStyle(0xd07060, 1);
    g.fillTriangle(24, 42, 40, 14, 8, 14);
    g.fillStyle(0x7ab878, 1);
    g.fillRect(20, 6, 8, 10);
    g.generateTexture("collectible-carrot", 48, 48);
    g.destroy();
  }
}
