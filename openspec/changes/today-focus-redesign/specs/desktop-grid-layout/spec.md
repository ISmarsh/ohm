# Desktop Grid Layout

## ADDED Requirements

### Requirement: CSS grid for desktop columns

The desktop board layout (md+ breakpoint) SHALL use CSS grid with `grid-template-columns: repeat(4, 1fr)` for the four columns. BudgetBar remains fixed-bottom on all viewports.

#### Scenario: Desktop grid renders correctly

- **WHEN** the board renders on desktop (md+ breakpoint)
- **THEN** the layout uses a CSS grid with four equal columns for Powered, Live, Charging, and Grounded

### Requirement: Mobile stays single-column flex

Mobile layout SHALL remain a single-column flex stack with no grid. Order: Powered, Live, Charging, Grounded.

#### Scenario: Mobile layout renders as flex column

- **WHEN** the board renders on a mobile viewport (below md breakpoint)
- **THEN** the layout is a single-column flex stack without CSS grid
