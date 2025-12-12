# Design: Add Usage Threshold Alert

## Context
用户管理多个租户的 API 额度，需要在用量达到预设阈值时收到通知。当前系统仅在 popup 中展示用量数据，缺乏主动告警机制。

### Stakeholders
- 终端用户：需要及时了解额度使用情况
- 扩展系统：需要在 background 中持续监控

### Constraints
- 浏览器扩展环境，需使用 `browser.notifications` API
- 告警配置需持久化，跨 popup/background 同步
- 遵循项目现有的 storage-state-rules 规范

## Goals / Non-Goals

### Goals
- 用户可为每个租户单独配置告警阈值
- 用量达到阈值时自动发送浏览器通知
- 配置持久化，重启浏览器后保留
- UI 层使用用户友好的货币单位，底层存储原始 quota

### Non-Goals
- 不实现邮件/短信等外部通知渠道
- 不实现复杂的告警规则（如多级阈值、百分比阈值）
- 不实现告警历史记录

## Decisions

### Decision 1: 统一设置存储
将告警配置作为 `setting-store` 的一个字段 `dailyUsageAlert` 进行维护，不单独创建 store。

```typescript
// lib/state/setting-store.ts

interface DailyUsageAlertConfig {
  enabled: boolean;
  threshold: number; // 底层存储原始 quota 值
}

type SettingPersistedState = {
  dailyUsageAlert: Record<TenantId, DailyUsageAlertConfig>;
  alertedToday: Record<TenantId, string>; // 记录今日已告警的租户，value 为日期字符串
};
```

**Rationale:**
- 插件设置信息统一管理，便于扩展其他设置项
- 避免 store 碎片化
- 存储键：`local:setting`

### Decision 2: 单位转换层设计
UI 层展示转换后的货币单位（如美元），底层存储原始 quota 值。

```typescript
// 转换工具函数 (lib/utils/quota-converter.ts)

// quota -> 货币（用于 UI 展示）
function quotaToCurrency(quota: number, tenantInfo: TenantInfo): number {
  const { quota_per_unit, usd_exchange_rate } = tenantInfo;
  // quota / quota_per_unit = USD, USD * usd_exchange_rate = CNY
  return (quota / quota_per_unit) * usd_exchange_rate;
}

// 货币 -> quota（用于存储）
function currencyToQuota(currency: number, tenantInfo: TenantInfo): number {
  const { quota_per_unit, usd_exchange_rate } = tenantInfo;
  // CNY / usd_exchange_rate = USD, USD * quota_per_unit = quota
  return (currency / usd_exchange_rate) * quota_per_unit;
}
```

**数据流:**
```
用户输入 (CNY)
  -> currencyToQuota()
  -> 存储 (quota)
  -> quotaToCurrency()
  -> UI 展示 (CNY)
```

**Rationale:**
- 用户习惯使用货币单位理解成本
- 底层存储 quota 保持与 cost 数据一致，便于比较
- 转换逻辑集中管理，避免分散

### Decision 3: 告警触发时机
在 cost 数据加载完成后检测告警，由 background script 统一处理。

**Rationale:**
- background script 在 popup 关闭后仍可运行
- 集中处理避免重复告警
- 利用现有的 cost-store 数据

### Decision 4: 告警去重机制
使用 `alertedToday` 字段记录当日已告警的租户，每天重置。

**Rationale:**
- 避免同一天重复告警骚扰用户
- 简单有效，无需复杂的时间窗口逻辑

### Decision 5: 通知权限处理
在 manifest 中声明 `notifications` 权限，首次使用时浏览器会自动请求用户授权。

## Risks / Trade-offs

### Risk: 用户拒绝通知权限
- **Mitigation**: 在设置页面提示用户需要授权通知权限，提供引导

### Risk: Background script 休眠
- **Mitigation**: 依赖 popup 打开时的数据刷新触发检测，不依赖定时轮询

### Risk: 汇率/单位信息缺失
- **Mitigation**: 当 tenantInfo 未加载时，禁用阈值输入或显示提示

### Trade-off: 简单阈值 vs 复杂规则
- 选择简单的固定数值阈值，降低实现复杂度
- 未来可扩展支持百分比阈值

## Migration Plan
无需迁移，新功能不影响现有数据结构。

## Open Questions
- 已解决：UI 展示货币单位（CNY），底层存储原始 quota
