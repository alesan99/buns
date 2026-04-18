import type * as Phaser from "phaser";
import { LEVEL_LAYOUT, TILE_SIZE } from "@/game/config";
import { Player } from "@/game/entities/Player";
import { setupPhysicsWorld } from "@/game/physics/setupPhysicsWorld";
import { setupCamera } from "@/game/camera/setupCamera";
import { TiledWorld } from "@/game/world/TiledWorld";
import { createPrimitiveTextures } from "@/game/world/createPrimitiveTextures";

export function createPlatformerScene(Phaser: typeof import("phaser")) {
  let player: Player;
  let world: TiledWorld;

  return {
    key: "PlatformerScene",
    create(this: Phaser.Scene) {
      createPrimitiveTextures(this, TILE_SIZE);
      this.cameras.main.setBackgroundColor("#f5e8cc");

      world = new TiledWorld(this, LEVEL_LAYOUT, TILE_SIZE);
      setupPhysicsWorld(this, world.worldWidthPx, world.worldHeightPx);

      player = new Player(this, world.spawnPoint.x, world.spawnPoint.y);

      this.physics.add.collider(player.sprite, world.solidTiles);

      this.physics.add.overlap(
        player.sprite,
        world.collectibleGroup,
        (_playerSprite, collectibleSprite) => {
          (collectibleSprite as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
        },
      );

      setupCamera(this, player.sprite, world.worldWidthPx, world.worldHeightPx);

      this.scale.on("resize", () => {
        this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height);
      });

      const helpText = this.add
        .text(18, 18, "Arrows / Space to move and jump", {
          color: "#2c2420",
          fontFamily: "system-ui, sans-serif",
          fontSize: "18px",
          backgroundColor: "#fffefbcc",
          padding: { x: 8, y: 6 },
        })
        .setScrollFactor(0)
        .setDepth(10);

      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        helpText.destroy();
      });
    },
    update() {
      player?.update();
    },
  };
}
