# Tasks: Add Usage Threshold Alert

## 1. Infrastructure
- [x] 1.1 在 `wxt.config.ts` 添加 `notifications` 权限
- [x] 1.2 创建 `lib/state/setting-store.ts`，包含 `dailyUsageAlert` 和 `alertedToday` 字段
- [x] 1.3 创建 `lib/utils/quota-converter.ts`，实现 quota <-> 货币单位转换

## 2. Unit Tests
- [x] 2.1 创建 `lib/utils/quota-converter.test.ts`，测试转换函数
  - 测试 `quotaToCurrency` 正常转换
  - 测试 `currencyToQuota` 正常转换
  - 测试双向转换的可逆性
  - 测试边界值（0、负数、极大值）
- [x] 2.2 创建 `lib/state/setting-store.test.ts`，测试 store 操作
  - 测试 `setDailyUsageAlert` 保存配置
  - 测试 `markAlerted` 记录已告警
  - 测试 `clearAlertedToday` 清除告警记录

## 3. Settings UI
- [x] 3.1 在设置页面添加「额度告警」配置区域
- [x] 3.2 实现租户列表展示（带告警开关和阈值输入）
- [x] 3.3 阈值输入框展示货币单位，保存时转换为 quota
- [x] 3.4 添加表单验证（阈值必须为正数）
- [x] 3.5 处理 tenantInfo 未加载时的禁用状态

## 4. Alert Logic
- [x] 4.1 在 `entrypoints/background.ts` 添加告警检测函数
- [x] 4.2 实现 Notification API 调用逻辑
- [x] 4.3 添加告警去重机制（同一租户同一天只告警一次）
- [x] 4.4 实现跨日重置 `alertedToday` 逻辑

## 5. Integration
- [x] 5.1 在数据加载流程中触发告警检测

## 6. Validation
- [x] 6.1 运行 `bun test` 确保单元测试通过 (35 tests passed)
- [x] 6.2 运行 `bun run compile` 确保类型检查通过
- [x] 6.3 运行 `bun run build` 确保打包成功
- [x] 6.4 手动测试告警流程
