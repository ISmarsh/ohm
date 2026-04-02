# Card Display

## MODIFIED Requirements

### Requirement: Expanded card layout for Live and Powered

Cards in Live and Powered columns SHALL use an expanded layout: larger title (no truncation), description preview (first 2-3 lines), task checklist (interactive in Live, read-only in Powered), and category + scheduled date as secondary metadata.

#### Scenario: Live card with tasks

- **WHEN** a card in the Live column has a task checklist
- **THEN** the checklist is displayed with interactive toggle checkboxes

#### Scenario: Powered card with tasks

- **WHEN** a card in the Powered column has a task checklist
- **THEN** the checklist is displayed in read-only mode

### Requirement: Compact layout preserved for Charging and Grounded

Cards in Charging and Grounded columns SHALL keep the current compact layout: title, energy badge, category pill, task preview. The stale indicator (opacity fade after 14 days) SHALL remain.

#### Scenario: Stale card in Grounded

- **WHEN** a Grounded card has not been updated for more than 14 days
- **THEN** the card displays with reduced opacity (stale indicator)
