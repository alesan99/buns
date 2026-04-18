# game/

The bunny minigame. Plain `<canvas>` + `requestAnimationFrame` (no Phaser).

- `engine.ts` — rAF loop, delta time, physics step.
- `bunny.ts` — player entity (position, velocity, jump).
- `obstacles.ts` — game-specific entities.
- `input.ts` — keyboard/touch abstraction.

The canvas is mounted by `components/GameStage.tsx`; this folder owns what runs inside it.
