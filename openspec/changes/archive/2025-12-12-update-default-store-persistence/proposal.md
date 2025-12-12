# Change: 将持久化作为 Store 的默认设计

## Why
当前项目中存在两种 store 模式：持久化 store（使用 `createPersistentStore`）和纯运行时 store（使用 `createStore`）。这种不一致性增加了认知负担，且实际上没有场景需要纯运行时 store——所有数据都可以从持久化中受益，包括缓存数据（如 cost、token）在扩展重启后的快速恢复。

## What Changes
- **BREAKING**: 废弃 Zustand 原生 `createStore`，将 `createPersistentStore` 重命名为 `createStore` 作为默认实现
- 重构 `lib/state/create-persistent-store.ts` → `lib/state/create-store.ts`
- 迁移 `cost-store.ts` 和 `token-store.ts` 使用新的 `createStore`
- 更新所有现有 store 的导入路径
- 更新 `docs/storage-state-rules.md` 移除"运行时 store"分类
- 简化 store 分类：只保留"持久化 store"和"组件状态"两种

## Impact
- Affected specs: state-management (新建)
- Affected code:
  - `lib/state/create-persistent-store.ts` → `lib/state/create-store.ts` (重命名)
  - `lib/state/tenant-store.ts` - 更新导入
  - `lib/state/balance-store.ts` - 更新导入
  - `lib/state/setting-store.ts` - 更新导入
  - `lib/state/cost-store.ts` - 迁移到新 `createStore`
  - `lib/state/token-store.ts` - 迁移到新 `createStore`
  - `docs/storage-state-rules.md` - 更新规则文档
