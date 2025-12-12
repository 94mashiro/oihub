## MODIFIED Requirements
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
- **AND** 使用 `separator="/"` 保持现有分隔符风格

#### Scenario: ModelUsagePanel 排序切换
- **GIVEN** ModelUsagePanel 组件的模型用量列表
- **WHEN** 用户查看模型消耗数据
- **THEN** 默认按消耗金额（quota）降序排序
- **AND** 提供切换按钮可切换为按 token 数量降序排序
- **AND** 切换按钮位于时间周期选择器右侧
