# Change: Refactor repository organization to align with WXT best practices (no product logic change)

## Why
当前仓库已经具备 WXT 标准入口结构（`entrypoints/`）与分层逻辑（`lib/`、`hooks/`、`components/`），但仍存在一些影响维护效率的组织问题：

- `utils/`（根目录）与 `lib/utils/` 并存，导致“工具函数应该放哪里/从哪里导入”不一致
- 代码分层规范已在 `docs/api-architecture.md` 描述，但其中部分目录树与实际实现不一致，容易误导后续扩展
- 缺少一份明确的“代码组织/导入边界”规范 spec，导致未来重构时难以判定是否符合约束

## What Changes
- 新增一个 capability：`repo-organization`，用 spec 明确 WXT 项目最佳实践下的目录边界、导入边界、公共类型/工具函数的单一来源
- 在不改变产品逻辑/交互的前提下，整理仓库结构以消除重复与歧义：
  - 将根目录 `utils/` 迁移并收敛到 `lib/utils/`（单一来源），统一使用 `@/lib/utils/...` 导入
  - 更新受影响的 import 路径（仅路径变化，不改运行逻辑）
  - 校准 `docs/api-architecture.md` 中与实际代码不一致的目录树/示例（保持规则语义不变）
- 维持现有 WXT 多入口架构与 `@/` alias（`@/* -> ./*`）不变，避免引入额外迁移风险

## Impact
- Affected specs: 新增 `repo-organization` capability（本次 change 仅提供 delta）
- Affected code (planned): `utils/*`、`lib/utils/*`、引用 `@/utils/*` 的组件/模块、`docs/api-architecture.md`
- Risk profile: 低（纯文件移动/导入路径更新）；通过 `bun run compile` 与 `bun run build` 验证

## Non-Goals
- 不新增/升级任何第三方依赖
- 不修改 manifest 权限、不改变 background/content/popup 的运行逻辑
- 不做 UI/文案/交互改动（除非是文档修正）

## Open Questions
1. 你是否希望将源码进一步收敛到 `src/`（并把 `@` alias 指向 `./src`）？这属于更大规模迁移，建议另起 change 分阶段做。
2. 对“公共类型”的偏好是继续保持在根目录 `types/`（当前做法），还是也迁移到 `lib/types/` 以便和 `lib/` 分层一致？本提案默认保持现状以降低影响面。


