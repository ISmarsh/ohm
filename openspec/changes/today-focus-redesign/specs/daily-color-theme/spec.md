# Daily Color Theme

## ADDED Requirements

### Requirement: Golden-ratio daily hue

The system SHALL compute a daily accent hue using the golden angle: `(dayIndex * 137.508) % 360` where `dayIndex` is days since epoch. This maximizes perceptual distance between consecutive days.

#### Scenario: Consecutive days have distinct hues

- **WHEN** the daily theme is active on two consecutive days
- **THEN** the accent hues differ by approximately 137.5 degrees

### Requirement: Theme application

When `funSettings.dailyTheme` is true, `--color-ohm-spark` SHALL shift to the daily hue (keeping same saturation/lightness). Column header tints SHALL get a subtle hue blend toward the daily color. Background and text colors SHALL stay fixed for readability.

#### Scenario: Daily theme active

- **WHEN** `funSettings.dailyTheme` is true
- **THEN** `--color-ohm-spark` reflects the daily hue and column headers show a subtle tint

#### Scenario: Daily theme off

- **WHEN** `funSettings.dailyTheme` is false or undefined
- **THEN** all colors use their default values

### Requirement: Fun settings toggle

The daily color theme SHALL be toggled via `board.funSettings.dailyTheme: boolean` (default false), shown in a new Fun tab in Settings.

#### Scenario: Toggle daily theme in settings

- **WHEN** user enables the daily color theme toggle in the Fun tab
- **THEN** `board.funSettings.dailyTheme` is set to true and the accent color updates
