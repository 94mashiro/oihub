## Context
Background script 是 WXT 扩展的 service worker 入口，当前所有功能（告警、消息代理、状态订阅）都直接写在 `defineBackground()` 回调中，约 290 行代码混杂多种职责。

约束：
- MV3 service worker 生命周期限制（需用 alarms API）
- 跨 context 通信依赖 `browser.runtime.onMessage`
- 需与现有 `lib/api`、`lib/state` 架构保持一致

## Goals / Non-Goals
Goals:
- 按职责拆分为独立模块，每个模块单一职责
- 建立清晰的模块注册/卸载机制
- 保持与现有 `lib/` 架构风格一致

Non-Goals:
- 不改变现有功能行为
- 不引入新的外部依赖
- 不修改 API 层或 state 层

## Decisions

### 目录结构
```
lib/background/
├── index.ts                    # 统一导出
├── types.ts                    # 模块接口定义
├── module-registry.ts          # 模块注册器
├── modules/
│   ├── usage-alert.ts          # 用量告警轮询
│   ├── fetch-proxy.ts          # CORS bypass fetch 代理
│   └── tenant-watcher.ts       # 租户变更监听
```

### 模块接口
```typescript
interface BackgroundModule {
  name: string;
  init(): void | (() => void);  // 返回 cleanup 函数（可选）
}
```

### 注册机制
- `ModuleRegistry` 管理所有模块的初始化和清理
- 主入口 `background.ts` 仅调用 `registry.initAll()` 和返回 cleanup

### 消息处理
- 每个模块注册自己的 message type
- 使用 `MessageRouter` 统一分发，避免多个 `onMessage.addListener`

## Risks / Trade-offs
- Risk: 模块间依赖可能导致初始化顺序问题
  - Mitigation: 模块保持独立，共享依赖通过 `lib/state` 和 `lib/api` 获取
- Trade-off: 增加文件数量 vs 提高可维护性
  - 选择可维护性，文件数量增加可控（约 5-6 个文件）

## Open Questions
- 是否需要支持模块的动态启用/禁用？（当前设计为静态注册）
