Project: MCP workout tracker MVP

Goal:
Build one end-to-end vertical slice for a ChatGPT MCP workout tracker.

Current stack:
- Node.js
- TypeScript
- Prisma
- PostgreSQL
- pnpm workspace

What we want right now:
- One simple end-to-end flow only
- Show today's workout in UI
- User clicks a set as done
- DB updates
- UI refreshes

Current scope:
- Keep only 2 tools:
  - getTodayWorkout
  - markSetDone
- Keep code minimal and explicit
- No auth
- No AI coaching logic
- No analytics
- No custom plans
- No abstractions unless necessary

Data model for now:
- WorkoutEntry
  - id
  - date
  - exercise
  - setNumber
  - repsDone
  - weight
  - completed

Rules:
- Prefer small files
- Prefer direct code over clever abstractions
- Use Prisma for DB access
- Use `.js` extension for local relative imports in TS ESM files
- Do not redesign the repo structure unless necessary