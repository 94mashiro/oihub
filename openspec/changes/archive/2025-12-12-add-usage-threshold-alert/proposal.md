# Change: Add Usage Threshold Alert

## Why
用户需要在 API 使用额度接近或达到预设阈值时收到通知，以便及时管理成本和避免超支。当前系统仅展示用量数据，缺乏主动告警机制。

## What Changes
- 在设置页面添加「额度告警」配置区域
- 用户可为每个租户单独启用/禁用告警
- 用户可为每个租户设置今日额度阈值（UI 展示货币单位，底层存储原始 quota）
- 当租户今日用量达到或超过阈值时，通过浏览器 Notification API 发送通知
- 新增 `setting-store` 持久化存储设置信息，`dailyUsageAlert` 作为其中一个字段
- 新增 `lib/utils/quota-converter.ts` 处理 quota 与货币单位的转换
- 需要在 manifest 中添加 `notifications` 权限

## Impact
- Affected specs: 新增 `usage-alert` capability
- Affected code:
  - `wxt.config.ts` - 添加 notifications 权限
  - `lib/state/setting-store.ts` - 新增设置存储（含 dailyUsageAlert 字段）
  - `lib/utils/quota-converter.ts` - 新增单位转换工具
  - `components/biz-screen/popup-settings-screen/` - 添加告警配置 UI
  - `entrypoints/background.ts` - 添加告警检测和通知逻辑
