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

export function createPlatformerScene(
  Phaser: typeof import("phaser"),
  onDeath?: () => void,
) {
  let player: Player;
  let world: TiledWorld;
  let background: Phaser.GameObjects.Image | undefined;
  let updateCamera: (() => void) | undefined;
  let hasDied = false;
  let deathChecksArmed = false;
  let initialCameraScrollY = 0;

  const triggerDeath = () => {
    if (hasDied) return;
    hasDied = true;
    onDeath?.();
  };

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
      this.load.image("coffee", "/coffee.png");
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
          const sprite = collectibleSprite as Phaser.Physics.Arcade.Sprite;
          const collectible = world.collectibles.find((item) => item.sprite === sprite);
          if (collectible) {
            collectible.collect();
            return;
          }

          sprite.disableBody(true, true);
        },
      );

      updateCamera = setupCamera(
        this,
        player.sprite,
        world.worldWidthPx,
        world.worldHeightPx,
        TILE_SIZE,
        CAMERA_VISIBLE_TILES_ACROSS,
      );
      initialCameraScrollY = this.cameras.main.scrollY;

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
      updateCamera?.();

      if (!deathChecksArmed) {
        deathChecksArmed =
          this.cameras.main.scrollY < initialCameraScrollY - TILE_SIZE;
      }

      if (player && world && !hasDied) {
        const body = player.sprite.body as Phaser.Physics.Arcade.Body | null;
        const cameraBottom = this.cameras.main.worldView.bottom;
        if (deathChecksArmed && body && body.top > cameraBottom) {
          triggerDeath();
          return;
        }
      }

      world?.updateTileVisibility(this.cameras.main);
    },
  };
}
