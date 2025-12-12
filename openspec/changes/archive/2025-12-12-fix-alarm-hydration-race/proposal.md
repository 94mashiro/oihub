# Proposal: fix-alarm-hydration-race

## Summary
修复 background 脚本中 alarm API 触发时 store 尚未 hydrate 完成导致告警逻辑无法正常执行的竞态问题。

## Problem Statement
当前 `entrypoints/background.ts` 中的 alarm 轮询逻辑存在以下问题：

1. **Store Hydration 竞态**：`pollDailyUsageAndAlert()` 在 background 脚本启动时立即执行（第 36 行），以及在 alarm 触发时执行（第 38-42 行）。但此时 `tenantStore` 和 `settingStore` 可能尚未完成 hydration。

2. **根本原因分析**：
   - `createStore` 使用 `queueMicrotask(() => void hydrate())` 延迟 hydration（`create-store.ts:177-179`）
   - background 脚本在 `defineBackground()` 回调中同步调用 `pollDailyUsageAndAlert()`
   - 由于 hydration 是异步的，`tenantStore.getState().tenantList` 和 `settingStore.getState().dailyUsageAlert` 在首次调用时返回空对象/数组
   - 结果：`enabledTenantIds.size === 0` 或 `targets.length === 0`，函数提前返回

3. **后续 alarm 触发同样受影响**：
   - MV3 service worker 可能在空闲时被终止
   - 重新唤醒时，store 需要重新 hydrate
   - alarm 触发时 store 可能仍未 ready

## Root Cause Evidence
```typescript
// background.ts:91-104
async function pollDailyUsageAndAlert(): Promise<void> {
  const { tenantList } = tenantStore.getState();  // 可能为空数组
  const settingState = settingStore.getState();   // dailyUsageAlert 可能为空对象

  const enabledTenantIds = new Set(
    Object.entries(settingState.dailyUsageAlert)  // 空对象 → 空 Set
      .filter(([, cfg]) => cfg?.enabled && cfg.threshold > 0)
      .map(([tenantId]) => tenantId),
  );

  if (enabledTenantIds.size === 0) return;  // 提前返回！

  const targets = tenantList.filter((t) => enabledTenantIds.has(t.id));
  if (targets.length === 0) return;  // 提前返回！
  // ...
}
```

## Proposed Solution
在 `pollDailyUsageAndAlert()` 执行前等待 store hydration 完成：

1. 添加 `waitForStoreReady()` 辅助函数，轮询检查 `store.getState().ready`
2. 在 `pollDailyUsageAndAlert()` 开头调用此函数
3. 设置合理的超时时间（如 5 秒），避免无限等待

## Impact
- 修复后，alarm 触发时能正确读取已配置的告警阈值和租户列表
- 通知将按预期推送给用户

## Alternatives Considered
1. **在 store 层暴露 Promise-based ready 接口**：需要修改 `createStore` 工厂函数，影响范围较大
2. **使用 store.subscribe 监听 ready 变化**：代码复杂度较高，且需要处理取消订阅

选择轮询方案因为：实现简单、影响范围小、符合现有代码风格。
