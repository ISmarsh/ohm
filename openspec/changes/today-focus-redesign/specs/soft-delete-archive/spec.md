# Soft-Delete Archive

## ADDED Requirements

### Requirement: Archive on day rollover

On day rollover (or app open on new day), yesterday's Powered cards SHALL receive an `archivedAt` ISO timestamp. Cards with `archivedAt` SHALL be excluded from all rendering and capacity counts.

#### Scenario: Day rollover archives yesterday's Powered cards

- **WHEN** the app loads or detects a new day
- **THEN** Powered cards from yesterday receive `archivedAt` set to the current ISO timestamp
- **THEN** those cards no longer appear in the Powered column or any capacity counts

### Requirement: 14-day retention with auto-prune

`sanitizeBoard()` SHALL prune cards where `archivedAt` is older than 14 days. It SHALL strip `archivedAt` from non-Powered cards as defensive cleanup.

#### Scenario: Prune expired archived cards

- **WHEN** `sanitizeBoard()` runs and a card has `archivedAt` older than 14 days
- **THEN** the card is permanently deleted from `board.cards`

#### Scenario: Strip archivedAt from non-Powered card

- **WHEN** `sanitizeBoard()` runs and a non-Powered card has `archivedAt`
- **THEN** the `archivedAt` field is removed from that card

### Requirement: archivedAt data model

`OhmCard` SHALL include an optional `archivedAt?: string` field (ISO timestamp). No separate `archivedCards` array SHALL be used.

#### Scenario: Archived card queryable for analytics

- **WHEN** a card has `archivedAt` set and is within the 14-day retention window
- **THEN** it is accessible via `board.cards.filter(c => c.archivedAt)` for future analytics
