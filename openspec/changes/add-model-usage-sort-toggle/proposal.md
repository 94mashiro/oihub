# Change: Add Sort Toggle to Model Usage Panel

## Why
用户希望在模型消耗面板中能够切换排序方式，以便从不同维度（金额或 token 数量）查看模型使用情况。

## What Changes
- 在 `ModelUsagePanel` 组件中添加排序切换功能
- 默认按消耗金额（quota）降序排序
- 可切换为按消耗 token 数量降序排序
- 使用 `ToggleGroup` 组件实现切换 UI

## Impact
- Affected specs: `usage-display`
- Affected code: `components/biz/tenant-select-card/model-usage-panel.tsx`
