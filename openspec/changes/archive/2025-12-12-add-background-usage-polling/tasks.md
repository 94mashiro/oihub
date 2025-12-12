# Tasks: Add Background Daily Usage Polling

## 1. Spec
- [ ] 阅读并确认 `openspec/specs/usage-alert/spec.md` 现状与本变更 delta 对齐
- [ ] 校验 delta spec（`openspec validate add-background-usage-polling --strict`）

## 2. Implementation
- [ ] 在 `entrypoints/background.ts` 增加轮询调度（启动即跑一次 + 每 1 分钟一次）
- [ ] 实现 `pollDailyUsageAndAlert()`：
  - 读取租户列表和告警配置，只处理已启用告警的租户
  - 拉取 `CostPeriod.DAY_1` 消费数据并计算 `todayUsage`
  - 获取可用的 `tenantInfo`（缓存或 `getStatus()`）
  - 调用 `checkAndTriggerAlert()`
- [ ] （可选）若采用 `browser.alarms`：在 `wxt.config.ts` 添加 `alarms` 权限，并用 alarms 替换 `setInterval`

## 3. Validation
- [ ] 运行 `bun run compile`
- [ ] 手动验证：
  - 启用某租户告警并设置较低阈值
  - 关闭 popup，等待 1-2 分钟
  - 确认 background 触发通知且不会重复推送

