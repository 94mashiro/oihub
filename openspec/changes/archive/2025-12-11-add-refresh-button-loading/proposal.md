# Change: Add loading state to refresh button

## Why
用户点击刷新按钮后无法感知刷新进度，需要在按钮上显示 loading 状态来提供视觉反馈。

## What Changes
- `useTenantDataRefresh` hook 返回 `isRefreshing` 状态
- 刷新按钮在 `refreshAll` 执行期间显示 loading 动画（RefreshCw 图标旋转）

## Impact
- Affected specs: data-loading
- Affected code: `hooks/use-tenant-data-refresh.ts`, `components/biz/tenant-select/index.tsx`
