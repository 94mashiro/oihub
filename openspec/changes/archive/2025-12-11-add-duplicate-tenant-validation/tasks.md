## 1. Implementation
- [x] 1.1 在 `tenant-store.ts` 的 `addTenant` 方法中添加重复校验逻辑
- [x] 1.2 校验失败时抛出包含重复账号名称的错误信息

## 2. Validation
- [x] 2.1 手动测试：添加重复账号（相同 url + userId）验证错误提示
- [x] 2.2 运行 `bun run compile` 确认类型检查通过
