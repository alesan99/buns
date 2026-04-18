# Bunny Bulletin

A bunny-themed gamified todo list. Built at HackKU 2026.

See [`PROJECT.md`](./PROJECT.md) for the full design doc (scope, stack rationale, architecture, timeline, risks).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · localStorage (no DB).

Planned additions (install as needed): `zustand`, `framer-motion`.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Layout

```
src/
  app/            # Next App Router entry — layout, page, globals.css
  components/     # Shared React components (frontend-owned)
  game/           # Canvas game engine and entities (game-dev-owned)
  store/          # Zustand stores + localStorage persistence
  lib/            # Non-React utilities (sfx, storage helpers)
public/           # Static assets (sprites, sfx)
```

Each `src/*` folder has its own README noting what goes there.

## Scripts

- `npm run dev` — dev server.
- `npm run build` — production build.
- `npm run start` — serve production build.
- `npm run lint` — ESLint.
