@.planet-smars/templates/ai-context/CLAUDE.md

---

## Ohm — Personal Kanban for ADHD Brains

A kanban app using an electrical metaphor to map energy cycles into a visual workflow.

### Architecture

- **React 19** + TypeScript, Vite, Tailwind CSS
- **dnd-kit** for drag-and-drop
- **localStorage** persistence (Google Drive sync planned)
- Single-page app, no router

### Five-Column Model

| Column   | Metaphor | Purpose                             |
| -------- | -------- | ----------------------------------- |
| Spark    | Raw idea | Zero-friction capture (title only)  |
| Charge   | Shaped   | Has a clear next step               |
| Live     | Active   | Currently working on (WIP limited)  |
| Grounded | Paused   | Captured "where I left off" context |
| Powered  | Done     | Completed                           |

### Key Conventions

- `useBoard` hook manages all board state with functional updates
- `board-utils.ts` contains pure functions for board mutations
- Energy tags: Quick Win / Medium / Deep Focus
- Card IDs: `Date.now().toString(36)` + random suffix
- Debounced localStorage saves (500ms)
- Dark theme with electrical color accents (amber, orange, red, indigo, green)
- Mobile-first responsive layout
