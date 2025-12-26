# Research: Tenant Info Storage Refactoring

**Date**: 2025-12-26
**Feature**: Tenant Info Storage Refactoring
**Branch**: 002-tenant-info-refactor

## Overview

This document consolidates research findings for separating tenant configuration from runtime tenant info, normalizing field names, and extending the adapter pattern.

---

## Decision 1: Runtime Store Pattern

**Decision**: Use `createStore` with NO persistence for tenant info

**Rationale**:
- Tenant info is runtime data fetched from APIs, not user configuration
- Following the pattern from `balance-store.ts` and `cost-store.ts` which also store runtime API data
- In-memory storage is faster and reduces storage I/O
- Data is refreshed on startup and periodically, so persistence is unnecessary

**Alternatives Considered**:
- Persist to `local:tenant-info`: Rejected because tenant info is ephemeral runtime data that should be refreshed from API
- Store in tenant-store with separate field: Rejected because it violates separation of concerns (mixing config with runtime data)

**Implementation Pattern** (from existing stores):
```typescript
// No storage item needed for runtime-only store
export const useTenantInfoStore = createStore<
  TenantInfoStoreState,
  never,  // No persisted state
  never   // No persisted keys
>({
  storageItem: undefined,  // Runtime-only
  persistConfig: { keys: [] },
  createState: (set, get, persist) => ({
    ready: false,
    tenantInfoMap: {},
    setTenantInfo: (tenantId, info) => {
      set((state) => {
        state.tenantInfoMap[tenantId] = info;
      });
    },
    // No persist() calls needed
  }),
});
```

---

## Decision 2: Field Normalization Strategy

**Decision**: Normalize platform-specific field names to business-centric names

**Rationale**:
- Follows the pattern established in 001-store-field-abstraction for balance, cost, and token data
- Makes the codebase platform-agnostic and easier to extend
- Improves code readability by using domain language instead of platform-specific terms

**Field Mapping**:
| Platform Field (newapi) | Normalized Field | Type | Usage |
|-------------------------|------------------|------|-------|
| `quota_per_unit` | `creditUnit` | `number` | Currency conversion rate |
| `usd_exchange_rate` | `exchangeRate` | `number` | USD exchange rate |
| `quota_display_type` | `displayFormat` | `string` | Currency label (USD/CNY) |
| `api_info` | `endpoints` | `ApiEndpoint[]` | API endpoint list |
| `announcements` | `notices` | `Notice[]` | Announcement list |

**Alternatives Considered**:
- Keep platform-specific names: Rejected because it couples the store to newapi platform
- Use generic names like `field1`, `field2`: Rejected because it reduces code clarity

---

## Decision 3: Adapter Interface Extension

**Decision**: Extend `PlatformAdapter` interface with `normalizeTenantInfo()` method

**Rationale**:
- Maintains consistency with existing adapter pattern for balance, cost, and token data
- Centralizes platform-specific transformation logic in adapters
- Enables future platform support without modifying store or service code

**Interface Extension**:
```typescript
export interface PlatformAdapter {
  readonly platformType: PlatformType;
  normalizeBalance(raw: unknown): Balance;
  normalizeCosts(raw: unknown[]): Cost[];
  normalizeTokens(raw: unknown[]): Token[];
  normalizeTokenGroups(raw: unknown): Record<string, TokenGroup>;
  normalizeTenantInfo(raw: unknown): TenantInfo;  // New method
}
```

**Alternatives Considered**:
- Create separate `TenantInfoAdapter` interface: Rejected because it fragments the adapter pattern
- Transform in service layer: Rejected because it couples service to platform-specific formats

---

## Decision 4: Component Access Pattern

**Decision**: Components access tenant info via `useTenantInfoStore()` hook with tenant ID lookup

**Rationale**:
- Follows React hooks pattern used throughout the codebase
- Maintains reactivity for UI updates when tenant info changes
- Decouples components from tenant store (single responsibility)

**Access Pattern**:
```typescript
// Before (coupled to tenant store)
const tenant = useTenantStore((s) => s.selectedTenant);
const quotaUnit = tenant?.info?.quota_per_unit;

// After (decoupled)
const tenantId = useTenantStore((s) => s.selectedTenantId);
const tenantInfo = useTenantInfoStore((s) => s.tenantInfoMap[tenantId]);
const quotaUnit = tenantInfo?.creditUnit;
```

**Alternatives Considered**:
- Create `useTenantInfo(tenantId)` custom hook: Rejected because it adds unnecessary abstraction
- Keep tenant info in tenant store: Rejected because it violates separation of concerns

---

## Decision 5: Cleanup Strategy

**Decision**: Clean up orphaned tenant info when tenants are deleted

**Rationale**:
- Prevents memory leaks from accumulating stale data
- Maintains data consistency between tenant config and runtime info
- Simple to implement by listening to tenant deletion events

**Implementation Approach**:
```typescript
// In tenant-store.ts
removeTenant: (id) => {
  set((state) => {
    state.tenantList = state.tenantList.filter(t => t.id !== id);
  });
  await persist({ tenantList: get().tenantList });

  // Clean up tenant info
  useTenantInfoStore.getState().removeTenantInfo(id);
}
```

**Alternatives Considered**:
- Manual cleanup by caller: Rejected because it's error-prone and violates encapsulation
- Periodic garbage collection: Rejected because it's unnecessary complexity for small data sets

---

## Decision 6: Type Safety for Optional Fields

**Decision**: All tenant info fields are optional (`field?: type`)

**Rationale**:
- API may return partial data or missing fields
- Enables graceful degradation when data is unavailable
- Prevents runtime errors from accessing undefined properties

**Type Definition**:
```typescript
export interface TenantInfo {
  creditUnit?: number;
  exchangeRate?: number;
  displayFormat?: string;
  endpoints?: ApiEndpoint[];
  notices?: Notice[];
}
```

**Alternatives Considered**:
- Required fields with default values: Rejected because it hides missing data issues
- Separate optional/required interfaces: Rejected because all fields are genuinely optional

---

## Best Practices Applied

### State Management (from createStore pattern)
- Use Zustand with immer middleware for immutable updates
- Implement `ready` state to track hydration status
- Use selective subscriptions to minimize re-renders

### Adapter Pattern (from existing adapters)
- Keep adapters stateless and pure
- Handle unknown input types with runtime validation
- Return normalized data structures

### Component Integration (from existing components)
- Check store `ready` state before rendering
- Use optional chaining for safe property access
- Provide fallback UI for missing data

---

## Implementation Risks

### Risk 1: Breaking Component Functionality
**Mitigation**: Update all 8 components that reference `tenant.info` in a single atomic change

### Risk 2: Type Errors from Field Renaming
**Mitigation**: Use TypeScript strict mode to catch all references at compile time

### Risk 3: Missing Data Handling
**Mitigation**: All fields are optional, components already handle undefined values

---

## Summary

The research confirms that:
1. Runtime-only store pattern is appropriate for tenant info
2. Field normalization aligns with existing adapter pattern
3. Component access pattern follows React best practices
4. All technical decisions are consistent with codebase conventions

No additional research or clarification needed. Ready to proceed to Phase 1 (Design & Contracts).
