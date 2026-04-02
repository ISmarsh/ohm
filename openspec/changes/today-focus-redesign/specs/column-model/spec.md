# Column Model

## MODIFIED Requirements

### Requirement: Column render order

The board SHALL render columns in the order Powered, Live, Charging, Grounded (left-to-right on desktop, top-to-bottom on mobile). A `COLUMN_ORDER` array SHALL control display sequence. `ColumnStatus` numeric values SHALL remain unchanged (Grounded=0, Charging=1, Live=2, Powered=3).

#### Scenario: Desktop column order

- **WHEN** the board renders on a desktop viewport (md+ breakpoint)
- **THEN** columns display left-to-right as Powered, Live, Charging, Grounded

#### Scenario: Mobile column order

- **WHEN** the board renders on a mobile viewport
- **THEN** columns stack top-to-bottom as Powered, Live, Charging, Grounded

### Requirement: Fixed scheduling horizon

The Charging column SHALL show cards scheduled within the next 14 days. Cards scheduled beyond 14 days SHALL remain in storage but be hidden from the UI. The configurable `windowSize` setting SHALL be removed from the UI.

#### Scenario: Card within 14-day horizon

- **WHEN** a card has `scheduledDate` within the next 14 days and `status` is CHARGING
- **THEN** the card is visible in the Charging column

#### Scenario: Card beyond 14-day horizon

- **WHEN** a card has `scheduledDate` more than 14 days in the future
- **THEN** the card is hidden from the Charging column but retained in storage
