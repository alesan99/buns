import type * as Phaser from "phaser";
import {
  CAMERA_VISIBLE_TILES_ACROSS,
  createBaseLevelLayout,
  TILE_SIZE,
} from "@/game/config";
import { Player } from "@/game/entities/Player";
import { setupPhysicsWorld } from "@/game/physics/setupPhysicsWorld";
import { setupCamera } from "@/game/camera/setupCamera";
import { TiledWorld } from "@/game/world/TiledWorld";
import { createPrimitiveTextures } from "@/game/world/createPrimitiveTextures";
import { populateLevelLayoutRandom } from "@/game/world/populateLevelLayoutRandom";

export function createPlatformerScene(Phaser: typeof import("phaser")) {
  let player: Player;
  let world: TiledWorld;

  return {
    key: "PlatformerScene",
    create(this: Phaser.Scene) {
      createPrimitiveTextures(this, TILE_SIZE);
      this.cameras.main.setBackgroundColor("#f5e8cc");

      const levelLayout = populateLevelLayoutRandom(createBaseLevelLayout());
      world = new TiledWorld(this, levelLayout, TILE_SIZE);
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

      setupCamera(
        this,
        player.sprite,
        world.worldWidthPx,
        world.worldHeightPx,
        TILE_SIZE,
        CAMERA_VISIBLE_TILES_ACROSS,
      );

      world.updateTileVisibility(this.cameras.main);

      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        // Delete stuff here
      });
    },
    update(this: Phaser.Scene) {
      player?.update();
      world?.updateTileVisibility(this.cameras.main);
    },
  };
}
