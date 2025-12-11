# Change: Refactor to Lazy-Load Non-Essential Data

## Why
当前 `refreshAll` 在 popup 打开时立即为所有租户获取全部数据（balance、tokens、tokenGroups、cost），导致不必要的 API 调用和存储写入。TenantSelectCard 默认只展示 tenant 基本信息、余额和今日消耗，其余数据（令牌列表、模型消耗详情、API 端点）仅在展开 Accordion 时才需要。

## What Changes
- **token-store**: 移除持久化，改为纯内存 store
- **cost-store**: 移除持久化，改为纯内存 store（除 DAY_1 外的周期数据）
- **refreshAll**: 仅获取 TenantSelectCard 默认展示所需数据（tenantInfo、balance、DAY_1 cost）
- **AccordionPanel 组件**: 每次展开/渲染时都调用接口获取最新数据（tokens、tokenGroups、其他周期 cost），不使用缓存策略

## Impact
- Affected specs: data-loading (新建)
- Affected code:
  - `lib/state/token-store.ts`
  - `lib/state/cost-store.ts`
  - `hooks/use-tenant-data-refresh.ts`
  - `components/biz/tenant-select-card/token-list-panel.tsx`
  - `components/biz/tenant-select-card/model-usage-panel.tsx`
