# tenant-management Specification

## Purpose
TBD - created by archiving change add-duplicate-tenant-validation. Update Purpose after archive.
## Requirements
### Requirement: Duplicate Tenant Validation
系统在添加租户时 SHALL 校验是否存在重复账号，重复定义为 `url` + `userId` 组合相同。

#### Scenario: Duplicate tenant rejected
- **WHEN** 用户尝试添加一个租户，其 `url` 和 `userId` 与已存在租户相同
- **THEN** 系统拒绝添加并抛出错误，错误信息包含已存在账号的名称

#### Scenario: Unique tenant accepted
- **WHEN** 用户添加一个租户，其 `url` + `userId` 组合在现有列表中不存在
- **THEN** 系统正常添加该租户

### Requirement: Unified Daily Usage Display
租户卡片 SHALL 将今日消耗数据以单一标签「今日消耗」展示，同时呈现费用（金额）和用量（tokens）两种单位。

#### Scenario: Both cost and tokens available
- **GIVEN** 租户今日有消耗数据
- **WHEN** 用户查看租户卡片
- **THEN** 显示格式为 `今日消耗    $X.XX / N tokens`，其中 $X.XX 为费用金额，N 为 token 数量

#### Scenario: Only cost available
- **GIVEN** 租户今日仅有费用数据，无 token 数据
- **WHEN** 用户查看租户卡片
- **THEN** 显示格式为 `今日消耗    $X.XX`

#### Scenario: Only tokens available
- **GIVEN** 租户今日仅有 token 数据，无费用数据
- **WHEN** 用户查看租户卡片
- **THEN** 显示格式为 `今日消耗    N tokens`

#### Scenario: No data available
- **GIVEN** 租户今日无任何消耗数据
- **WHEN** 用户查看租户卡片
- **THEN** 显示格式为 `今日消耗    –`

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

