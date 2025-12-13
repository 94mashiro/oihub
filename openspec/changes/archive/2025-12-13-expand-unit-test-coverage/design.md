# Design: Expand Unit Test Coverage for Background Modules and Stores

## Goals
- 在不改变业务行为的前提下，为核心 background 模块与 usage-alert 相关 store 动作补齐单测。
- 单测可在纯 Bun 环境运行：`bun run test` 不依赖浏览器/扩展运行时。
- 测试用例尽量围绕规范行为（spec scenarios）与可回归点，避免实现细节耦合。

## Non-Goals
- 不引入端到端测试、UI 组件测试或覆盖率阈值门禁。
- 不重构业务架构（仅做必要的可测试性调整）。

## Key Constraints
- Bun 运行时无法解析 WXT 的虚拟模块 `#imports`，但可以直接导入 `wxt/*` 包。
- store 创建依赖 `browser` 存储实现；测试需要提供可用的 `browser` 对象。
- ESM import 会在模块求值前执行，测试中需要在导入 store 模块前先注入 `globalThis.browser`。

## Approach

### 1) Store 可测试性：显式导入 storage
将以下文件的 `import { storage } from '#imports'` 替换为 `import { storage } from 'wxt/utils/storage'`：
- `lib/state/tenant-store.ts`
- `lib/state/token-store.ts`
- `lib/state/balance-store.ts`
- `lib/state/cost-store.ts`
- `lib/state/setting-store.ts`

理由：
- 避免为 `#imports` 增加运行时 shim（可能干扰 WXT 构建/打包解析）。
- 让 `bun test` 直接走 Node/Bun 标准解析规则，降低环境差异。

### 2) 测试环境：使用 fakeBrowser 注入 global
采用 `wxt/testing` 的 `fakeBrowser`（对象）：
- 在每个需要依赖 `browser` 的测试文件中，先设置 `globalThis.browser = fakeBrowser`。
- 对依赖 `storage.defineItem()` 的 store 模块，通过动态 `await import()` 在注入后再导入模块。
- 测试之间通过 `fakeBrowser.reset()`（如存在）或按模块提供的 reset 方法清理副作用；无法统一重置时，采用“每个测试文件独立动态导入 + 仅断言 in-memory state”的策略。

### 3) Background 单测策略
- `messageRouter`：
  - 用 `fakeBrowser.runtime.onMessage.addListener` 捕获注册的回调函数
  - 验证 `init()` 多次调用只注册一次 listener
  - 通过回调模拟消息输入，验证 handler 被调用、`sendResponse` 收到成功/失败结果、无 handler 时返回 `false`
- `moduleRegistry`：
  - 构造带 cleanup 的 `BackgroundModule` 列表，验证初始化顺序与 cleanup 逆序执行
  - 验证 cleanup 运行后内部状态可再次 init（避免跨测试污染）
- `fetchProxyModule`：
  - 覆盖 JSON/text 响应解析、HTTP 非 ok 的错误 message 选择逻辑、timeout/AbortError 分支
  - 通过 stub `globalThis.fetch` 与可控的 `Response`/headers 模拟实现

## Risks and Mitigations
- **风险**：替换 storage import 可能影响 WXT 构建行为。
  - **缓解**：在实现阶段强制跑 `bun run build` 与 `bun run compile`；如有差异，回退到更小范围或改用 shim 方案。
- **风险**：store 的自动 hydration（`queueMicrotask`）在测试中引入不稳定时序。
  - **缓解**：在断言前等待一次 microtask（例如 `await Promise.resolve()`）并只断言确定性的 state 变化。
