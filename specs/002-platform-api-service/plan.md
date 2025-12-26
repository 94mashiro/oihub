# Implementation Plan: Platform API Service Abstraction

**Branch**: `002-platform-api-service` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-platform-api-service/spec.md`

## Summary

Implement a generic `PlatformAPIService` layer that routes API calls based on `platformType` to platform-specific services (NewAPIService, OneAPIService), which use dedicated adapters to transform responses into unified data types. The existing `TenantAPIService` will be refactored to `NewAPIService` as the first platform implementation.

## Technical Context

**Language/Version**: TypeScript 5.9.2 (strict mode)
**Primary Dependencies**: WXT (browser extension framework), Zustand (state management), React 18
**Storage**: WXT storage API (chrome.storage.local/sync abstraction)
**Testing**: Bun test runner (`bun test`)
**Target Platform**: Browser extension (Chromium, Firefox)
**Project Type**: Single project (browser extension)
**Performance Goals**: Popup TTI < 100ms, API timeout 10s default
**Constraints**: Bundle size < 500KB gzip, minimal observability (errors/warnings only)
**Scale/Scope**: Multi-platform tenant management, 1 platform initially (newapi only)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality First | ✅ PASS | TypeScript strict mode, `@/` alias, kebab-case files, API through service layer |
| II. Testing Standards | ✅ PASS | Tests not explicitly required; will follow `[target].test.ts` convention if added |
| III. User Experience Consistency | ✅ PASS | No UI changes; service layer only |
| IV. Performance Requirements | ✅ PASS | API timeout 10s default, no blocking operations |
| V. Security & Configuration | ✅ PASS | No secrets in code, existing auth patterns preserved |

**Gate Result**: PASS - No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-platform-api-service/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (TypeScript interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
lib/api/
├── client/
│   └── api-client.ts           # Existing - HTTP client singleton
├── adapters/
│   ├── types.ts                # Existing - PlatformAdapter interface, unified types (no changes)
│   ├── index.ts                # Existing - Adapter registry (getAdapter)
│   └── newapi-adapter.ts       # Existing - NewAPI adapter implementation
├── services/
│   ├── tenant-api-service.ts   # REFACTOR → newapi-service.ts
│   ├── newapi-service.ts       # NEW - Platform-specific service for newapi
│   ├── platform-api-service.ts # NEW - Generic routing service
│   └── index.ts                # UPDATE - Export PlatformAPIService only
├── errors/
│   ├── platform-api-error.ts   # NEW - Platform service error type
│   └── adapter-transform-error.ts # NEW - Adapter error type
└── index.ts                    # UPDATE - Public API exports
```

**Structure Decision**: Single project structure. New files follow kebab-case convention. Platform services are internal; only `PlatformAPIService` is exported publicly. No PlatformType extension needed.

## Complexity Tracking

> No violations - table not required.
