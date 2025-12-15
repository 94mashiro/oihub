## MODIFIED Requirements
### Requirement: Consistent Spacing

All popup UI components SHALL follow a consistent spacing system:
- Internal element spacing: `gap-1` (4px) for icon-text pairs, `gap-2` (8px) for general internal gaps
- Component spacing: `gap-3` (12px)
- Section spacing: `gap-4` (16px)
- Settings panel internal spacing: `space-y-2` (8px) between title/description and content

#### Scenario: Accordion panel spacing
- **WHEN** user expands any accordion panel
- **THEN** the internal content SHALL use `gap-2` between elements
- **AND** the panel padding SHALL be consistent across all accordion items

#### Scenario: Settings panel spacing
- **WHEN** user views a settings panel with icon, title, and description
- **THEN** the icon and title SHALL use `gap-1` (4px) spacing
- **AND** the title and description SHALL use `space-y-2` (8px) vertical spacing
