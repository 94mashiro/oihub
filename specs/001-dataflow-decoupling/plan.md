# Implementation Plan: Dataflow Decoupling

**Branch**: `001-dataflow-decoupling` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-dataflow-decoupling/spec.md`

## Summary

Refactor the data flow architecture to decouple services (raw API fetching) from adapters (data transformation). Currently, services call adapters directly inside each method, creating tight coupling that prevents multi-API data merging. The solution introduces domain-specific orchestrators (BalanceOrchestrator, CostOrchestrator, etc.) that coordinate service calls, adapter transformations, and store updates independently.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: WXT (browser extension framework), Zustand (state management), React 18, Tailwind CSS
**Storage**: WXT storage API (chrome.storage.local/sync abstraction)
**Testing**: Vitest (when explicitly requested)
**Target Platform**: Chromium/Firefox browser extensions
**Project Type**: Browser extension (WXT layout)
**Performance Goals**: Popup TTI < 100ms, Background wake < 50ms, API timeout 10s default
**Constraints**: Bundle size < 500KB gzip, Memory growth < 10MB/hour
**Scale/Scope**: 3 platforms (NewAPI, Cubence, PackyCode Codex), 5 data domains (Balance, Cost, Token, TokenGroup, TenantInfo)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality First | ✅ PASS | TypeScript strict mode, `createStore` pattern, `TenantAPIService` routing, kebab-case files |
| II. Testing Standards | ✅ PASS | Tests only when requested; each layer testable in isolation (SC-005) |
| III. User Experience Consistency | ✅ PASS | No UI changes; store `ready` state preserved |
| IV. Performance Requirements | ✅ PASS | No new blocking operations; orchestrators async |
| V. Security & Configuration | ✅ PASS | No secrets handling changes; API calls remain through existing client |

**Gate Result**: PASS - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-dataflow-decoupling/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
lib/
├── api/
│   ├── adapters/           # Existing - transformation logic (to be decoupled)
│   │   ├── types.ts        # PlatformAdapter interface, normalized types
│   │   ├── newapi-adapter.ts
│   │   ├── cubence-adapter.ts
│   │   └── packycode-codex-adapter.ts
│   ├── services/           # Existing - raw API fetching (to be simplified)
│   │   ├── types.ts        # IPlatformService interface
│   │   ├── platform-api-service.ts
│   │   ├── newapi-service.ts
│   │   ├── cubence-service.ts
│   │   └── packycode-codex-service.ts
│   └── orchestrators/      # NEW - coordination layer
│       ├── types.ts        # Orchestrator interfaces, error types
│       ├── balance-orchestrator.ts
│       ├── cost-orchestrator.ts
│       ├── token-orchestrator.ts
│       └── tenant-info-orchestrator.ts
├── state/                  # Existing - unchanged
│   ├── create-store.ts
│   ├── balance-store.ts
│   ├── cost-store.ts
│   ├── token-store.ts
│   └── tenant-info-store.ts
└── errors/                 # NEW - typed error handling
    └── transformation-error.ts

hooks/                      # Existing - to use orchestrators
├── use-tenant-data-refresh.ts
├── use-cost-loader.ts
└── use-tokens-loader.ts
```

**Structure Decision**: Browser extension with WXT layout. New `orchestrators/` directory under `lib/api/` for domain-specific coordination. New `errors/` directory for typed error classes. Existing services, adapters, and stores remain in place but with modified responsibilities.

## Complexity Tracking

> No violations - table not required.

---

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design completion.*

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. Code Quality First | ✅ PASS | New files follow kebab-case (`balance-orchestrator.ts`), TypeScript strict types defined in contracts |
| II. Testing Standards | ✅ PASS | Each layer (service, adapter, orchestrator) independently testable per SC-005 |
| III. User Experience Consistency | ✅ PASS | No UI changes; `_meta` field optional, stores unchanged |
| IV. Performance Requirements | ✅ PASS | Orchestrators use `Promise.allSettled` for parallel fetches; no blocking operations |
| V. Security & Configuration | ✅ PASS | No new secrets handling; existing APIClient authentication preserved |

**Post-Design Gate Result**: PASS - Design complies with all constitution principles.
