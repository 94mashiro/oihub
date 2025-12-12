## ADDED Requirements

### Requirement: Announcement Display
The system SHALL display tenant announcements in the TenantSelectCard accordion panel with styling consistent with other panels (ModelUsagePanel, TokenListPanel, ApiEndpointsPanel).

#### Scenario: Single announcement display
- **WHEN** a tenant has exactly one announcement
- **THEN** the panel displays the announcement content with publish date
- **AND** no navigation controls are shown
- **AND** the content uses `text-xs` typography consistent with other panels

#### Scenario: Multiple announcements navigation
- **WHEN** a tenant has multiple announcements
- **THEN** the panel displays a compact navigation bar with date, page indicator (e.g., "1/3"), and prev/next buttons
- **AND** navigation buttons use `size-5` icon buttons matching other panel patterns
- **AND** announcements are sorted by publishDate descending (newest first)

#### Scenario: Markdown content rendering
- **WHEN** announcement content contains markdown
- **THEN** the content is rendered as HTML with XSS sanitization
- **AND** rendered content uses minimal styling without `prose` class
- **AND** links use `text-foreground underline` style
- **AND** paragraphs have appropriate spacing (`space-y-1.5`)
