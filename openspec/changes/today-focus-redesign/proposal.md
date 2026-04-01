# Today Focus Redesign

## Why

OHM's rolling-window energy planner creates cognitive overhead for ADHD users -- configurable windows, energy budgets, and capacity math add friction to what should be a "what am I doing right now?" tool. Shifting to a today-focused model with a flat item limit simplifies the mental model, puts completed wins front-and-center, and aligns with how ADHD brains actually engage with task management.

## What Changes

- **Column reorder**: Powered (done) leads, followed by Live, Charging, Grounded -- reading direction becomes present -> future -> someday
- **BudgetBar adaptation**: energy-based segments become item-count pips with energy tinting; flat `dailyLimit` (default 3) replaces `liveCapacity` and `energyBudget`
- **Fixed 14-day windows**: symmetric forward (Charging horizon) and back (archive retention) replacing configurable `windowSize`
- **Soft-delete archive**: Powered cards get `archivedAt` timestamp on day rollover, pruned after 14 days (preserves data for future analytics)
- **DayFocusDialog redesign**: mini 3-segment meters per day, forward-looking navigation through 14-day window
- **Desktop CSS grid layout**: two spanning header sections (BudgetBar above Powered+Live, What's Ahead above Charging+Grounded) above four columns
- **Expanded card display**: richer layout for Live/Powered cards (full title, description preview, interactive checklists)
- **What's Ahead summary**: category count chips spanning above Charging+Grounded
- **Daily color theme**: deterministic daily accent via golden-ratio hue rotation (opt-in fun setting)
- **Fun settings system**: `funSettings` on OhmBoard with `dailyTheme` toggle (Dark Souls messages deferred to separate PR)
- **Settings cleanup**: remove old capacity controls, add Fun tab, add storage usage display in Data tab
- **BREAKING**: `liveCapacity`, `energyBudget`, `windowSize`, `autoBudget` deprecated (kept in type, ignored by logic)

## Capabilities

### New Capabilities

- `soft-delete-archive` -- card archival with `archivedAt` field, 14-day retention, prune on sanitize
- `desktop-grid-layout` -- CSS grid with spanning headers replacing flex row
- `whats-ahead-summary` -- category count chips for Charging+Grounded cards
- `daily-color-theme` -- golden-ratio hue rotation, fun settings toggle
- `storage-usage-display` -- browser/localStorage/Drive quota indicators in Settings Data tab

### Modified Capabilities

- `column-model` -- render order change (COLUMN_ORDER array), 14-day scheduling horizon
- `budget-bar` -- energy-based to item-count capacity, energy tinting, dailyLimit field
- `day-focus-dialog` -- mini-meters per day, forward-looking 14-day navigation
- `card-display` -- expanded layout for Live/Powered, compact kept for Charging/Grounded
- `settings` -- remove old capacity controls, add Fun tab
- `board-sanitization` -- funSettings default, archivedAt prune/cleanup, dailyLimit migration

## Impact

- **Data model**: `OhmCard` gains `archivedAt?: string`; `OhmBoard` gains `dailyLimit`, `funSettings`
- **Components**: Board.tsx (grid layout, column order), BudgetBar.tsx (full rewrite of display logic), DayFocusDialog.tsx (mini-meters, new navigation), SettingsPage.tsx (tab changes, storage display), Card.tsx (expanded variant)
- **Utilities**: board-utils.ts (archive helpers, capacity calculation changes), storage.ts (sanitizeBoard migration steps)
- **Styles**: index.css (grid layout, daily color CSS custom property)
- **No external dependencies added**
