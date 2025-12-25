# Research: Store Field Abstraction

**Feature**: 001-store-field-abstraction
**Date**: 2025-12-25

## Research Topics

### 1. TypeScript Adapter Pattern for API Normalization

**Decision**: Implement stateless adapter interface with pure normalization functions

**Rationale**:
- Adapters should be stateless to enable easy testing and platform switching
- Pure functions ensure predictable normalization without side effects
- Optional chaining handles missing fields gracefully across platforms

**Alternatives Considered**:
- Class-based adapters with state: Rejected - unnecessary complexity for data transformation
- Generic mapper utilities: Rejected - loses type safety and platform-specific handling

**Implementation Pattern**:
```typescript
interface PlatformAdapter {
  normalizeBalance(raw: unknown): Balance;
  normalizeCost(raw: unknown): Cost;
  normalizeToken(raw: unknown): Token;
}

// Graceful fallbacks for missing fields
normalizeBalance(raw: TenantBalance): Balance {
  return {
    remainingCredit: raw.quota ?? 0,
    consumedCredit: raw.used_quota ?? 0,
  };
}
```

---

### 2. Browser Extension Storage Migration

**Decision**: Version-based migration with automatic upgrade on hydration

**Rationale**:
- WXT storage lacks built-in migration; custom solution needed
- Migration on hydration is transparent to components
- Versioned schema prevents data corruption during upgrades

**Alternatives Considered**:
- Manual migration via settings UI: Rejected - poor UX, user intervention required
- Dual-write during transition: Rejected - doubles storage usage, complex sync

**Implementation Pattern**:
```typescript
const migrations: Record<number, MigrationFn> = {
  2: (oldData) => {
    // v1 → v2: Reduce TenantBalance to Balance
    return Object.entries(oldData).reduce((acc, [id, balance]) => {
      acc[id] = {
        remainingCredit: balance.quota,
        consumedCredit: balance.used_quota,
      };
      return acc;
    }, {});
  },
};
```

**Key Insight**: Existing `createStore` factory can be extended to run migrations before setting `ready: true`.

---

### 3. Zustand Type Narrowing for Field Reduction

**Decision**: Use `TPersistedKeys` type parameter to enforce narrowed persistence

**Rationale**:
- Existing `createStore` pattern already supports selective persistence
- TypeScript enforces only declared fields are persisted
- Compile-time validation prevents accidental field persistence

**Alternatives Considered**:
- Runtime field filtering: Rejected - loses type safety, error-prone
- Separate persisted/runtime stores: Rejected - unnecessary complexity

**Implementation Pattern**:
```typescript
export const balanceStore = createStore<
  BalanceStoreState,
  BalancePersistedState,
  'remainingCredit' | 'consumedCredit'
>({
  persistConfig: { keys: ['remainingCredit', 'consumedCredit'] },
  // ...
});
```

---

## Field Usage Analysis (from codebase exploration)

### TenantBalance → Balance

| Original Field | Used | Normalized Field |
|---------------|------|------------------|
| quota | ✅ | remainingCredit |
| used_quota | ✅ | consumedCredit |
| id, username, display_name, email, role, status, group, request_count, aff_*, inviter_id, *_id, stripe_customer, setting, sidebar_modules, permissions | ❌ | (removed) |

**Reduction**: 22+ fields → 2 fields (~91% reduction)

### CostData → Cost

| Original Field | Used | Normalized Field |
|---------------|------|------------------|
| model_name | ✅ | modelId |
| quota | ✅ | creditCost |
| token_used | ✅ | tokenUsage |
| count, created_at, id, user_id, username | ❌ | (removed) |

**Reduction**: 8 fields → 3 fields (~63% reduction)

### Token → Token (normalized)

| Original Field | Used | Normalized Field |
|---------------|------|------------------|
| key | ✅ | secretKey |
| name | ✅ | label |
| accessed_time | ✅ | lastUsedAt |
| used_quota | ✅ | creditConsumed |
| group | ✅ | group |
| created_time | ❌ | (removed) |

**Reduction**: 6 fields → 5 fields (~17% reduction)

---

## Architecture Decision

**Adapter Layer Location**: `lib/api/adapters/`

```
lib/api/
├── client/           # Low-level HTTP client
├── services/         # TenantAPIService (existing)
└── adapters/         # NEW: Platform adapters
    ├── types.ts      # PlatformAdapter interface + normalized types
    └── newapi-adapter.ts  # Default implementation
```

**Integration Point**: Adapters are called by `TenantAPIService` after receiving raw API responses, before returning to callers.

---

## Open Questions (Resolved)

1. ~~What naming for normalized types?~~ → `Balance`, `Cost`, `Token` (per spec clarifications)
2. ~~Default platform identifier?~~ → `newapi` (per spec clarifications)
3. ~~Where to store platform type?~~ → `Tenant.platformType` field in tenant-store
