# Change: Add Sort Toggle to Token List Panel

## Why
用户希望在令牌列表中能够切换排序方式，以便从不同维度（最后使用时间或消耗金额）查看令牌列表。当前令牌列表仅按最后使用时间降序排列，无法按消耗金额排序。

## What Changes
- 在 `TokenListPanel` 组件中添加排序切换功能
- 默认按最后使用时间（accessed_time）降序排序
- 可切换为按消耗金额（used_quota）降序排序
- 使用 `Tabs` 组件实现切换 UI，与 `ModelUsagePanel` 保持一致的设计风格

## Impact
- Affected specs: `tenant-management`
- Affected code: `components/biz/tenant-select-card/token-list-panel.tsx`
