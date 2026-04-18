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
  let background: Phaser.GameObjects.Image | undefined;

  const resizeBackground = (scene: Phaser.Scene) => {
    if (!background) return;
    const zoom = scene.cameras.main.zoom || 1;
    const baseScale = Math.max(
      scene.scale.width / background.width,
      scene.scale.height / background.height,
    );

    background.setOrigin(0.5, 0.5);
    background.setPosition(scene.scale.width / 2, scene.scale.height / 2);
    background.setScale((baseScale * 2) / zoom);
    background.setScrollFactor(0);
    background.setDepth(-100);
  };

  return {
    key: "PlatformerScene",
    preload(this: Phaser.Scene) {
      this.load.image("background", "/background.png");
      this.load.spritesheet("tiles", "/tiles.png", {
        frameWidth: 64,
        frameHeight: 64,
        spacing: 1,
      });
      this.load.spritesheet("bun", "/bun.png", {
        frameWidth: 512,
        frameHeight: 512,
      });
    },
    create(this: Phaser.Scene) {
      const handleResize = () => resizeBackground(this);

      background = this.add.image(0, 0, "background");
      resizeBackground(this);

      createPrimitiveTextures(this, TILE_SIZE);
      this.cameras.main.setBackgroundColor("#f5e8cc");

      // Create player animations
      if (!this.anims.exists("bun-stand")) {
        this.anims.create({
          key: "bun-stand",
          frames: [{ key: "bun", frame: 0 }],
          frameRate: 10,
          repeat: -1,
        });
      }

      if (!this.anims.exists("bun-jump")) {
        this.anims.create({
          key: "bun-jump",
          frames: [{ key: "bun", frame: 1 }],
          frameRate: 10,
          repeat: -1,
        });
      }

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

      // Re-apply after camera zoom is configured.
      resizeBackground(this);

      world.updateTileVisibility(this.cameras.main);

      this.scale.on("resize", handleResize);

      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.scale.off("resize", handleResize);
      });
    },
    update(this: Phaser.Scene) {
      player?.update();
      world?.updateTileVisibility(this.cameras.main);
    },
  };
}
