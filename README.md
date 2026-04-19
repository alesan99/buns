# Busy Bunny

Have you ever taken a "five minute study break" to scroll through reels and found yourself spending an hour doomscrolling while your calculus worksheet is still due at 11:59pm? With Busy Bunny, you can manage your to-do list AND take brain breaks without the mishap of losing track of time all in a single web application, and have fun doing it!

As busy college students, keeping on top of homework assignments and projects can be both overwhelming and a drag to get through. With Busy Bunny, we've managed to hit two birds with one stone: task management and brain breaks that stay short. By earning plays of the minigame with each task you complete, Busy Bunny has a build-in rewards system that gives you a brain break on the same platform as your to-do list without letting you get sidetracked for too long. Each task completed gives you one play of our simple but addictive platformer game in a sunny sky--but make sure you stay on time, because the more overdue tasks you have, the more likely you are to clip into the backrooms.

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
