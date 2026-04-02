# Day Focus Dialog

## MODIFIED Requirements

### Requirement: Mini-meter display model

The DayFocusDialog SHALL replace the energy ratio display with a mini 3-segment meter per day. The meter SHALL show item count vs `dailyLimit`, matching BudgetBar style. Card energy SHALL tint the meter segments for visual weight.

#### Scenario: Mini-meter for a day with 2 cards

- **WHEN** the dialog shows a day with 2 scheduled cards and `dailyLimit` is 3
- **THEN** a 3-segment meter displays with 2 segments filled, tinted by card energy levels

### Requirement: 14-day forward navigation

Navigation SHALL use left/right arrows and swipe through the 14-day forward window. `availableDates` SHALL be sourced from the forward scheduling horizon.

#### Scenario: Navigate to next day

- **WHEN** user taps the right arrow or swipes left
- **THEN** the dialog advances to the next day in the 14-day forward window

#### Scenario: Boundary at window end

- **WHEN** the dialog is showing the last day in the 14-day window
- **THEN** the forward navigation arrow is disabled

### Requirement: Preserved card interactions

Card rows SHALL display energy badges, category, and metadata. Reschedule actions (Tomorrow, Pick Date, Clear) and drag-and-drop reorder within status groups SHALL be preserved.

#### Scenario: Reschedule a card to tomorrow

- **WHEN** user selects "Tomorrow" on a card in the dialog
- **THEN** the card's `scheduledDate` updates to tomorrow and it moves to that day's group
