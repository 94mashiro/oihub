# Implementation Plan: Store Field Abstraction for Cross-Platform Support

**Branch**: `001-store-field-abstraction` | **Date**: 2025-12-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-store-field-abstraction/spec.md`

## Summary

Streamline store data structures by removing unused fields (reducing TenantBalance from 22+ to 2 fields, CostData from 8 to 3, Token from 6 to 5), and introduce a platform adapter architecture to abstract newapi-specific fields into a cross-platform interface supporting future platform extensions.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: WXT (browser extension framework), Zustand (state management), React 18, Tailwind CSS
**Storage**: WXT storage API (chrome.storage.local/sync abstraction)
**Testing**: Vitest (when explicitly requested)
**Target Platform**: Chromium browsers, Firefox (via WXT cross-browser support)
**Project Type**: Browser extension (popup + background + content scripts)
**Performance Goals**: Popup TTI < 100ms, background wake < 50ms, bundle < 500KB gzip
**Constraints**: Extension storage limits, cross-context sync latency
**Scale/Scope**: Single extension, ~10 screens, multi-tenant API management

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Code Quality | TypeScript strict mode, no `any` | ✅ PASS | New types will be strictly typed |
| I. Code Quality | Use `createStore` pattern | ✅ PASS | Existing stores already use this pattern |
| I. Code Quality | API calls via `TenantAPIService` | ✅ PASS | Adapter layer will wrap existing service |
| I. Code Quality | File naming: kebab-case modules | ✅ PASS | New files: `platform-adapter.ts`, `balance.ts` |
| I. Code Quality | `@/` alias for imports | ✅ PASS | Will use `@/lib/api/adapters/` |
| II. Testing | Tests when explicitly requested | ✅ PASS | No tests unless requested |
| III. UX Consistency | Check store `ready` state | ✅ PASS | Existing pattern preserved |
| III. UX Consistency | Semantic CSS variables | ✅ PASS | No UI changes in this feature |
| IV. Performance | Popup TTI < 100ms | ✅ PASS | Smaller data = faster hydration |
| IV. Performance | Bundle < 500KB gzip | ✅ PASS | Removing fields reduces bundle |
| V. Security | No hardcoded secrets | ✅ PASS | No secrets involved |
| V. Security | Input validation at boundaries | ✅ PASS | Adapter validates API responses |

**Gate Status**: ✅ PASSED - No violations

## Project Structure

### Documentation (this feature)

```text
specs/001-store-field-abstraction/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
lib/
├── api/
│   ├── client/              # API client infrastructure
│   ├── services/            # TenantAPIService (existing)
│   └── adapters/            # NEW: Platform adapters
│       ├── types.ts         # Adapter interface + normalized types
│       └── newapi-adapter.ts # Default newapi implementation
├── state/
│   ├── create-store.ts      # Store factory (existing)
│   ├── balance-store.ts     # MODIFY: Use normalized Balance type
│   ├── cost-store.ts        # MODIFY: Use normalized Cost type
│   ├── token-store.ts       # MODIFY: Use normalized Token type
│   └── tenant-store.ts      # MODIFY: Add platformType field
└── types/
    └── token.ts             # MODIFY: Streamline Token type

entrypoints/
├── popup/                   # React UI (no changes expected)
└── background.ts            # Service worker (no changes expected)
```

**Structure Decision**: Browser extension layout following WXT conventions. New adapter layer added under `lib/api/adapters/` to maintain separation between API client and platform-specific normalization.

## Complexity Tracking

No violations - section not applicable.

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design completion.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Code Quality | TypeScript strict mode, no `any` | ✅ PASS | Contracts use explicit types, `unknown` for raw input |
| I. Code Quality | Use `createStore` pattern | ✅ PASS | Stores unchanged, only types narrowed |
| I. Code Quality | API calls via `TenantAPIService` | ✅ PASS | Adapter integrates with existing service |
| I. Code Quality | File naming: kebab-case modules | ✅ PASS | `types.ts`, `newapi-adapter.ts` |
| I. Code Quality | `@/` alias for imports | ✅ PASS | `@/lib/api/adapters/` path confirmed |
| II. Testing | Tests when explicitly requested | ✅ PASS | No tests added |
| III. UX Consistency | Check store `ready` state | ✅ PASS | Pattern preserved in design |
| IV. Performance | Popup TTI < 100ms | ✅ PASS | ~60% storage reduction improves hydration |
| IV. Performance | Bundle < 500KB gzip | ✅ PASS | Fewer fields = smaller serialization |
| V. Security | Input validation at boundaries | ✅ PASS | Adapter uses nullish coalescing for missing fields |

**Post-Design Gate Status**: ✅ PASSED - Design compliant with constitution
