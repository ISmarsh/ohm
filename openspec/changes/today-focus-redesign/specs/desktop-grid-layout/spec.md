# Desktop Grid Layout

## ADDED Requirements

### Requirement: CSS grid with spanning headers

The desktop board layout (md+ breakpoint) SHALL use CSS grid with `grid-template-columns: repeat(4, 1fr)`. Two header sections SHALL span 2 columns each: BudgetBar (cols 1-2) and What's Ahead (cols 3-4).

#### Scenario: Desktop grid renders correctly

- **WHEN** the board renders on desktop (md+ breakpoint)
- **THEN** the layout uses a CSS grid with BudgetBar spanning columns 1-2 above Powered and Live, and What's Ahead spanning columns 3-4 above Charging and Grounded

### Requirement: Mobile stays single-column flex

Mobile layout SHALL remain a single-column flex stack with no grid. Order: BudgetBar at top, Live, What's Ahead (section divider), Charging, Grounded.

#### Scenario: Mobile layout renders as flex column

- **WHEN** the board renders on a mobile viewport (below md breakpoint)
- **THEN** the layout is a single-column flex stack without CSS grid
