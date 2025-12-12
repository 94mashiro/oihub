# announcements Specification

## Purpose
TBD - created by archiving change add-announcements-display. Update Purpose after archive.
## Requirements
### Requirement: Announcement Panel Display
公告面板 SHALL 展示当前选中租户的公告内容和发布时间。

#### Scenario: Display announcement content
- **GIVEN** 选中租户有公告数据
- **WHEN** 公告面板渲染
- **THEN** 显示公告的 markdown 内容（已解析）和格式化的发布时间

#### Scenario: No announcements
- **GIVEN** 选中租户无公告数据或 announcements 为空数组
- **WHEN** PopupMainScreen 渲染
- **THEN** 不显示公告面板

### Requirement: Announcement Sorting
公告 SHALL 按发布时间降序排列（最新在前）。

#### Scenario: Sort by publishDate descending
- **GIVEN** 租户有多条公告，publishDate 分别为 "2025-12-10", "2025-12-13", "2025-12-11"
- **WHEN** 公告面板渲染
- **THEN** 公告按 "2025-12-13", "2025-12-11", "2025-12-10" 顺序展示

### Requirement: Announcement Navigation
当有多条公告时，用户 SHALL 能够切换查看不同公告。

#### Scenario: Navigate to next announcement
- **GIVEN** 当前显示第 1 条公告，共 3 条
- **WHEN** 用户点击「下一条」按钮
- **THEN** 显示第 2 条公告，指示器更新为 "2/3"

#### Scenario: Navigate to previous announcement
- **GIVEN** 当前显示第 2 条公告，共 3 条
- **WHEN** 用户点击「上一条」按钮
- **THEN** 显示第 1 条公告，指示器更新为 "1/3"

#### Scenario: Navigation boundary - first
- **GIVEN** 当前显示第 1 条公告
- **WHEN** 用户点击「上一条」按钮
- **THEN** 按钮禁用或无响应，保持显示第 1 条

#### Scenario: Navigation boundary - last
- **GIVEN** 当前显示最后一条公告
- **WHEN** 用户点击「下一条」按钮
- **THEN** 按钮禁用或无响应，保持显示最后一条

#### Scenario: Single announcement
- **GIVEN** 租户仅有 1 条公告
- **WHEN** 公告面板渲染
- **THEN** 不显示切换按钮和指示器

### Requirement: Markdown Rendering
公告内容 SHALL 支持基础 markdown 格式解析。

#### Scenario: Render basic markdown
- **GIVEN** 公告内容包含 markdown 格式（粗体、斜体、链接、列表等）
- **WHEN** 公告面板渲染
- **THEN** markdown 被正确解析为 HTML 并展示

#### Scenario: XSS prevention
- **GIVEN** 公告内容包含潜在 XSS 脚本
- **WHEN** 公告面板渲染
- **THEN** 脚本被过滤或转义，不执行

### Requirement: Date Formatting
发布时间 SHALL 以本地化格式展示。

#### Scenario: Format ISO date
- **GIVEN** publishDate 为 "2025-12-13T10:30:00Z"
- **WHEN** 公告面板渲染
- **THEN** 显示格式化时间如 "2025-12-13 10:30" 或本地化格式

