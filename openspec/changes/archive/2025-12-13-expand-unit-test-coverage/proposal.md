# Change: Expand Unit Test Coverage for Background Modules and Stores

## Why
当前单元测试只覆盖少量纯函数（`cn()`、`APIError.isRetryable`、`getTimestampRange()`、`getSelectedTenant()` 等），但以下关键逻辑缺少单测保护：
- `background-architecture` 规范中的消息路由与模块注册/清理（`messageRouter`/`moduleRegistry`）
- `fetch-proxy` 的响应解析与错误/超时路径
- `usage-alert` 规范要求的 `setting-store` 核心动作（`setDailyUsageAlert`、`markAlerted`、`clearAlertedToday`、`isAlertedToday`）

同时，`lib/state/*-store.ts` 目前从 `#imports` 引入 `storage`，在 `bun test` 运行时无法解析该虚拟模块，导致 store 模块难以被直接单测导入。

## What Changes
- 为 `lib/background` 增加单元测试：
  - `messageRouter`：路由分发、`init()` 幂等、仅注册一次 `onMessage.addListener`
  - `moduleRegistry`：初始化顺序、cleanup 逆序执行、重复 init/cleanup 的行为边界
  - `fetchProxyModule`：注册 `FETCH` handler，并覆盖 JSON/text 响应、非 2xx、超时等核心路径
- 补齐 `lib/state/setting-store.test.ts`，覆盖 `usage-alert` 规范要求的 store 动作与日期去重逻辑
- 为支持上述测试，做最小的可测试性改动：
  - 将 store 模块从 `#imports` 改为显式依赖 `wxt/utils/storage`
  - 测试中使用 `wxt/testing` 提供的 `fakeBrowser` 注入 `globalThis.browser`，以便 `storage.defineItem()` 在 Bun 环境下工作

## Impact
- Affected specs:
  - `unit-testing`（补充对 background/store 的测试要求与执行方式）
  - `background-architecture`（行为已存在，本次补齐对应单测）
  - `usage-alert`（行为已存在，本次补齐对应单测）
- Affected code (implementation stage):
  - `lib/state/*.ts`（替换 `storage` 的 import 来源）
  - 新增/更新测试文件：`lib/background/**/*.test.ts`、`lib/state/setting-store.test.ts`
  - 可能新增测试辅助模块（如 `lib/test/*`）用于复用 `fakeBrowser` 初始化与重置逻辑

