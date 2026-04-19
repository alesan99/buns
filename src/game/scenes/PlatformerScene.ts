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
import { readOverdueCountFromStorage } from "@/lib/overdue";
import { USER_STATS_CHANGED_EVENT, PLAYS_REMAINING_KEY, MAX_PLAYS } from "@/hooks/useUserStats";

export function createPlatformerScene(
  Phaser: typeof import("phaser"),
  onDeath?: () => void,
  onCameraStartMoving?: () => void,
  controlsEnabled = true,
) {
  let player: Player;
  let world: TiledWorld;
  let background: Phaser.GameObjects.Image | undefined;
  let updateCamera: (() => void) | undefined;
  let hasAutoScrollStarted: (() => boolean) | undefined;
  let hasStartedAutoScroll = false;
  let hasDied = false;

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

  const updatePlayerControls = () => {
    if (!player) return;
    const raw = typeof window !== "undefined" ? localStorage.getItem(PLAYS_REMAINING_KEY) : null;
    const playsRemaining = raw ? parseInt(raw, 10) : 0;
    const hasPlays = Math.max(0, Math.min(MAX_PLAYS, playsRemaining)) > 0;
    player.setControlsEnabled(hasPlays);
  };

  return {
    key: "PlatformerScene",
    preload(this: Phaser.Scene) {
      this.load.image("background", "/background.png");
      this.load.image("backgroundrooms", "/backgroundrooms.png");
      this.load.spritesheet("coffee", "/coffee.png", {
        frameWidth: 64,
        frameHeight: 64,
      });
      this.load.spritesheet("beverages", "beverages.png", {
        frameWidth: 64,
        frameHeight: 64,
      });
      this.load.spritesheet("tiles", "/tiles.png", {
        frameWidth: 64,
        frameHeight: 64,
        spacing: 1,
      });
      this.load.spritesheet("bun", "/bun.png", {
        frameWidth: 512,
        frameHeight: 512,
      });
      this.load.spritesheet("bun-tweaking", "/bun_tweaking.png", {
        frameWidth: 512,
        frameHeight: 512,
      });
      this.load.spritesheet("bun-lowkirkenuinely", "/bun_lowkirkenuinely.png", {
        frameWidth: 512,
        frameHeight: 512,
      });
    },
    create(this: Phaser.Scene) {
      const overdueCount = readOverdueCountFromStorage();
      const isBackroomsOverdueMode = overdueCount >= 3;
      const playerTextureKey = isBackroomsOverdueMode
        ? "bun-lowkirkenuinely"
        : overdueCount >= 1
          ? "bun-tweaking"
          : "bun";
      const standAnimKey = `${playerTextureKey}-stand`;
      const jumpAnimKey = `${playerTextureKey}-jump`;
      const handleResize = () => resizeBackground(this);

      background = this.add.image(
        0,
        0,
        isBackroomsOverdueMode ? "backgroundrooms" : "background",
      );
      resizeBackground(this);

      createPrimitiveTextures(this, TILE_SIZE);
      this.cameras.main.setBackgroundColor("#f5e8cc");

      // Create player animations
      if (!this.anims.exists(standAnimKey)) {
        this.anims.create({
          key: standAnimKey,
          frames: [{ key: playerTextureKey, frame: 0 }],
          frameRate: 10,
          repeat: -1,
        });
      }

      if (!this.anims.exists(jumpAnimKey)) {
        this.anims.create({
          key: jumpAnimKey,
          frames: [{ key: playerTextureKey, frame: 1 }],
          frameRate: 10,
          repeat: -1,
        });
      }

      if (!this.anims.exists("coffee-idle")) {
        this.anims.create({
          key: "coffee-idle",
          frames: this.anims.generateFrameNumbers("coffee", { start: 0, end: 1 }),
          frameRate: 5,
          repeat: -1,
        });
      }

      const levelLayout = populateLevelLayoutRandom(createBaseLevelLayout(), Math.random, {
        forcedTileId: isBackroomsOverdueMode ? 6 : undefined,
      });
      world = new TiledWorld(this, levelLayout, TILE_SIZE, {
        forcedGeneratedTileId: isBackroomsOverdueMode ? 6 : undefined,
      });
      setupPhysicsWorld(this, world.worldWidthPx, world.worldHeightPx);

      player = new Player(
        this,
        world.spawnPoint.x,
        world.spawnPoint.y,
        playerTextureKey,
        standAnimKey,
        jumpAnimKey,
        controlsEnabled,
      );

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

      const cameraState = setupCamera(
        this,
        player.sprite,
        world.worldWidthPx,
        world.worldHeightPx,
        TILE_SIZE,
        CAMERA_VISIBLE_TILES_ACROSS,
        () => world.worldTopY,
        () => world.worldBottomY,
        onCameraStartMoving,
      );
      updateCamera = cameraState.updateCamera;
      hasAutoScrollStarted = cameraState.hasStartedAutoScroll;

      // Re-apply after camera zoom is configured.
      resizeBackground(this);

      world.updateTileVisibility(this.cameras.main);

      this.scale.on("resize", handleResize);

      // Listen for play count changes and update player controls
      window.addEventListener(USER_STATS_CHANGED_EVENT, updatePlayerControls);

      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.scale.off("resize", handleResize);
        window.removeEventListener(USER_STATS_CHANGED_EVENT, updatePlayerControls);
      });
    },
    update(this: Phaser.Scene) {
      player?.update();
      world?.updateStreaming(this.cameras.main);
      updateCamera?.();
      hasStartedAutoScroll = hasAutoScrollStarted?.() ?? hasStartedAutoScroll;

      if (player && world && !hasDied) {
        const body = player.sprite.body as Phaser.Physics.Arcade.Body | null;
        const graceZone = 50;
        const cameraBottom = this.cameras.main.worldView.bottom;
        if (hasStartedAutoScroll && body && body.top - graceZone > cameraBottom) {
          triggerDeath();
          return;
        }
      }

      world?.updateTileVisibility(this.cameras.main);
    },
  };
}
