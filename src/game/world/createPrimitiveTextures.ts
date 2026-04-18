import type * as Phaser from "phaser";

export function createPrimitiveTextures(scene: Phaser.Scene, tileSize: number) {
  if (!scene.textures.exists("tile-block")) {
    const g = scene.add.graphics();
    g.fillStyle(0xa8c5a0, 1);
    g.fillRoundedRect(0, 0, tileSize, tileSize, 10);
    g.lineStyle(2, 0x4e7048, 1);
    g.strokeRoundedRect(1, 1, tileSize - 2, tileSize - 2, 10);
    g.generateTexture("tile-block", tileSize, tileSize);
    g.destroy();
  }

  if (!scene.textures.exists("player-bunny")) {
    const g = scene.add.graphics();
    g.fillStyle(0xfdf8f2, 1);
    g.fillCircle(24, 30, 16);
    g.fillCircle(16, 10, 6);
    g.fillCircle(32, 10, 6);
    g.fillStyle(0x2c2420, 1);
    g.fillCircle(19, 28, 2);
    g.fillCircle(29, 28, 2);
    g.generateTexture("player-bunny", 48, 48);
    g.destroy();
  }

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
