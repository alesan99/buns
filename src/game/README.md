# game/

A small side-scrolling platformer inside Phaser with a player, camera follow, solid tiles, floating collectibles, and a tiled world layout.

## Core Systems

- Player character: Phaser sprite with run, jump, and airborne state.
- Camera: follow the player, clamp to the world bounds, and keep the view centered on the action.
- Tile object: use solid tilemap layers or tile-based collision objects that block the player.
- Collectible: floating pickup that animates slightly and only overlaps with the player.
- Physics world: use Phaser Arcade Physics if the player needs movement, gravity, collisions, and overlaps.
- 2D tiled world: build the level from a tilemap so the layout, collision, and decorations are data-driven.

## Implementation Plan

1. Create a Phaser scene that boots the tilemap, player, camera, and physics setup.
2. Load a tileset and at least one tilemap layer for the ground and obstacles.
3. Spawn the player with Arcade Physics enabled, gravity, and collision against solid tiles.
4. Add the camera follow behavior and world bounds so the view stays within the level.
5. Add collectible objects as overlap-only physics bodies with a small float animation.
6. Keep the game world data in a tiled map so more levels can be added without changing core code.

## Physics Choice

Use Phaser Arcade Physics unless a later requirement needs advanced rigid-body behavior. For this platformer, Arcade Physics should be enough for jumping, tile collisions, and collectible overlaps.

## Notes

- The current canvas-based approach should be replaced by Phaser scene code.
- The game folder should own the Phaser-specific scene and entity setup.

## Current Structure

- `createPhaserGame.ts` — Phaser game boot config used by the React mount component.
- `config.ts` — tile size and 2D layout data.
- `scenes/PlatformerScene.ts` — scene orchestration (wires world, player, physics, camera, and overlap rules).
- `entities/Player.ts` — player character movement and jump logic.
- `entities/TileObject.ts` — collidable tile object.
- `entities/Collectible.ts` — floating collectible object.
- `world/TiledWorld.ts` — parses the 2D layout and instantiates tiles/collectibles/spawn.
- `world/createPrimitiveTextures.ts` — primitive runtime textures for player/tile/collectible.
- `physics/setupPhysicsWorld.ts` — Arcade physics world bounds + gravity setup.
- `camera/setupCamera.ts` — camera follow + world clamping.
