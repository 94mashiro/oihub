# Change: Add tenant usage export

## Why
用户需要将各租户的额度/成本用量导出分享与留档，目前弹窗仅可视化，缺少导出能力。

## What Changes
- 在弹窗用量面板提供按租户导出 CSV 的操作入口
- 后台调用租户 API 拉取当前周期的用量数据并生成 CSV 文件
- 提供失败反馈与速率限制保护，确保导出可靠

## Impact
- Affected specs: tenant-usage
- Affected code: `entrypoints/popup`, `lib/api/services/tenant-api-service.ts`, `lib/state/*`（导出触发的状态管理）
