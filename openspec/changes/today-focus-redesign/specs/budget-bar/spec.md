# Budget Bar

## MODIFIED Requirements

### Requirement: Item-count capacity model

The BudgetBar SHALL use item count instead of energy sum for capacity. `dailyLimit` (default 3, range 1-5) SHALL replace `liveCapacity` and `energyBudget`. Capacity SHALL equal cards in Live plus today's Powered cards vs `dailyLimit`.

#### Scenario: Today indicator display

- **WHEN** the BudgetBar renders for today
- **THEN** it SHALL show a prominent 3-segment display where each segment represents one slot filled left-to-right based on Live + today's Powered card count

#### Scenario: Overflow beyond daily limit

- **WHEN** cards in Live + today's Powered exceed `dailyLimit`
- **THEN** the meter SHALL show a "+N" badge with no hard block

### Requirement: Daily segments with energy tinting

Each day in the 14-day forward window SHALL show filled/empty pips for scheduled cards vs `dailyLimit`. Pips SHALL be colored and sized by card energy levels to convey visual weight without affecting capacity math.

#### Scenario: Day with scheduled cards

- **WHEN** a future day has 2 cards scheduled and `dailyLimit` is 3
- **THEN** 2 of 3 pips are filled, tinted by those cards' energy levels

### Requirement: Total row

The total row SHALL show item count across the forward window. It SHALL pulse when total exceeds window capacity.

#### Scenario: Over-capacity total

- **WHEN** total scheduled cards across the 14-day window exceed `dailyLimit * 14`
- **THEN** the total row SHALL display a pulsing animation

### Requirement: Desktop layout position

The BudgetBar SHALL move from fixed-bottom positioning to the CSS grid header area on desktop (spanning columns 1-2). Mobile positioning SHALL remain at the top of the screen.

#### Scenario: Desktop grid placement

- **WHEN** the board renders on desktop (md+ breakpoint)
- **THEN** BudgetBar renders in the grid header spanning columns 1-2

### Requirement: DayFocusDialog trigger

Day-click in the BudgetBar SHALL open the DayFocusDialog for that date.

#### Scenario: Day click opens dialog

- **WHEN** user clicks a day segment in the BudgetBar
- **THEN** the DayFocusDialog opens for the clicked date
