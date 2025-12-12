## ADDED Requirements

### Requirement: Default Store Persistence
所有 Zustand store 必须（SHALL）使用项目的 `createStore` 工厂函数创建（位于 `lib/state/create-store.ts`），默认将状态持久化到 WXT storage。

#### Scenario: 创建新 store
- **WHEN** 开发者需要创建新的 store
- **THEN** 必须使用 `createStore` 工厂函数（从 `@/lib/state/create-store` 导入）
- **AND** 必须定义 `<Feature>PersistedState` 类型
- **AND** 必须配置 `persistConfig.keys` 声明持久化字段
- **AND** 必须包含 `ready: boolean` 运行时字段

#### Scenario: 扩展重启后数据恢复
- **WHEN** 浏览器扩展重启或重新加载
- **THEN** 所有 store 的持久化数据自动从 storage 恢复
- **AND** UI 在 `ready` 为 true 后才渲染持久化数据

### Requirement: Store Classification Simplification
Store 分类必须（SHALL）简化为两种模式：持久化 store 和组件状态。

#### Scenario: 选择状态管理方式
- **WHEN** 开发者需要管理状态
- **THEN** 跨组件/跨上下文共享的状态使用 `createStore`（默认持久化）
- **AND** 仅限单个组件内部的状态使用 React hooks（useState/useReducer）

#### Scenario: 禁止 Zustand 原生 createStore
- **WHEN** 开发者尝试从 `zustand/vanilla` 导入 `createStore`
- **THEN** 代码审查必须拒绝该实现
- **AND** 要求使用项目的 `createStore`（从 `@/lib/state/create-store` 导入）

## REMOVED Requirements

### Requirement: Runtime Shared Store
**Reason**: 纯运行时 store 模式不再被支持，所有共享状态都应持久化
**Migration**: 将现有 Zustand 原生 `createStore` 调用迁移到项目的 `createStore`
