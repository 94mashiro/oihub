# Change: Add Unit Tests for Core Pure Functions

## Why
项目当前缺少测试套件，核心无副作用函数（纯函数）是最适合单元测试的目标。为这些函数添加测试可以提高代码质量、防止回归，并为后续测试扩展奠定基础。

## What Changes
- 引入 Bun 内置测试框架（无需额外依赖）
- 为以下核心纯函数添加单元测试：
  - `getTimestampRange()` - 时间戳范围计算
  - `APIError.isRetryable` - 错误重试判断
  - `getSelectedTenant()` - 租户选择器
  - `cn()` - CSS 类名合并工具
- 添加 `bun run test` 脚本

## Impact
- Affected specs: 无（新增能力）
- Affected code:
  - `package.json` - 添加 test 脚本
  - `lib/api/services/tenant-api-service.ts` - 导出 `getTimestampRange` 以便测试
  - 新增测试文件：`lib/**/*.test.ts`
