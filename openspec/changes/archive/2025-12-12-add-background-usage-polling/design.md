# Design: Background Usage Polling

## Goals
- Background 在无 popup 打开情况下也能每分钟检查各租户当日用量并触发额度告警。
- 尽量复用现有数据结构、API 封装和告警去重逻辑，避免引入新依赖。

## Non-Goals
- 不改变现有 popup 刷新、用量展示、阈值配置 UI 的行为。
- 不引入新的告警类型或跨设备同步机制。

## Proposed Approach
1. **选择轮询租户**
   - 从 `tenantStore.getState().tenantList` 读取租户列表。
   - 从 `settingStore.getState().dailyUsageAlert` 读取配置，仅对 `enabled=true && threshold>0` 的租户发起请求。

2. **获取当日用量**
   - 对每个目标租户创建 `TenantAPIService(tenant)`。
   - 调用 `getCostData(CostPeriod.DAY_1)` 获取当日消费条目。
   - 计算 `todayUsage = sum(costData[].quota)`。
   - 若 `tenant.info` 不存在，可同时调用 `getStatus()` 以获得 `quota_per_unit/quota_display_type` 用于通知展示（可与 cost 拉取并行）。

3. **触发告警**
   - 调用 background 内部的 `checkAndTriggerAlert(tenantId, tenantName, tenantInfo, todayUsage)`。
   - 继续沿用 `alertedToday` 去重和跨日清理逻辑。

4. **调度策略**
   - 默认实现：`setInterval(poll, 60_000)` 并在 background 启动时立即执行一次。
   - 可选实现：使用 `browser.alarms.create('poll-daily-usage', { periodInMinutes: 1 })` + `browser.alarms.onAlarm`。需要新增 manifest 权限 `alarms`，但可在 MV3 service worker 休眠后自动唤醒，可靠性更高。

## Trade-offs
- **API 调用频率**：每分钟 * 启用告警租户数；调用通过现有 RateLimiter 进行 QPS 控制。若租户数较多，后续可考虑指数退避或分批轮询。
- **Service worker 生命周期**：`setInterval` 实现更轻量，但在 MV3 下可能因 worker 休眠而不稳定；`alarms` 稍增权限但更可靠。

## Risks / Mitigations
- **瞬时网络/接口错误**：使用 `Promise.allSettled`，单租户失败不影响下一轮；记录日志。
- **tenant.info 为空导致通知展示异常**：优先使用已缓存 `tenant.info`，缺失时补拉 `getStatus()`。

