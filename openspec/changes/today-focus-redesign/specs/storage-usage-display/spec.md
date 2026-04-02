# Storage Usage Display

## ADDED Requirements

### Requirement: Browser origin storage indicator

The Settings Data tab SHALL display browser origin storage usage via `navigator.storage.estimate()` as a usage/quota visual bar. The display SHALL fall back gracefully if the API is unavailable.

#### Scenario: Storage API available

- **WHEN** `navigator.storage.estimate()` is supported
- **THEN** a visual bar shows usage vs quota with numeric labels

#### Scenario: Storage API unavailable

- **WHEN** `navigator.storage.estimate()` is not supported
- **THEN** the browser storage indicator is hidden or shows "unavailable"

### Requirement: localStorage estimate

The Data tab SHALL show an estimated localStorage usage calculated via `JSON.stringify` of all keys, displayed against a ~5MB nominal limit (shown as approximate).

#### Scenario: localStorage with data

- **WHEN** localStorage contains board data
- **THEN** the display shows estimated size (e.g., "1.2 MB / ~5 MB")

### Requirement: Google Drive quota

When Google Drive is connected, the Data tab SHALL show appDataFolder usage against the 10MB per-app limit alongside the "Connected" status.

#### Scenario: Drive connected with data

- **WHEN** Google Drive is connected and the board file exists
- **THEN** the display shows file size vs 10MB limit (e.g., "0.3 MB / 10 MB")

#### Scenario: Drive not connected

- **WHEN** Google Drive is not connected
- **THEN** the Drive quota indicator is hidden
