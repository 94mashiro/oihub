# Change: Add Background Daily Usage Polling

## Why
目前当日额度预警依赖 popup 触发刷新（`use-tenant-data-refresh.ts` → `CHECK_USAGE_ALERT`），当用户长时间不打开 popup 时无法及时告警。需要 background 自行定时拉取当日用量并触发同样的阈值告警。

## What Changes
- 在 `entrypoints/background.ts` 中增加定时任务（默认每 1 分钟）拉取启用告警的租户的当日消费数据（`CostPeriod.DAY_1`），计算今日用量（quota 总和）。
- 用量达到/超过阈值时，复用现有 `checkAndTriggerAlert()` 逻辑发送通知并记录去重状态。
- （可选）使用 `browser.alarms` 代替 `setInterval` 以适配 MV3 service worker 的休眠；若采用需在 manifest 中新增 `alarms` 权限。

## Impact
- Affected specs: `usage-alert`
- Affected code:
  - `entrypoints/background.ts`
  - `lib/api/services/tenant-api-service.ts`（只复用，不改接口）
  - `lib/state/*-store.ts`（复用：tenant/cost/setting）
  - `wxt.config.ts`（仅在采用 alarms 时修改权限）

