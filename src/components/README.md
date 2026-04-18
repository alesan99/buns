# components/

Shared React components. Examples to come:

- `Book.tsx` — two-page layout + flip state (frontend owns).
- `TodoList.tsx` — left page (frontend owns).
- `GameStage.tsx` — right page; hosts the canvas (game dev owns the canvas contents, frontend owns mounting).
- `BunnyIdle.tsx` — decorative bunny on list page.

Keep components `"use client"` when they use hooks or event handlers.
