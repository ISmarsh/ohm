# Today Focus Redesign

## Vision

Shift OHM from a rolling-window energy planner to a **today-focused task board**. Drop past records from the UI, simplify capacity to a flat 3-item limit, and reorder columns so "now" leads.

---

## Column Model

### New order (left → right on desktop, top → bottom on mobile)

| Position | Column       | What lives here                        |
| -------- | ------------ | -------------------------------------- |
| 1        | **Powered**  | Done today (trophy case, clears daily) |
| 2        | **Live**     | Working on right now                   |
| 3        | **Charging** | Scheduled ahead (future dates)         |
| 4        | **Grounded** | Unscheduled backlog                    |

Reading direction: **present → future → someday**. Powered leads because wins should be the first thing you see.

### Data model

`ColumnStatus` numeric values stay the same (Grounded=0, Charging=1, Live=2, Powered=3). Only the **render order** changes — a new `COLUMN_ORDER` array controls display sequence without breaking persistence or transitions.

```ts
export const COLUMN_ORDER = [
  STATUS.POWERED,
  STATUS.LIVE,
  STATUS.CHARGING,
  STATUS.GROUNDED,
] as const;
```

### Scheduling horizon

A fixed **14-day window** in both directions replaces the configurable rolling `windowSize`:

- **Forward (Charging)**: shows cards scheduled within the next 14 days. Cards scheduled beyond 14 days remain in storage but are hidden (or shown in a collapsed "later" group).
- **Back (Archive)**: Powered cards are soft-deleted after day rollover and pruned after 14 days (see Powered Column Changes).
- This symmetry simplifies the model — no user-configurable window size needed.

---

## BudgetBar Adaptation

Adapts the existing BudgetBar from energy-based to item-count capacity, keeping its role as the primary day navigator and DayFocusDialog trigger.

### Today indicator

- **Capacity = `dailyLimit` items** (default 3; cards in Live + today's Powered).
- Prominent 3-segment display for today. Each segment = one slot, filled left-to-right.
- Visually spans above **Powered + Live** on desktop (see Desktop Layout). On mobile, sits at the top of the screen.

### Daily segments

- Each day in the 14-day forward window shows filled/empty pips for scheduled cards vs `dailyLimit`.
- **Energy tinting**: pips are colored/sized by card energy levels — energy informs visual weight without affecting capacity math.
- Day-click opens DayFocusDialog for that date (preserved from current behavior).

### Total row

- Item count across the forward window (not energy sum).
- Pulsing animation when total exceeds window capacity.

### Overflow

If cards exceed `dailyLimit` (e.g. imported, activity-spawned), the meter shows a "+N" badge. No hard block — ADHD brains need escape valves.

### Card limit setting

Stored as `board.dailyLimit` (default 3). Configurable in Settings (range 1–5). Replaces `liveCapacity` and `energyBudget`.

---

## What's Ahead Summary

A compact bar showing **category counts** across Charging + Grounded cards.

### Desktop

- Rendered as a shared header above Charging + Grounded columns.
- Format: colored chips — `work ×4 · personal ×2 · health ×1`

### Mobile

- Rendered between the Live and Charging sections as a section divider/header.
- Same chip format, single scrollable row if overflow.

### Data

Simple reduce over `board.cards` where `status ∈ {CHARGING, GROUNDED}`, grouped by category. Uncategorized cards either omit or show as "other".

---

## DayFocusDialog Redesign

Kept and redesigned as a forward-looking mini-planner for upcoming days. Replaces the current energy-ratio display with the item-count model.

### Mini meters

Each day in the dialog shows a small 3-segment meter (matching BudgetBar style) representing `Live + Powered` card count for that day vs `dailyLimit`. Card energy tints the segments for visual weight.

### Navigation

- Left/right arrows + swipe through the 14-day forward window.
- `availableDates` sourced from the forward scheduling horizon (not from BudgetBar's old rolling window).

### Trigger

Day-click in the adapted BudgetBar opens the dialog for that date (same interaction as current).

### Preserved features

- Card rows with energy badges, category, and metadata.
- Reschedule actions: Tomorrow, Pick Date, Clear.
- Drag-and-drop reorder within status groups.

---

## Desktop Layout

Two spanning header sections above the four columns, implemented with CSS grid.

```
Desktop (md+):
┌─────────────────────────┬─────────────────────────┐
│  BudgetBar / Today      │  What's Ahead           │
│  (spans cols 1-2)       │  (spans cols 3-4)       │
├────────────┬────────────┼────────────┬────────────┤
│  Powered   │    Live    │  Charging  │  Grounded  │
└────────────┴────────────┴────────────┴────────────┘
```

### CSS

- `grid-template-columns: repeat(4, 1fr)`, top row elements use `grid-column: span 2`.
- BudgetBar moves from fixed-bottom positioning to the grid header area on desktop.
- The BudgetBar header can accommodate additional data beyond the 3-segment meter.

### Mobile

- Single-column flex stack (no grid).
- BudgetBar at top, then Live, then What's Ahead as section divider, then Charging, then Grounded.

---

## Powered Column Changes

- **Today only**: shows cards completed today. No date grouping needed — it's all one day.
- **Soft-delete archive**: on day rollover (or app open on new day), yesterday's Powered cards are **archived** — hidden from the UI but retained in storage. An `archivedAt: string` (ISO timestamp) field on `OhmCard` marks archived cards. Cards with `archivedAt` are excluded from all rendering and capacity counts.
- **14-day retention**: `sanitizeBoard()` prunes cards where `archivedAt` is >14 days old. This caps storage growth while preserving enough history for future analytics (completion rates, time-in-column trends).
- **Read-only**: cards in Powered remain non-editable (current behavior).

---

## Card Display

With max 3 cards in Live + Powered, there's room to show more per card.

### Expanded card layout (Live + Powered columns)

- **Title** (larger, no truncation)
- **Description** (first 2-3 lines visible, not just preview)
- **Task checklist** (interactive in Live, read-only in Powered)
- **Category + scheduled date** as secondary metadata

### Charging + Grounded columns

- Keep current compact card layout (title, energy badge, category pill, task preview).
- Stale indicator remains (opacity fade after 14 days).

---

## Removed / Simplified

| Current feature       | Change                                                                             |
| --------------------- | ---------------------------------------------------------------------------------- |
| Energy budget (total) | Removed — capacity is item count                                                   |
| Energy per card       | **Kept** — visible and settable. Used for filtering and energy-tinted segments     |
| Rolling window        | Replaced by fixed 14-day forward/back windows                                      |
| `windowSize` setting  | Replaced by fixed 14-day horizon (no user setting needed)                          |
| `autoBudget` toggle   | Removed                                                                            |
| BudgetBar             | Adapted — item-count segments with energy tinting (see BudgetBar Adaptation)       |
| DayFocusDialog        | Redesigned — mini-meters, forward-looking navigation (see DayFocusDialog Redesign) |
| `energyBudget` field  | Deprecated, ignored if present                                                     |
| `liveCapacity` field  | Deprecated, replaced by `dailyLimit`                                               |

---

## Daily Color Theme

Deterministic daily accent color, seeded by date string.

### Mechanism

```ts
function dailyHue(date: string): number {
  // Golden angle step — maximizes perceptual distance between consecutive days
  const dayIndex = Math.floor(new Date(date + 'T00:00:00').getTime() / 86_400_000);
  return (dayIndex * 137.508) % 360;
}
```

### What changes

- `--color-ohm-spark` shifts to the daily hue (keeps same saturation/lightness).
- Column header tints get a subtle hue blend toward the daily color.
- Background and text colors stay fixed for readability.

### Toggle

`board.funSettings.dailyTheme: boolean` (default false). Shown in a new **Fun** settings tab.

---

## Fun Modules (Future)

Opt-in engagement features under `board.funSettings`.

### Dark Souls Messages

- Date-seeded random message displayed somewhere unobtrusive (footer, empty-state, or toast on app open).
- Separate package: `@ohm/dark-souls-messages` or similar. Exports `getMessage(date: Date): string`.
- Could be a submodule or npm package — keep it out of the main bundle unless enabled.

Message templates and vocabulary extracted from FromSoftware's soapstone message system. Extraction tooling and data staging tracked via OpenSpec in a **separate PR**.

### Architecture

```ts
interface FunSettings {
  dailyTheme?: boolean;
  darkSoulsMessages?: boolean;
  // future: more fun modules
}
```

Added to `OhmBoard` as `funSettings?: FunSettings`. Missing = all off.

---

## Settings Changes

### Board tab (simplified)

- **Daily limit**: spinner (1–5, default 3)
- **Energy scale**: keep as-is (optional card metadata)
- **Categories**: keep as-is

### Remove from Board tab

- Live capacity, total budget, auto-budget, window size

### New: Fun tab

- Daily color theme toggle
- Dark Souls messages toggle (when available)

### Data tab enhancements

- **Storage usage display** — enhance the existing Device Storage section:
  - **Browser origin storage**: `navigator.storage.estimate()` → usage/quota visual bar. Falls back gracefully if API unavailable.
  - **localStorage estimate**: calculated via `JSON.stringify` of all keys, shown against ~5MB nominal limit (browser-dependent, shown as approximate).
  - **Google Drive appDataFolder**: when connected, show usage against 10MB per-app limit alongside the "Connected" status.
- Read-only indicators, no action buttons needed.

---

## Migration

On load, `sanitizeBoard()` handles transition:

1. If `dailyLimit` is missing, set to `3`.
2. Default `funSettings` to `{}` if missing or non-object (eliminates `?.` chaining throughout the codebase).
3. Prune cards where `archivedAt` is >14 days old. Strip `archivedAt` from non-Powered cards (defensive cleanup).
4. `liveCapacity` / `energyBudget` / `windowSize` / `autoBudget` remain in the type for backwards compat but are ignored by all new logic.
5. No data migration needed for cards — they already have `status` and `scheduledDate`.

---

## Implementation Order

1. **Column reorder + Desktop grid** — `COLUMN_ORDER` array, CSS grid layout with spanning headers
2. **BudgetBar adaptation** — item-count segments with energy tinting, `dailyLimit` field
3. **Powered today-only + soft-delete** — `archivedAt` field, day rollover archive, 14-day prune
4. **Expanded card layout** — richer display for Live/Powered cards
5. **What's Ahead** — grid-spanning category summary header
6. **DayFocusDialog redesign** — mini-meters per day, 14-day forward window navigation
7. **Daily color theme** — golden-ratio hue, fun settings
8. **Settings cleanup** — remove old capacity controls, add Fun tab, storage usage display
9. **Documentation overhaul** — update all docs to reflect the redesign (see below)

---

## Process & Documentation

### OpenSpec + BMAD adoption

Phased adoption of spec-driven development tooling:

**Phase 1 — OpenSpec (immediate):** Adopt for staging discrete features during and after the redesign. Each new feature gets a structured proposal, delta specs (ADDED/MODIFIED/REMOVED), design doc, and task checklist. The Dark Souls messages module is the natural first candidate. Install the OpenSpec Claude Code skill and use it to manage the propose → apply → archive lifecycle.

**Phase 2 — BMAD (post-redesign):** Apply the full **BMAD** (Build More Architect Dreams) workflow to the next major initiative (analytics, monetization prep, or a future feature cycle). BMAD's agent-guided workflows (product brief → PRD → tech spec → sprint planning → stories) add structure for work that benefits from upfront product thinking. Already in use on other projects — applying it here builds consistency across the portfolio and exercises the full workflow on a product with commercial potential.

### Documentation update (post-implementation)

All project docs should be updated once the redesign lands:

- **README.md** — update the column table, philosophy bullets, features list, and both standards alignment tables (Kanban Method + ADHD Research) to reflect the new model. The 3-item capacity strengthens several alignment claims (see analysis in the redesign discussion).
- **CLAUDE.md** — update architecture notes: column model, capacity system (`dailyLimit` replacing energy budget), adapted BudgetBar, redesigned DayFocusDialog, What's Ahead, fun settings. Remove references to rolling window, `liveCapacity`, `energyBudget`.
- **todo.md** — remove completed items from this redesign, add any new items surfaced during implementation (e.g. analytics groundwork, fun module ideas).
- **docs/** — consider whether the redesign plan itself should be archived or replaced with a living spec (ties into Open Spec adoption above).
