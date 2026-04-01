# Settings

## MODIFIED Requirements

### Requirement: Simplified Board tab

The Board settings tab SHALL show: daily limit spinner (1-5, default 3), energy scale (unchanged), and categories (unchanged). Live capacity, total budget, auto-budget, and window size controls SHALL be removed.

#### Scenario: Board tab displays daily limit

- **WHEN** user opens the Board settings tab
- **THEN** a daily limit spinner is shown with range 1-5 and the current `dailyLimit` value

#### Scenario: Old capacity controls removed

- **WHEN** user opens the Board settings tab
- **THEN** no controls for live capacity, total budget, auto-budget, or window size are visible

## ADDED Requirements

### Requirement: Fun settings tab

A new Fun tab SHALL be added to Settings with a daily color theme toggle. A Dark Souls messages toggle SHALL be shown when available (separate PR).

#### Scenario: Fun tab with daily theme toggle

- **WHEN** user opens the Fun settings tab
- **THEN** a toggle for daily color theme is shown, reflecting `board.funSettings.dailyTheme`
