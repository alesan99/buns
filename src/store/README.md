# store/

Client-side state. Planning to use Zustand (`persist` middleware for localStorage).

- `todos.ts` — todo list state + persistence. **Version the schema** (`{ v: 1, todos: [...] }`) so we don't wipe users on a shape change.
- `bunny.ts` — bunny/game state (streak, coins, last score).

Install when ready: `npm i zustand`.
