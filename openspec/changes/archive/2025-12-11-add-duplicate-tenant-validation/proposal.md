# Change: Add Duplicate Tenant Validation

## Why
用户添加账号时可能误添加重复账号（相同 baseUrl + userId），导致数据冗余和管理混乱。需要在添加前校验唯一性并给出明确的失败提示。

## What Changes
- 在 `addTenant` 方法中增加重复校验逻辑
- 重复定义维度：`url` + `userId` 组合唯一
- 校验失败时抛出包含具体原因的错误

## Impact
- Affected specs: tenant-management (new capability)
- Affected code: `lib/state/tenant-store.ts`, `components/biz-screen/popup-tenant-create-screen/index.tsx`
