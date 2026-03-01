@.planet-smars/templates/ai-context/CLAUDE.md

---

## Ohm — Personal Kanban for ADHD Brains

A kanban app using an electrical metaphor to map energy cycles into a visual workflow.

### Architecture

- **React 19** + TypeScript, Vite, Tailwind CSS
- **dnd-kit** for drag-and-drop
- **localStorage** persistence + optional **Google Drive** sync
- Single-page app, no router

### Four-Column Model

| Column   | Metaphor        | Purpose                                 |
| -------- | --------------- | --------------------------------------- |
| Charging | Building energy | Captured ideas with a clear next step   |
| Live     | Active          | Currently working on (capacity limited) |
| Grounded | Paused          | Captured "where I left off" context     |
| Powered  | Done            | Completed                               |

### Key Conventions

- **Index-based data model**: `ColumnStatus` and `EnergyTag` are numeric indices with named constants (`STATUS.CHARGING`, `ENERGY.MED`). Config arrays indexed by these values; `sanitizeBoard()` validates on load.
- **State**: `useBoard` hook (functional updates) + `board-utils.ts` (pure mutation functions). Debounced localStorage saves (500ms).
- **Capacity**: Live column uses energy segments (Small=1, Med=2, Large=3), not card count. Green-to-red gradient indicator.
- **Theming**: Dark theme. Status colors = `ohm-charging/live/grounded/powered`. Energy colors = `ohm-energy-low/med/high` (stoplight). Labels/icons are re-themeable without data migration.
- **CardDetail** handles both creation (`isNew` mode) and editing with contextual field visibility.
- **Mobile-first** responsive layout. Filter bar: energy chips + expandable category/search.
