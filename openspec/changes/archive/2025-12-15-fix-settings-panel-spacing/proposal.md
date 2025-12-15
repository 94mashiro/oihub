# Change: 修复设置页面面板间距一致性

## Why
设置页面的 FramePanel 内部间距不符合设计规范：
1. `space-y-3` (12px) 导致标题和 description 之间间距过大
2. 图标和标题之间的 `gap-1.5` (6px) 与其他组件不一致，应为 `gap-1` (4px)

## What Changes
- 将 `space-y-3` 改为 `space-y-2`，减少标题与 description 之间的间距
- 将图标和标题之间的 `gap-1.5` 改为 `gap-1`，与其他组件保持一致

## Impact
- Affected specs: popup-ui-design
- Affected code: `components/biz-screen/popup-settings-screen/index.tsx`
