## ADDED Requirements

### Requirement: Information Hierarchy

The popup UI SHALL display information in a clear three-tier visual hierarchy:
- **Tier 1 (Primary)**: Balance - largest font size (`text-2xl`), highest visual weight
- **Tier 2 (Secondary)**: Today's usage - displayed first with `font-medium` styling
- **Tier 3 (Tertiary)**: Historical usage - muted color, displayed after today's usage

#### Scenario: User views tenant card
- **WHEN** user opens the popup and views a tenant card
- **THEN** the balance SHALL be displayed in `text-2xl font-semibold`
- **AND** today's usage SHALL be displayed above historical usage with `font-medium`
- **AND** historical usage SHALL be displayed in `text-muted-foreground`

#### Scenario: User compares multiple tenants
- **WHEN** user scrolls through multiple tenant cards
- **THEN** the balance of each tenant SHALL be immediately visible without expanding
- **AND** the visual hierarchy SHALL be consistent across all cards

### Requirement: Number Formatting

The system SHALL format all numeric values with thousand separators for improved readability.

#### Scenario: Large balance display
- **WHEN** a tenant has a balance of 1234567.89
- **THEN** the display SHALL show "1,234,567.89" (or locale-appropriate format)

#### Scenario: Token count display
- **WHEN** a model has used 1000000 tokens
- **THEN** the display SHALL show "1,000,000" tokens

### Requirement: Model Usage Summary

The ModelUsagePanel SHALL display a summary row showing total cost and token usage before the individual model breakdown.

#### Scenario: User views model usage
- **WHEN** user expands the "模型消耗" accordion
- **THEN** a summary row SHALL appear at the top showing total cost and total tokens
- **AND** the summary row SHALL be visually distinct from individual model rows

### Requirement: Consistent Spacing

All popup UI components SHALL follow a consistent spacing system:
- Internal element spacing: `gap-2` (8px)
- Component spacing: `gap-3` (12px)
- Section spacing: `gap-4` (16px)

#### Scenario: Accordion panel spacing
- **WHEN** user expands any accordion panel
- **THEN** the internal content SHALL use `gap-2` between elements
- **AND** the panel padding SHALL be consistent across all accordion items

### Requirement: Usage Display Component

The UsageDisplay component SHALL format numeric values with thousand separators and use tabular-nums for alignment.

#### Scenario: Cost display formatting
- **WHEN** displaying a cost value
- **THEN** the value SHALL be formatted with thousand separators
- **AND** the digits SHALL use `tabular-nums` for consistent width

#### Scenario: Token display formatting
- **WHEN** displaying a token count
- **THEN** the value SHALL be formatted with thousand separators
- **AND** the digits SHALL use `tabular-nums` for consistent width
