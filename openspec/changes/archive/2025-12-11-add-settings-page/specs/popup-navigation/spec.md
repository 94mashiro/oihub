## ADDED Requirements

### Requirement: Settings Page Navigation
The popup SHALL provide a settings page accessible from the main screen header.

#### Scenario: Navigate to settings
- **WHEN** user clicks the settings button in the main screen header
- **THEN** the popup navigates to the settings page

#### Scenario: Return from settings
- **WHEN** user clicks the back button on the settings page
- **THEN** the popup navigates back to the previous route

### Requirement: Settings Page Layout
The settings page SHALL display a header with title and back button.

#### Scenario: Settings page header
- **WHEN** the settings page is displayed
- **THEN** the header shows "Settings" title and a back button on the left
