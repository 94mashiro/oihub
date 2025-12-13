## ADDED Requirements

### Requirement: Background Architecture Unit Tests
`background-architecture` 的核心模块（消息路由、模块注册/清理）SHALL 有单元测试覆盖，以防止后台脚本在重构中出现回归。

#### Scenario: moduleRegistry initializes and cleans up in reverse order
- **WHEN** 调用 `moduleRegistry.initAll([m1, m2, m3])`
- **THEN** 依次调用 `m1.init()`、`m2.init()`、`m3.init()`
- **AND** 返回的 cleanup 会按逆序调用 `m3.cleanup`、`m2.cleanup`、`m1.cleanup`

#### Scenario: messageRouter registers only one listener
- **GIVEN** `messageRouter.init()` 可能被多次调用
- **WHEN** 连续调用 `messageRouter.init()` 多次
- **THEN** 全局仅注册一次 `browser.runtime.onMessage.addListener`

### Requirement: Store Actions Unit Tests (Usage Alert)
`setting-store` 的核心动作（用于 usage-alert 去重与配置持久化）SHALL 有单元测试覆盖。

#### Scenario: Persist and remove daily usage alert config
- **WHEN** 调用 `setDailyUsageAlert(tenantId, config)`
- **THEN** `dailyUsageAlert[tenantId]` 被写入
- **WHEN** 调用 `removeDailyUsageAlert(tenantId)`
- **THEN** `dailyUsageAlert[tenantId]` 被移除

#### Scenario: Mark alerted today and clear state
- **WHEN** 调用 `markAlerted(tenantId)`
- **THEN** `isAlertedToday(tenantId)` 返回 `true`
- **WHEN** 调用 `clearAlertedToday()`
- **THEN** 对任意 tenantId，`isAlertedToday(tenantId)` 返回 `false`

### Requirement: WXT Runtime Dependency Strategy for Unit Tests
依赖 WXT runtime（如 `browser`、`storage.defineItem()`）的模块 SHALL 在 Bun 单测环境可被替代/模拟。

#### Scenario: Run store tests in Bun via fakeBrowser
- **GIVEN** `bun test` 运行时没有真实扩展环境
- **WHEN** 测试用例注入 `globalThis.browser = fakeBrowser`
- **THEN** store 模块可被导入并执行其动作而不抛出运行时错误

