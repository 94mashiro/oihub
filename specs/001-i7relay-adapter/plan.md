# Implementation Plan: i7Relay Platform Adapter/Service Framework

**Branch**: `001-i7relay-adapter` | **Date**: 2025-12-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-i7relay-adapter/spec.md`

## Summary

为 i7Relay 平台创建 adapter/service 框架代码，遵循现有平台（newapi、cubence、packycode_codex）的模式。框架代码包含完整的类型定义和方法签名，但内部实现使用占位符（抛出 NotImplementedError）。

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: WXT (browser extension framework), existing API client infrastructure
**Storage**: N/A (框架代码不涉及存储)
**Testing**: N/A (框架代码，后续实现时添加测试)
**Target Platform**: Chrome/Firefox browser extension
**Project Type**: Browser extension (WXT)
**Performance Goals**: N/A (框架代码)
**Constraints**: 必须通过 `bun run compile` 类型检查
**Scale/Scope**: 创建 3 个新文件，更新 6 个现有文件

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality First | ✅ Pass | TypeScript strict mode, kebab-case 文件命名, @/ alias |
| II. Testing Standards | ✅ Pass | 框架代码无需测试，后续实现时添加 |
| III. User Experience | ✅ Pass | 不涉及 UI |
| IV. Performance | ✅ Pass | 不涉及性能敏感代码 |
| V. Security | ✅ Pass | 不涉及敏感数据 |
| VI. ROI & Pragmatism | ✅ Pass | 最小实现，遵循现有模式 |

## Project Structure

### Documentation (this feature)

```text
specs/001-i7relay-adapter/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
lib/api/
├── types/platforms/
│   ├── index.ts                      # [UPDATE] 导出 i7relay 类型
│   └── i7relay-response-types.ts     # [NEW] 响应类型定义
├── adapters/
│   ├── index.ts                      # [UPDATE] 导出 i7relay adapter
│   └── i7relay-adapter.ts            # [NEW] 数据标准化适配器
├── services/
│   ├── raw-service-factory.ts        # [UPDATE] 注册 i7relay service
│   └── i7relay-service.ts            # [NEW] 原始数据获取服务
└── orchestrators/
    ├── balance/balance-orchestrator.ts    # [UPDATE] 添加 i7relay case
    ├── cost/cost-orchestrator.ts          # [UPDATE] 添加 i7relay case
    ├── token/token-orchestrator.ts        # [UPDATE] 添加 i7relay case
    └── tenant-info/tenant-info-orchestrator.ts  # [UPDATE] 添加 i7relay case
```

**Structure Decision**: 遵循现有平台适配器模式，在对应目录下创建 i7relay 相关文件。

## Complexity Tracking

> 无违规项，无需填写。
