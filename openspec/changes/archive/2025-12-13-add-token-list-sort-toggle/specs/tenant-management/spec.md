## ADDED Requirements
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
