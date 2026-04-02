# What's Ahead Summary

## ADDED Requirements

### Requirement: Category count chips

The What's Ahead component SHALL display category counts across Charging and Grounded cards as colored chips. Uncategorized cards SHALL be omitted or shown as "other".

#### Scenario: Multiple categories

- **WHEN** Charging + Grounded cards span 3 categories (work: 4, personal: 2, health: 1)
- **THEN** the component displays chips: `work x4`, `personal x2`, `health x1`

#### Scenario: No categorized cards

- **WHEN** all Charging + Grounded cards are uncategorized
- **THEN** the component shows a single "other" chip or is hidden

### Requirement: Desktop grid placement

On desktop, the component SHALL render as a shared header above Charging + Grounded columns (grid-column: span 2, cols 3-4).

#### Scenario: Desktop header rendering

- **WHEN** the board renders on desktop
- **THEN** What's Ahead spans columns 3-4 in the grid header row

### Requirement: Mobile section divider

On mobile, the component SHALL render between the Live and Charging sections as a section divider with a single scrollable row if chips overflow.

#### Scenario: Mobile overflow scrolling

- **WHEN** there are more category chips than fit in the viewport width
- **THEN** the chip row is horizontally scrollable
