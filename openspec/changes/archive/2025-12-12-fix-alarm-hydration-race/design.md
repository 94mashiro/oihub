# Design: fix-alarm-hydration-race

## Problem Analysis

### MV3 Service Worker 生命周期
```
┌─────────────────────────────────────────────────────────────┐
│  Service Worker 启动                                         │
│  ├─ defineBackground() 回调执行                              │
│  │   ├─ browser.alarms.create() ✓                           │
│  │   ├─ pollDailyUsageAndAlert() ← store 未 ready！          │
│  │   └─ browser.alarms.onAlarm.addListener() ✓              │
│  │                                                          │
│  └─ queueMicrotask → store.hydrate() ← 异步，稍后执行        │
└─────────────────────────────────────────────────────────────┘
```

### 竞态时序图
```
Time →
────────────────────────────────────────────────────────────────
defineBackground()     │ pollDailyUsageAndAlert()
                       │   ↓
                       │ tenantStore.getState()
                       │   → { ready: false, tenantList: [] }
                       │   ↓
                       │ return early (empty list)
────────────────────────────────────────────────────────────────
queueMicrotask         │ hydrate()
                       │   ↓
                       │ tenantStore ready = true
                       │ tenantList = [tenant1, tenant2, ...]
────────────────────────────────────────────────────────────────
```

## Solution Design

### waitForStoresReady 函数
```typescript
async function waitForStoresReady(timeoutMs = 5000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (tenantStore.getState().ready && settingStore.getState().ready) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  console.warn('Store hydration timeout, proceeding with current state');
  return false;
}
```

### 修改后的 pollDailyUsageAndAlert
```typescript
async function pollDailyUsageAndAlert(): Promise<void> {
  await waitForStoresReady();  // 新增：等待 hydration

  const { tenantList } = tenantStore.getState();
  const settingState = settingStore.getState();
  // ... 原有逻辑
}
```

## Trade-offs

| 方案 | 优点 | 缺点 |
|------|------|------|
| 轮询等待 (选择) | 简单、局部修改、无需改动 store 层 | 轮询有微小性能开销 |
| Store Promise API | 更优雅、一次性等待 | 需修改 createStore，影响所有 store |
| Subscribe + unsubscribe | 事件驱动、无轮询 | 代码复杂、需处理边界情况 |

## Risk Assessment
- **低风险**：修改仅限于 background.ts，不影响其他模块
- **超时处理**：即使超时也会继续执行，不会阻塞 service worker
