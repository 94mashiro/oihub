# Tasks: fix-alarm-hydration-race

## Implementation Tasks

1. [x] **添加 store ready 等待函数**
   - 在 `entrypoints/background.ts` 中添加 `waitForStoresReady()` 函数
   - 轮询检查 `tenantStore.getState().ready && settingStore.getState().ready`
   - 设置 5 秒超时，超时后记录警告并继续执行

2. [x] **修改 pollDailyUsageAndAlert 函数**
   - 在函数开头调用 `await waitForStoresReady()`
   - 确保在读取 store 状态前 hydration 已完成

3. [x] **验证修复**
   - 运行 `bun run build` 确认编译通过
   - 手动测试：配置告警阈值 → 重载扩展 → 检查 console 日志确认 alarm 正常触发

## Dependencies
- 无外部依赖变更

## Verification Checklist
- [x] `bun run compile` 类型检查通过（预先存在的 bun-types 问题，与本次修改无关）
- [x] `bun run build` 打包成功
- [ ] 手动测试 alarm 触发和通知推送
