# Implementation Plan: 平台类型字段

**Branch**: `001-platform-type` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-platform-type/spec.md`

## Summary

为 Tenant 数据结构添加 platformType 字段，使系统能够根据账号所属平台选择正确的适配器进行数据转换。当前仅支持 "newapi" 平台，但架构设计支持未来扩展。UI 始终显示平台类型下拉选择器，适配器不存在时阻止操作并显示错误。UI 组件必须在当前布局环境中样式合适，必要时使用 className 覆盖进行调整。

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: WXT (browser extension framework), Zustand (state management), React 18, Tailwind CSS
**Storage**: WXT storage API (chrome.storage.local/sync abstraction)
**Testing**: Vitest
**Target Platform**: Chrome/Firefox browser extension
**Project Type**: Browser extension (popup + background + content scripts)
**Performance Goals**: Popup TTI < 100ms, Background wake < 50ms
**Constraints**: Bundle size < 500KB gzip, API timeout 10s default
**Scale/Scope**: Single user extension, multiple tenant accounts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality First | ✅ PASS | TypeScript strict mode, uses existing `createStore` pattern, follows kebab-case naming |
| II. Testing Standards | ✅ PASS | Will add tests for adapter selection logic when requested |
| III. User Experience Consistency | ✅ PASS | Uses coss components, shows dropdown selector, error states with actionable guidance, className 覆盖确保样式合适 |
| IV. Performance Requirements | ✅ PASS | No new async operations, minimal bundle impact |
| V. Security & Configuration | ✅ PASS | No secrets involved, no new permissions needed |

**Gate Result**: PASS - No violations, proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-platform-type/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Browser Extension Structure
entrypoints/
├── background.ts        # Service worker
├── content.ts           # Content script
└── popup/               # React popup UI
    ├── main.tsx
    ├── App.tsx
    └── components/

lib/
├── api/
│   ├── adapters/        # Platform adapters (existing)
│   │   ├── index.ts     # Adapter registry
│   │   ├── types.ts     # PlatformType, PlatformAdapter
│   │   └── newapi-adapter.ts
│   └── services/
│       └── tenant-api-service.ts  # Uses adapter based on platformType
├── state/
│   └── tenant-store.ts  # Tenant with platformType field
└── constants/
    └── tenants.ts       # Default platform type constant

types/
└── tenant.ts            # Tenant interface with platformType

components/
└── ui/                  # coss components
```

**Structure Decision**: Existing browser extension structure. Changes primarily in `types/tenant.ts`, `lib/state/tenant-store.ts`, and UI components for tenant add/edit forms.

## Complexity Tracking

> No violations - section not applicable.
