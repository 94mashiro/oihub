# Implementation Plan: Tenant Info Storage Refactoring

**Branch**: `002-tenant-info-refactor` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-tenant-info-refactor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Separate tenant configuration from runtime tenant info by creating a dedicated runtime store for tenant info data. Normalize tenant info fields to business-centric names (creditUnit, exchangeRate, displayFormat, endpoints, notices) and extend the PlatformAdapter interface to handle tenant info normalization. This refactoring aligns tenant info storage with the adapter pattern established in 001-store-field-abstraction while maintaining all existing UI functionality.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: WXT (browser extension framework), Zustand (state management), React 18
**Storage**: WXT storage API (chrome.storage.local/sync abstraction)
**Testing**: Not specified (tests not required per constitution unless explicitly requested)
**Target Platform**: Browser extension (Chrome/Firefox)
**Project Type**: Browser extension (WXT layout: entrypoints/, components/, lib/)
**Performance Goals**: Popup TTI < 100ms, background wake < 50ms (per constitution)
**Constraints**: Bundle size < 500KB gzipped, API timeout 10s default
**Scale/Scope**: 8 components referencing tenant.info, 5 tenant info fields to normalize

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

**I. Code Quality First** ✅
- TypeScript strict mode: Already enabled
- UI components: No UI changes required (only data access pattern changes)
- State management: Will use `createStore` pattern from `lib/state/create-store.ts`
- API calls: Will route through `TenantAPIService` (already exists)
- File naming: New files will follow `kebab-case` convention
- Imports: Will use `@/` alias
- Type checking: Will pass `bun run compile`

**II. Testing Standards** ✅
- No tests required (not explicitly requested by user)
- Constitution allows skipping tests when not requested

**III. User Experience Consistency** ✅
- No UI changes required
- Store `ready` state will be checked (following existing pattern)
- No visual or behavioral changes to user-facing features

**IV. Performance Requirements** ✅
- No performance impact expected (refactoring only)
- Runtime store will be in-memory (faster than persisted store)
- No new API calls or blocking operations

**V. Security & Configuration** ✅
- No security changes required
- No new secrets or permissions needed
- No external URLs or data transmission changes

### Gate Status: **PASS** ✅

All constitution principles are satisfied. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
lib/
├── state/
│   ├── create-store.ts           # Existing: Store factory
│   ├── tenant-store.ts            # Modified: Remove info field from Tenant type
│   └── tenant-info-store.ts       # New: Runtime store for tenant info
├── api/
│   ├── adapters/
│   │   ├── types.ts               # Modified: Extend PlatformAdapter interface
│   │   └── newapi-adapter.ts      # Modified: Add normalizeTenantInfo method
│   └── services/
│       └── tenant-api-service.ts  # Modified: Use adapter for getStatus()
├── utils/
│   └── quota-converter.ts         # Modified: Access tenant info from new store
└── background/
    └── modules/
        └── usage-alert.ts         # Modified: Access tenant info from new store

types/
└── tenant.ts                      # Modified: Remove info field, add normalized TenantInfo

components/
├── biz/
│   └── tenant-select-card/
│       ├── index.tsx              # Modified: Access tenant info from new store
│       ├── model-usage-panel.tsx  # Modified: Access tenant info from new store
│       ├── token-list-panel.tsx   # Modified: Access tenant info from new store
│       └── api-endpoints-panel.tsx # Modified: Access tenant info from new store
└── biz-screen/
    └── popup-settings-screen/
        └── index.tsx              # Modified: Access tenant info from new store

hooks/
└── use-tenant-data-refresh.ts     # Modified: Update tenant info in new store
```

**Structure Decision**: Browser extension using WXT layout. New runtime store will be created in `lib/state/tenant-info-store.ts` following the existing `createStore` pattern. The store will NOT persist to storage (runtime-only). All components currently accessing `tenant.info` will be updated to access the new store via `useTenantInfoStore()`.

## Complexity Tracking

No violations. Constitution Check passed.

---

## Phase 1 Design Complete - Constitution Re-Check

*Re-evaluated after Phase 1 design artifacts (research.md, data-model.md, contracts/, quickstart.md)*

### Core Principles Compliance (Re-Check)

**I. Code Quality First** ✅
- TypeScript strict mode: Maintained throughout design
- UI components: No UI changes (only data access pattern changes)
- State management: `createStore` pattern confirmed in design
- API calls: `TenantAPIService` pattern maintained
- File naming: `tenant-info-store.ts` follows `kebab-case`
- Imports: `@/` alias used in all examples
- Type checking: Design ensures type safety

**II. Testing Standards** ✅
- No tests required (not requested)
- Design includes manual testing strategy in quickstart.md

**III. User Experience Consistency** ✅
- No UI changes
- Store `ready` state pattern maintained
- Graceful degradation with optional fields

**IV. Performance Requirements** ✅
- Runtime-only store (faster than persisted)
- No new API calls
- No blocking operations

**V. Security & Configuration** ✅
- No security changes
- No new secrets or permissions

### Gate Status: **PASS** ✅

Design maintains all constitution principles. Ready for Phase 2 (Task Generation via `/speckit.tasks`).
