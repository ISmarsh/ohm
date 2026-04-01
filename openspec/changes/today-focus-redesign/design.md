# Today Focus Redesign -- Design

## Context

OHM is a single-page React 19 kanban app (Vite, Tailwind, dnd-kit) with localStorage persistence and optional Google Drive sync. The current capacity system uses energy-weighted budgets across a configurable rolling window. This redesign simplifies to a flat item-count limit focused on today, reorders columns for a "wins first" reading direction, and introduces a CSS grid desktop layout with spanning header sections.

Key files:

- Board layout: `src/components/Board.tsx`
- BudgetBar: `src/components/BudgetBar.tsx`
- DayFocusDialog: `src/components/DayFocusDialog.tsx`
- Card display: `src/components/Card.tsx`
- Settings: `src/components/SettingsPage.tsx`
- Board types: `src/types/board.ts`
- Board utilities: `src/utils/board-utils.ts`
- Sanitization: `src/utils/storage.ts`
- State hook: `src/hooks/useBoard.ts`
- Styles: `src/index.css`

## Goals / Non-Goals

### Goals

- Simplify capacity to item count (dailyLimit) -- reduce cognitive overhead
- Put completed wins first (Powered column leads)
- Fixed 14-day forward/back windows -- eliminate configuration
- Preserve energy as visual metadata (filtering, tinting) without capacity math
- Soft-delete archive for future analytics
- Desktop grid layout with semantic header sections

### Non-Goals

- Analytics implementation (future work, archive preserves data for it)
- Dark Souls messages (separate PR via OpenSpec)
- Cross-column drag-and-drop (separate todo)
- Mobile grid layout (stays single-column flex)

## Decisions

### 1. Column render order via array, not data model change

`COLUMN_ORDER = [STATUS.POWERED, STATUS.LIVE, STATUS.CHARGING, STATUS.GROUNDED]` controls display. `ColumnStatus` numeric values stay the same. This avoids data migration and keeps persistence stable.

**Alternative considered**: renumbering ColumnStatus. Rejected -- would require migrating every saved card's status field.

### 2. archivedAt field on OhmCard, not separate array

Single `archivedAt?: string` field rather than a `board.archivedCards[]` array. Keeps card history in one object, avoids separate merge logic in Drive sync, restore points, and import/export.

**Alternative considered**: separate archivedCards array. Rejected -- adds merge complexity across sync, restore, and import/export code paths.

### 3. CSS Grid for desktop, flex for mobile

Desktop uses `grid-template-columns: repeat(4, 1fr)` with spanning headers. Mobile stays single-column flex. The grid enables the two-section header layout naturally. BudgetBar moves from fixed-bottom to grid header on desktop.

**Alternative considered**: keeping flex with absolute positioning for headers. Rejected -- spanning headers across column pairs is exactly what grid solves.

### 4. BudgetBar adaptation, not replacement

Adapt the existing BudgetBar component rather than creating a new "TodayMeter" component. The BudgetBar already handles day navigation, DayFocusDialog triggering, ResizeObserver, and fixed positioning. Changing its display model (energy -> item count + energy tinting) is less work and preserves tested behavior.

### 5. Golden-ratio hue for daily color

`(dayIndex * 137.508) % 360` instead of string hash. Golden angle maximizes perceptual distance between consecutive days -- avoids clustering that hash approaches produce.

### 6. Energy kept as visual metadata

Energy per card stays visible, settable, and filterable. It tints BudgetBar pips and DayFocusDialog mini-meter segments for visual weight. It does not affect capacity math (which is purely item count).

## Risks / Trade-offs

- **14-day hard-coded windows**: less flexible than configurable windowSize, but eliminates a setting most users don't touch. If needed later, can be made configurable again.
- **Soft-delete storage growth**: 14-day prune caps growth, but heavy users could accumulate data. Storage usage display in Settings mitigates by making this visible.
- **BudgetBar layout shift**: moving from fixed-bottom to grid header changes scroll behavior. May need adjustment for long column content on desktop.
- **Energy tinting complexity**: coloring pips by energy without energy affecting capacity could confuse users who associate color intensity with "importance." May need clear visual distinction or tooltip.
