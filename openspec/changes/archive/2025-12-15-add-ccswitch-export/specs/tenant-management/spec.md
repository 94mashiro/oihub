## ADDED Requirements
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
