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

### Requirement: Token List Sort Toggle
令牌列表面板 SHALL 提供排序切换功能，允许用户在最后使用时间和消耗金额两种排序方式之间切换。

#### Scenario: Default sort by last accessed time
- **GIVEN** 用户打开令牌列表面板
- **WHEN** 面板首次加载
- **THEN** 令牌按最后使用时间（accessed_time）降序排列
- **AND** 「时间」排序选项处于选中状态

#### Scenario: Sort by used quota
- **GIVEN** 用户查看令牌列表
- **WHEN** 用户点击「金额」排序选项
- **THEN** 令牌按消耗金额（used_quota）降序排列
- **AND** 「金额」排序选项处于选中状态

#### Scenario: Sort toggle UI consistency
- **GIVEN** 令牌列表面板的排序切换 UI
- **WHEN** 渲染排序切换组件
- **THEN** 使用 `Tabs` 组件实现，与 `ModelUsagePanel` 保持一致的设计风格
- **AND** 切换按钮使用 `h-6` 高度和 `text-xs` 字体大小
- **AND** 切换按钮位于面板顶部

### Requirement: CC Switch Export
令牌列表 SHALL 提供将令牌导出到 CC Switch 的功能，通过 deeplink 实现一键配置。

#### Scenario: Export button display
- **GIVEN** 用户查看令牌列表
- **WHEN** 鼠标悬停在令牌项上
- **THEN** 显示「导出」按钮，与「复制」按钮并列

#### Scenario: App selection
- **GIVEN** 用户点击「导出」按钮
- **WHEN** 弹出应用选择器
- **THEN** 显示三个选项：Claude、Codex、Gemini
- **AND** 选项使用 Popover 或 DropdownMenu 组件呈现

#### Scenario: App selection icons
- **GIVEN** 应用选择器显示
- **WHEN** 用户查看选项列表
- **THEN** 每个选项显示对应提供商的官方 SVG 图标
- **AND** Claude 选项使用 `assets/claude.svg` 图标
- **AND** Codex 选项使用 `assets/openai.svg` 图标
- **AND** Gemini 选项使用 `assets/gemini.svg` 图标
- **AND** 图标使用 `currentColor` 填充，与菜单文字颜色一致
- **AND** 图标尺寸为 `size-3.5`，与现有设计风格一致

#### Scenario: Deeplink construction
- **GIVEN** 用户选择目标应用（如 codex）
- **WHEN** 系统构建 deeplink
- **THEN** URL 格式为 `ccswitch://v1/import?resource=provider&app={app}&name={name}&homepage={baseurl}&endpoint={endpoint}&apiKey={apiKey}`
- **AND** `app` 参数为用户选择的枚举值（claude / codex / gemini）
- **AND** `name` 参数为当前账号名称
- **AND** `homepage` 参数为当前账号的 baseurl（租户 URL）
- **AND** `endpoint` 参数：若 app 为 codex 则为 `{baseurl}/v1`，否则为 `{baseurl}`
- **AND** `apiKey` 参数为令牌 key 加上 `sk-` 前缀

#### Scenario: Deeplink navigation
- **GIVEN** deeplink 构建完成
- **WHEN** 系统执行跳转
- **THEN** 使用 `window.open(url)` 或 `location.href` 触发 CC Switch 应用

