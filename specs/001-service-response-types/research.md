# Research: Platform Service Response Type Definitions

**Feature**: 001-service-response-types
**Date**: 2025-12-27
**Status**: Complete

## Overview

This document consolidates research findings for implementing platform-specific TypeScript type definitions for service layer API responses. The approach is simplified: create accurate types through manual API inspection and rely purely on TypeScript compilation for validation - no JSON schemas or automated coverage tools needed.

## Research Questions & Findings

### 1. Type Definition Creation Strategy

**Question**: What is the most accurate method for creating initial platform-specific type definitions?

**Decision**: Manual inspection of actual API responses from test environments

**Rationale**:
- Ensures 100% accuracy by capturing actual runtime behavior
- Captures undocumented fields, null handling patterns, and edge cases
- Validates actual data types (numeric strings vs numbers, nested structures)
- Direct observation eliminates reliance on potentially outdated documentation

**Alternatives Considered**:
- **API Documentation**: Rejected - Often incomplete or doesn't reflect actual responses
- **Reverse-engineer from adapters**: Rejected - May not capture all available fields
- **Hybrid documentation + validation**: Rejected - Adds complexity without benefit over direct inspection

**Implementation Approach**:
1. Access test environment for all 3 platforms (NewAPI, Cubence, PackyCode Codex)
2. Invoke each service endpoint with representative data
3. Capture raw responses using browser DevTools Network tab or logging
4. Manually analyze structure:
   - Required vs optional fields (`field` vs `field?`)
   - Null-allowed fields (`field: Type | null`)
   - Actual primitive types
   - Array element types
   - Nested object structures
5. Encode findings as TypeScript interfaces/types

---

### 2. Type Validation Approach

**Question**: How should type definition accuracy be validated?

**Decision**: TypeScript compilation only - no JSON schemas or runtime validation

**Rationale**:
- TypeScript compiler provides immediate, zero-cost validation
- IDE provides autocomplete and inline error detection
- Compilation errors guide developers to exactly what needs fixing
- JSON schemas add implementation complexity without meaningful safety benefit
- Runtime validation contradicts "compile-time only" design principle (explicitly out of scope)

**Alternatives Considered**:
- **JSON Schema generation + comparison**: Rejected - Adds tooling complexity, maintenance overhead, and provides no additional safety beyond what TypeScript already guarantees
- **Runtime monitoring**: Rejected - Out of scope per spec; type definitions are compile-time artifacts
- **Automated coverage analysis**: Rejected - TypeScript compiler already validates field access; additional tooling provides diminishing returns

**Implementation Approach**:
1. Define TypeScript interfaces based on manual inspection
2. Import types in service/adapter/orchestrator code
3. Run `bun run compile` (`tsc --noEmit`) to validate
4. Fix compilation errors until clean
5. Verify IDE autocomplete works as expected

**Success Metrics**:
- Zero TypeScript compilation errors
- IDE autocomplete shows all expected fields
- Adapter code accesses fields without type assertions

---

### 3. Type Maintenance & Ownership

**Question**: Who maintains type definitions when APIs change?

**Decision**: Platform adapter maintainer updates types when updating adapter logic

**Rationale**:
- Ensures atomic updates - types and transformation logic change together
- Clear ownership - one person understands both API change and code impact
- Reduces coordination overhead
- Leverages domain expertise

**Implementation Guidelines**:
When platform API changes, adapter maintainer MUST:
1. Capture new actual API response samples
2. Update type definitions in `lib/api/types/platforms/{platform}-response-types.ts`
3. Update adapter transformation logic in `lib/api/adapters/{platform}-adapter.ts`
4. Ensure TypeScript compilation passes (`bun run compile`)
5. Verify IDE autocomplete reflects changes

---

### 4. Drift Detection Mechanism

**Question**: How should drift between type definitions and actual APIs be detected?

**Decision**: TypeScript compilation errors when adapters access mismatched fields

**Rationale**:
- Immediate feedback - errors appear as developer writes code
- No additional tooling required
- Zero maintenance overhead
- Aligns with "compile-time only" design principle

**How It Works**:
1. Developer updates type definition to match API change
2. TypeScript compiler immediately flags all adapter code accessing old field names
3. Developer fixes adapter code guided by compiler errors
4. Process repeats until compilation succeeds

**Alternative Considered**:
- **Runtime monitoring in test environments**: Rejected - Adds operational complexity; compilation errors already provide immediate feedback

---

### 5. Platform Type Lookup Utility

**Question**: How should platform-specific types be referenced dynamically?

**Decision**: Mapped type utility in `lib/api/types/platforms/index.ts`

**Implementation Pattern**:

```typescript
// lib/api/types/platforms/index.ts
import type { PlatformType } from '@/types/tenant';

export interface PlatformResponseTypeMap {
  newapi: {
    balance: NewAPIBalanceResponse;
    costs: NewAPICostsResponse;
    tokens: NewAPITokensResponse;
    tokenGroups: NewAPITokenGroupsResponse;
    tenantInfo: NewAPITenantInfoResponse;
  };
  cubence: { /* ... */ };
  packycode_codex: { /* ... */ };
}

// Utility type: Get response type for platform + endpoint
export type PlatformResponse<
  P extends PlatformType,
  E extends keyof PlatformResponseTypeMap[P]
> = PlatformResponseTypeMap[P][E];

// Usage in generic function
function processBalance<P extends PlatformType>(
  platform: P,
  response: PlatformResponse<P, 'balance'>
) {
  // TypeScript knows response type based on platform parameter
}
```

---

### 6. JSDoc Documentation Standards

**Question**: When should JSDoc comments be added?

**Decision**: Add JSDoc when field names are non-obvious (FR-012)

**Criteria**:

**Requires JSDoc**:
- Abbreviated names (e.g., `tk` → "token")
- Domain-specific terminology needing context
- Ambiguous semantics (e.g., `status` - what are valid values?)
- Unit-dependent fields (e.g., `timeout` - milliseconds or seconds?)
- Null-allowed fields (explain when/why null occurs)

**Does NOT require JSDoc**:
- Self-explanatory names (`email`, `username`, `createdAt`)
- Standard conventions (`id`, `name`, `description`)
- Obvious types (`isEnabled: boolean`)

**Example**:

```typescript
export interface NewAPIBalanceResponse {
  /** Remaining account credits in USD cents (e.g., 1000 = $10.00) */
  remaining_quota: number;

  // No JSDoc needed - self-explanatory
  user_email: string;

  /** Unix timestamp (seconds) when quota last updated. May be null if never updated. */
  last_update_time: number | null;
}
```

---

## Technology Stack

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Type Definitions | TypeScript 5.9.2 interfaces/types | Existing project standard; strict mode enforces accuracy |
| Validation | TypeScript compiler (`tsc --noEmit`) | Zero-cost compile-time validation; no additional tooling needed |
| IDE Support | TypeScript language service | Provides autocomplete, inline errors, go-to-definition |

---

## Best Practices Applied

### TypeScript Type Definition Patterns

1. **Use interfaces for object types** (better error messages)
2. **Use type aliases for unions and primitives** (clearer intent)
3. **Prefer optional properties (`field?:`)** over union with undefined
4. **Distinguish optional (`field?:`) from nullable (`field: T | null`)**
5. **Use `unknown` for truly dynamic data**, not `any`
6. **Namespace platform types** to prevent collisions
7. **Export all public types** from `index.ts` barrel export

### Platform API Response Patterns

1. **Pagination**: Capture metadata fields (total, page, pageSize) if present
2. **Timestamps**: Clarify unit (seconds vs milliseconds) via JSDoc
3. **Enums**: Use string literal unions (`type Status = 'active' | 'suspended'`)
4. **Nested arrays**: Type element structure explicitly
5. **Polymorphic responses**: Use discriminated unions

---

## Integration Points

### Existing Code Updates Required

| File | Change | Impact |
|------|--------|--------|
| `lib/api/services/types.ts` | Type `IRawPlatformService` method returns | Services return typed responses |
| `lib/api/services/*-service.ts` | Import platform types | Methods return `Promise<RawAPIResponse<PlatformType>>` |
| `lib/api/adapters/types.ts` | Type `PlatformAdapter` method parameters | Adapters receive typed sources |
| `lib/api/adapters/*-adapter.ts` | Import platform types | Sources typed, not `unknown` |
| `lib/api/orchestrators/types.ts` | Replace `unknown` in Response Aggregates | Typed multi-endpoint responses |

### New Files Created

| File | Purpose |
|------|---------|
| `lib/api/types/platforms/index.ts` | Central exports + platform type mapping |
| `lib/api/types/platforms/newapi-response-types.ts` | NewAPI types (5 endpoints) |
| `lib/api/types/platforms/cubence-response-types.ts` | Cubence types (5 endpoints) |
| `lib/api/types/platforms/packycode-codex-response-types.ts` | PackyCode Codex types (5 endpoints) |
| `lib/api/types/platforms/response-aggregates.ts` | Response Aggregate types |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Manual inspection misses fields | Medium | High | Capture multiple test cases; cross-reference with existing adapter code |
| Platform API changes break types | Medium | Low | TypeScript compilation errors guide fixes immediately |
| Type definitions grow stale | Low | Medium | Adapter maintainer updates atomically with adapter code |

---

## Success Metrics Validation

| Success Criterion | Validation Method | Target |
|-------------------|------------------|--------|
| SC-001: 95% type-safe adapters | Track TypeScript errors in adapter PRs | < 5% require runtime fixes |
| SC-002: 80% faster debugging | Measure time from API change to fix | 80% reduction |
| SC-003: 50% faster code reviews | Track PR review time | 50% reduction |
| SC-004: 60% faster onboarding | Survey new developers | 60% reduction |
| SC-005: 100% field coverage | IDE autocomplete verification | All fields autocomplete |
| SC-006: Zero runtime errors | Production error logs | 0 undefined property errors |
| SC-007: Drift detection | Compilation errors on API changes | Immediate detection |

---

## Next Steps (Phase 1)

1. **Generate Data Model** (`data-model.md`):
   - Document all 15 platform response types + Response Aggregates
   - Specify field-level details based on existing adapter code analysis

2. **Generate Quickstart Guide** (`quickstart.md`):
   - Developer instructions for using platform types
   - Examples of type-safe service/adapter implementations
   - TypeScript compilation workflow

3. **Update Agent Context**:
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
   - Add any new patterns discovered during implementation
