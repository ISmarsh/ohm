# Board Sanitization

## MODIFIED Requirements

### Requirement: dailyLimit migration

`sanitizeBoard()` SHALL set `dailyLimit` to 3 if missing.

#### Scenario: Board loaded without dailyLimit

- **WHEN** a saved board has no `dailyLimit` field
- **THEN** `sanitizeBoard()` sets `dailyLimit` to 3

### Requirement: funSettings default

`sanitizeBoard()` SHALL default `funSettings` to `{}` if missing or non-object. This eliminates optional chaining on `funSettings` throughout the codebase.

#### Scenario: Board loaded without funSettings

- **WHEN** a saved board has no `funSettings` field
- **THEN** `sanitizeBoard()` sets `funSettings` to `{}`

### Requirement: Archive prune and cleanup

`sanitizeBoard()` SHALL prune cards where `archivedAt` is older than 14 days. It SHALL strip `archivedAt` from non-Powered cards as defensive cleanup.

#### Scenario: Expired archived card pruned

- **WHEN** a card has `archivedAt` set to 15 days ago
- **THEN** `sanitizeBoard()` removes the card from `board.cards`

#### Scenario: Non-Powered card with archivedAt

- **WHEN** a Charging card has an `archivedAt` field
- **THEN** `sanitizeBoard()` removes the `archivedAt` field from that card

## REMOVED Requirements

### Requirement: windowSize auto-budget calculation

The auto-budget calculation (`energyBudget = windowSize * liveCapacity`) SHALL no longer be performed. Fields `liveCapacity`, `energyBudget`, `windowSize`, `autoBudget` remain in the type for backwards compat but are ignored.

**Reason**: Capacity model changed from energy-based to item-count.
**Migration**: `dailyLimit` replaces both `liveCapacity` and `energyBudget`. No user action needed -- `sanitizeBoard()` handles the transition.

#### Scenario: Legacy fields ignored

- **WHEN** a saved board has `liveCapacity`, `energyBudget`, `windowSize`, or `autoBudget`
- **THEN** those fields are preserved in storage but ignored by all capacity logic
