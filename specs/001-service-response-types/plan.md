# Implementation Plan: Platform Service Response Type Definitions

**Branch**: `001-service-response-types` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-service-response-types/spec.md`

## Summary

This feature creates TypeScript type definitions for all platform service API response structures. The module provides platform-specific type definitions for raw API responses from NewAPI, Cubence, and PackyCode Codex platforms across five endpoint categories (balance, costs, tokens, token groups, tenant info). Type definitions will be created through manual inspection of actual API responses and validated purely through TypeScript compilation - no JSON schemas or runtime validation tools are needed.

## Technical Context

**Language/Version**: TypeScript 5.9.2 (strict mode enabled)
**Primary Dependencies**: WXT (browser extension framework), existing service layer (`IRawPlatformService`, adapters, orchestrators)
**Storage**: N/A (type definitions are compile-time artifacts)
**Testing**: TypeScript compiler (`tsc --noEmit`) for type-level validation
**Target Platform**: Browser extension (Chrome/Firefox) - compile-time type safety for runtime code
**Project Type**: Web (browser extension with React UI + background service worker)
**Performance Goals**: Zero runtime overhead (types erased at compile-time); IDE autocomplete < 100ms; TypeScript compilation errors visible within seconds
**Constraints**: Must preserve existing `RawAPIResponse` wrapper; no breaking changes to service/adapter interfaces; use `@/` alias for imports; kebab-case for module files
**Scale/Scope**: 3 platforms × 5 endpoint types = 15 base response type definitions; additional Response Aggregate types for multi-endpoint scenarios; utility types for platform lookup

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

**I. Code Quality First**
- ✅ TypeScript strict mode: Type definitions inherently enforce strict typing
- ✅ File naming: `kebab-case` for type modules (`newapi-response-types.ts`)
- ✅ Import aliases: All imports use `@/` alias
- ✅ No `any` types: All fields explicitly typed or use `unknown` for dynamic data
- ✅ Compilation gate: Must pass `bun run compile`

**II. Testing Standards**
- ✅ Type-level validation: TypeScript compiler validates correctness
- ✅ No runtime tests needed: Compile-time validation is sufficient

**III. User Experience Consistency**
- N/A: Developer-facing types, not end-user UI

**IV. Performance Requirements**
- ✅ Zero runtime overhead: Types erased during compilation
- ✅ No bundle size impact: Types don't affect JavaScript output

**V. Security & Configuration**
- ✅ No secrets: Types contain only structural information
- ✅ Minimal surface area: Types describe existing contracts only

### Gates Status

**PASS** - All applicable principles satisfied. Simplified approach removes JSON schema complexity while maintaining type safety.

## Project Structure

### Documentation (this feature)

```text
specs/001-service-response-types/
├── plan.md              # This file
├── research.md          # Phase 0 output (simplified - no JSON schema research)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
lib/api/types/
├── platforms/                          # NEW: Platform-specific response types
│   ├── index.ts                        # Central exports + platform type mapping
│   ├── newapi-response-types.ts        # NewAPI platform types (5 endpoints)
│   ├── cubence-response-types.ts       # Cubence platform types (5 endpoints)
│   ├── packycode-codex-response-types.ts  # PackyCode Codex types (5 endpoints)
│   └── response-aggregates.ts          # Response Aggregates (BalanceSources, etc.)
├── types.ts                            # Existing: APIClient types
└── ... (other existing type files)

lib/api/services/
├── types.ts                            # UPDATED: IRawPlatformService with typed returns
├── newapi-service.ts                   # UPDATED: Use NewAPI response types
├── cubence-service.ts                  # UPDATED: Use Cubence response types
└── packycode-codex-service.ts          # UPDATED: Use PackyCode Codex types

lib/api/adapters/
├── types.ts                            # UPDATED: PlatformAdapter with typed inputs
├── newapi-adapter.ts                   # UPDATED: Type-safe source parameter
├── cubence-adapter.ts                  # UPDATED: Type-safe source parameter
└── packycode-codex-adapter.ts          # UPDATED: Type-safe source parameter

lib/api/orchestrators/
└── types.ts                            # UPDATED: Response Aggregates with typed fields
```

**Structure Decision**: Extend existing `lib/api/types/` with new `platforms/` subdirectory. Platform-specific types isolated in separate files prevent cross-platform pollution (FR-005).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations**

No violations. All gates passed.
