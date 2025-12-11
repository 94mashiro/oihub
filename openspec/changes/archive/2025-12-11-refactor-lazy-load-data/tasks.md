## 1. Store Refactoring
- [x] 1.1 Convert `token-store` to non-persistent (remove `storage.defineItem`, use plain Zustand)
- [x] 1.2 Convert `cost-store` to non-persistent (remove `storage.defineItem`, use plain Zustand)
- [x] 1.3 Remove `hydrate` calls for token-store and cost-store from initialization flow

## 2. Refresh Logic
- [x] 2.1 Update `refreshTenantData` to only fetch: `getStatus`, `getSelfInfo`, `getCostData(DAY_1)`
- [x] 2.2 Remove `getTokens` and `getTokenGroups` from `refreshAll` flow

## 3. Data Fetching Hooks
- [x] 3.1 Create `useTokensLoader(tenantId)` hook - 每次调用都获取最新 tokens/tokenGroups
- [x] 3.2 Create `useCostLoader(tenantId, period)` hook - 每次调用都获取最新 cost 数据
- [x] 3.3 Remove `ensureCostLoaded` 的缓存检查逻辑

## 4. Component Integration
- [x] 4.1 Update `TokenListPanel` to use `useTokensLoader`，每次渲染时获取数据
- [x] 4.2 Update `ModelUsagePanel` to use `useCostLoader`，每次切换周期或渲染时获取数据

## 5. Validation
- [x] 5.1 Run `bun run compile` to verify type correctness
- [x] 5.2 Manual test: popup opens without fetching tokens/tokenGroups
- [x] 5.3 Manual test: expanding "令牌列表" accordion fetches tokens
- [x] 5.4 Manual test: switching cost period tabs fetches data
