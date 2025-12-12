# usage-display Specification

## Purpose
提供统一的用量展示组件，用于在 popup UI 中一致地展示费用（金额）和 token 消耗数据。

## ADDED Requirements

### Requirement: Usage Display Component
系统 SHALL 提供 `UsageDisplay` 组件，统一展示费用和 token 消耗数据。

#### Scenario: 完整数据展示
- **GIVEN** 组件接收到 cost 和 tokens 数据
- **WHEN** 渲染组件
- **THEN** 显示格式为 `{cost} / {tokens} tokens`
- **AND** cost 使用 `quotaToPrice` 格式化
- **AND** tokens 使用千分位格式化

#### Scenario: 仅费用数据
- **GIVEN** 组件仅接收到 cost 数据
- **WHEN** tokens 为 null 或 undefined
- **THEN** 仅显示费用 `{cost}`

#### Scenario: 仅 token 数据
- **GIVEN** 组件仅接收到 tokens 数据
- **WHEN** cost 为 null 或 undefined
- **THEN** 仅显示 `{tokens} tokens`

#### Scenario: 无数据
- **GIVEN** cost 和 tokens 都为 null 或 undefined
- **WHEN** 渲染组件
- **THEN** 显示占位符 `–`

#### Scenario: 自定义分隔符
- **GIVEN** 组件接收到 `separator` 属性
- **WHEN** 值为 `·`
- **THEN** 使用 `·` 作为费用和 tokens 之间的分隔符
- **AND** 格式为 `{cost} · {tokens} tokens`

#### Scenario: token 单复数
- **GIVEN** tokens 数量为 1 或更少
- **WHEN** 渲染组件
- **THEN** 显示 `token`（单数形式）
- **AND** 当 tokens > 1 时显示 `tokens`（复数形式）

### Requirement: Component Integration
现有用量展示位置 SHALL 使用 `UsageDisplay` 组件替换内联格式化逻辑。

#### Scenario: TenantSelectCard 集成
- **GIVEN** TenantSelectCard 组件的「今日消耗」部分
- **WHEN** 展示今日费用和 token 消耗
- **THEN** 使用 `UsageDisplay` 组件
- **AND** 保持现有的展示格式不变

#### Scenario: ModelUsagePanel 集成
- **GIVEN** ModelUsagePanel 组件的模型用量列表
- **WHEN** 展示每个模型的费用和 token 消耗
- **THEN** 使用 `UsageDisplay` 组件
- **AND** 使用 `separator="·"` 保持现有分隔符风格
