## Context

本仓库是基于 WXT 的浏览器扩展，包含多入口（`background.ts`/`content.ts`/`popup`），并已采用清晰的分层：

- UI：`components/`（coss + Tailwind）
- 业务副作用：`hooks/`
- 领域/基础设施：`lib/`（api/background/state/utils/constants）
- 类型：`types/`（领域数据结构）

本次变更目标是**不改变任何产品逻辑**的前提下，进一步对齐 WXT 项目常见最佳实践，提升可维护性与一致性。

## Goals / Non-Goals

- Goals:
  - 让“工具函数、类型、跨上下文通信”的位置与导入路径有明确单一来源
  - 减少重复/歧义（例如 `utils/` vs `lib/utils/`）
  - 让文档与真实代码结构一致，降低新人上手成本
- Non-Goals:
  - 不引入新依赖、不改变运行时行为、不改变 UI/交互
  - 不进行 `src/` 大迁移（若需要，另起 change 分阶段处理）

## Decisions

- Decision: 保持现有 WXT 入口目录与 alias 不变
  - Why: `entrypoints/` + `@/* -> ./*` 已在 `wxt.config.ts` 与 `tsconfig.json` 中固定，变动会带来大范围 import 与配置迁移风险，不符合“仅整理结构”的最小化原则。

- Decision: 将工具函数的“单一来源”收敛到 `lib/utils/`
  - Why: `lib/` 已承载运行时共享逻辑（api/background/state/utils），与 UI（`components/`）形成清晰边界；将 `utils/` 收敛进 `lib/utils/` 可减少双源与认知分裂。

- Decision: 保持 `types/` 作为领域类型的稳定导入面
  - Why: 目前大量模块通过 `@/types/*` 引用领域类型；在不改变逻辑的前提下，保持其稳定可显著降低迁移风险。后续若需要更强“lib 内聚”，可单独提案迁移到 `lib/types/`。

## Risks / Trade-offs

- Risk: 文件移动导致 import 路径遗漏
  - Mitigation: 迁移前用搜索枚举引用点；迁移后以 `bun run compile` + `bun run build` 作为硬性门禁。

- Trade-off: 不做 `src/` 迁移会让“源码与配置/文档混在根目录”的形态继续存在
  - Rationale: 这是有意选择的风险控制；若团队更偏好 `src/`，建议作为后续独立 change，以免与本次“单一来源收敛”混在一起难以回滚。

## Migration Plan

1. 先移动 `utils/* -> lib/utils/*`（保持导出 API 不变）
2. 全量替换 `@/utils/* -> @/lib/utils/*`
3. 删除 `utils/` 目录（或明确保留薄 re-export 的过渡策略）
4. 校准相关文档（优先 `docs/api-architecture.md`）

## Open Questions

- 是否需要“过渡期兼容层”（保留 `utils/` 做 re-export），还是一次性完成迁移并删除？本提案默认一次性完成以避免长期双源。


