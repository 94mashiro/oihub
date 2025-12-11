# Change: 修复展开模型消耗时的重复 API 请求

## Why

当用户展开「模型消耗」AccordionPanel 时，系统会同时发起两个相同的 `/api/data/self?start_timestamp=...&end_timestamp=...&default_time=hour` 请求，导致：
1. 不必要的网络开销
2. 可能的竞态条件
3. 用户体验下降（重复加载状态）

根本原因：
- `ModelUsagePanel` 组件使用 `useCostLoader` hook，在组件挂载时（默认 period 为 `DAY_1`）会立即加载数据
- `useCostLoader` 的 `useEffect` 没有检查 store 中是否已有数据，每次组件挂载都会发起请求
- 可能由于 React 渲染机制或 Accordion 组件实现，导致组件挂载两次，或 `useEffect` 依赖项（如 `tenant` 对象引用）变化触发多次执行
- 没有去重机制，即使数据已存在也会重复请求

## What Changes

- **MODIFIED**: `useCostLoader` hook 增加数据存在性检查，避免重复请求已存在的数据
- **MODIFIED**: 数据加载策略，优先使用 store 中已有数据，仅在数据不存在时发起请求
- **保持**: 用户手动切换周期时仍会重新获取最新数据（符合现有 spec）
- **优化**: 使用 `useRef` 或请求去重机制，避免同一周期数据的并发请求

## Impact

- **Affected specs**: `data-loading` - 需要更新数据加载策略的说明
- **Affected code**:
  - `hooks/use-cost-loader.ts` - 增加数据存在性检查逻辑
  - `lib/state/cost-store.ts` - 可能需要添加辅助方法（如需要）
- **Breaking changes**: 无
