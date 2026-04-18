# Buns — Bunny-Themed Gamified Todo List

A hackathon project (HackKU26, 36-hour build) that turns task completion into a tiny, joyful game. Finish a todo → the page "flips" like a book → your bunny plays a short game → you return to your list feeling good.

## Core Concept

- **Left side of screen:** the todo list (the "book" you're working through).
- **Right side / flipped page:** your bunny character in a minigame.
- **The loop:** check off a task → book-flip animation → bunny plays a short game (jumping or climbing, TBD) → return to todo list with a reward / reaction.
- **Design goal:** the completion moment must feel *disproportionately* satisfying — sound, motion, bunny reaction, confetti. This is the product's whole identity.

## Constraints

- **Timebox:** 36 hours total.
- **Team:** TBD (solo or small team).
- **No database** — localStorage only.
- **No multiplayer** — single-player only.
- **No auth** — open on device, state is per-browser.

## Tech Stack (proposed)

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Fast scaffold, trivial Vercel deploy. SSR surface is unused — components are `"use client"`. |
| Language | TypeScript | Small upfront cost, prevents sloppy hackathon bugs. |
| Styling | Tailwind CSS | Fastest iteration for custom UI. |
| State | Zustand (with `persist` middleware) | One-liner localStorage sync, no Context boilerplate. |
| Animation | Framer Motion | Built-in 3D rotateY for the book flip. |
| Game runtime | `<canvas>` + `requestAnimationFrame` | Lightweight; no Phaser bloat. |
| Audio | HTMLAudio (or Tone.js if time) | Critical for the "satisfaction" payoff. |
| Deploy | Vercel | One-click for demo. |

### Why Next.js (and not Vite)?
Next.js is slightly overkill — no backend, no SEO, no SSR need. But `create-next-app` + Vercel deploy is faster than the equivalent Vite + hosting setup, so it stays.

## Features (MVP)

1. **Todo list**
   - Add / check off / delete tasks.
   - Persisted to localStorage with a versioned schema (`{ v: 1, todos: [...] }`).
2. **Book-flip transition**
   - On task completion, page flips to reveal bunny game.
3. **Bunny minigame**
   - Short fixed-length run (~20–30s), not endless.
   - Jumping game (leaning toward this) OR climbing game — one, not both.
   - Bunny character with idle + action animations.
4. **Reward / return**
   - Confetti + sound + bunny reaction on game end.
   - Auto-flips back to the list.
5. **Juice**
   - SFX for: add task, check task, flip, jump, land, game end.
   - Haptic-feeling bounce on task check.
   - Bunny idle animation on the list page (peeking in from the side).

## Stretch Features (only if ahead of schedule)

- Daily streak counter.
- Bunny customization (hats, colors) unlocked by task count.
- Multiple minigames, randomly picked.
- Progressive difficulty scaling with streak.

## Architecture Sketch

```
app/
  layout.tsx
  page.tsx                # main "book" view — holds both sides
  components/
    Book.tsx              # container, manages flip state
    TodoList.tsx          # left page
    GameStage.tsx         # right page — canvas host
    BunnyIdle.tsx         # bunny peeking on list page
  game/
    engine.ts             # rAF loop, physics
    bunny.ts              # player entity
    obstacles.ts          # game-specific entities
    input.ts              # keyboard/touch
  store/
    todos.ts              # zustand + persist
    bunny.ts              # bunny state (streak, coins, etc)
  lib/
    sfx.ts                # audio helpers
public/
  sprites/                # bunny + obstacle art
  sfx/                    # audio files
```

## Open Questions

1. **Team size & skills?** Who's doing art vs code?
2. **Jumping or climbing?** Must decide before scaffolding the game module. Recommendation: **jumping** (simpler physics, more familiar to judges).
3. **Game length:** short + fixed (recommended) vs endless runner.
4. **Book metaphor:** literal two-page-spread UI, or just a flip animation on a normal layout?
5. **Target device:** desktop-first (keyboard) or mobile-friendly (touch)?

## Timeline (36h rough plan)

| Block | Hours | Work |
|---|---|---|
| 1 | 0–2 | Scaffold Next.js, Tailwind, Zustand. Stub all components. |
| 2 | 2–6 | Todo list: add, check, delete, persist. Basic styling. |
| 3 | 6–10 | Book-flip animation. Plumb the state transition list↔game. |
| 4 | 10–18 | **End-to-end playable ugly slice.** Stub game (bunny jumps once, returns). Everything wired. |
| 5 | 18–26 | Flesh out the real minigame (physics, obstacles, score). |
| 6 | 26–32 | Juice pass: SFX, confetti, bunny reactions, idle animations. |
| 7 | 32–35 | Art/polish pass. Responsive check. |
| 8 | 35–36 | Deploy to Vercel. Record demo. Buffer for bugs. |

## Risks

- **Game-loop scope creep.** Mitigation: hard stop game dev at hour 26.
- **Art asset time sink.** Mitigation: use placeholder rectangles until hour 20, then swap in art.
- **localStorage schema change mid-hackathon.** Mitigation: version the schema from day one.
- **Book-flip animation eating a full day.** Mitigation: if Framer Motion's built-in isn't close enough in 2 hours, fall back to a simple slide/fade.

## Success Criteria

- A user can add, complete, and see tasks persist across refresh.
- Completing a task triggers a smooth flip → playable game → return.
- The completion moment *feels* good enough that a demo judge smiles.
