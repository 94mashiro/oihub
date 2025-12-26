# Quick Start: Tenant Info Storage Refactoring

**Date**: 2025-12-26
**Feature**: Tenant Info Storage Refactoring
**Branch**: 002-tenant-info-refactor

## Overview

This guide provides a quick reference for implementing the tenant info storage refactoring. For detailed design decisions, see [research.md](./research.md). For data structures, see [data-model.md](./data-model.md).

---

## Implementation Checklist

### Phase 1: Type Definitions

- [ ] Update `types/tenant.ts`:
  - [ ] Remove `info?: TenantInfo` field from `Tenant` interface
  - [ ] Update `TenantInfo` interface with normalized field names
  - [ ] Ensure all `TenantInfo` fields are optional

### Phase 2: Adapter Layer

- [ ] Update `lib/api/adapters/types.ts`:
  - [ ] Add `normalizeTenantInfo(raw: unknown): TenantInfo` to `PlatformAdapter` interface

- [ ] Update `lib/api/adapters/newapi-adapter.ts`:
  - [ ] Implement `normalizeTenantInfo()` method
  - [ ] Map platform fields to normalized fields

### Phase 3: Store Layer

- [ ] Create `lib/state/tenant-info-store.ts`:
  - [ ] Define `TenantInfoStoreState` interface
  - [ ] Create store using `createStore` pattern
  - [ ] Implement `setTenantInfo()`, `removeTenantInfo()`, `getTenantInfo()` actions
  - [ ] Set `storageItem: undefined` (runtime-only)

- [ ] Update `lib/state/tenant-store.ts`:
  - [ ] Update `removeTenant()` to call `useTenantInfoStore.getState().removeTenantInfo(id)`

### Phase 4: Service Layer

- [ ] Update `lib/api/services/tenant-api-service.ts`:
  - [ ] Modify `getStatus()` to use `this.adapter.normalizeTenantInfo(raw)`

### Phase 5: Component Updates

- [ ] Update `components/biz/tenant-select-card/index.tsx`
- [ ] Update `components/biz/tenant-select-card/model-usage-panel.tsx`
- [ ] Update `components/biz/tenant-select-card/token-list-panel.tsx`
- [ ] Update `components/biz/tenant-select-card/api-endpoints-panel.tsx`
- [ ] Update `components/biz-screen/popup-settings-screen/index.tsx`

### Phase 6: Utility Updates

- [ ] Update `lib/utils/quota-converter.ts`
- [ ] Update `lib/background/modules/usage-alert.ts`
- [ ] Update `hooks/use-tenant-data-refresh.ts`

### Phase 7: Verification

- [ ] Run `bun run compile` (type checking)
- [ ] Test all components that use tenant info
- [ ] Verify tenant deletion cleans up tenant info

---

## Code Snippets

### 1. Updated TenantInfo Type

```typescript
// types/tenant.ts
export interface TenantInfo {
  creditUnit?: number;        // Was: quota_per_unit
  exchangeRate?: number;       // Was: usd_exchange_rate
  displayFormat?: string;      // Was: quota_display_type
  endpoints?: ApiEndpoint[];   // Was: api_info
  notices?: Notice[];          // Was: announcements
}
```

### 2. TenantInfoStore Creation

```typescript
// lib/state/tenant-info-store.ts
import { createStore } from './create-store';
import type { TenantId, TenantInfo } from '@/types/tenant';

interface TenantInfoStoreState {
  ready: boolean;
  tenantInfoMap: Record<TenantId, TenantInfo>;
  setTenantInfo: (tenantId: TenantId, info: TenantInfo) => void;
  removeTenantInfo: (tenantId: TenantId) => void;
  getTenantInfo: (tenantId: TenantId) => TenantInfo | undefined;
  hydrate: () => Promise<void>;
}

export const useTenantInfoStore = createStore<
  TenantInfoStoreState,
  never,
  never
>({
  storageItem: undefined,  // Runtime-only
  persistConfig: { keys: [] },
  createState: (set, get) => ({
    ready: false,
    tenantInfoMap: {},

    setTenantInfo: (tenantId, info) => {
      set((state) => {
        state.tenantInfoMap[tenantId] = info;
      });
    },

    removeTenantInfo: (tenantId) => {
      set((state) => {
        delete state.tenantInfoMap[tenantId];
      });
    },

    getTenantInfo: (tenantId) => {
      return get().tenantInfoMap[tenantId];
    },

    hydrate: async () => {
      set((state) => {
        state.ready = true;
      });
    },
  }),
});
```

### 3. Adapter Implementation

```typescript
// lib/api/adapters/newapi-adapter.ts
normalizeTenantInfo(raw: unknown): TenantInfo {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  const data = raw as Record<string, unknown>;

  return {
    creditUnit: typeof data.quota_per_unit === 'number'
      ? data.quota_per_unit
      : undefined,
    exchangeRate: typeof data.usd_exchange_rate === 'number'
      ? data.usd_exchange_rate
      : undefined,
    displayFormat: typeof data.quota_display_type === 'string'
      ? data.quota_display_type
      : undefined,
    endpoints: Array.isArray(data.api_info)
      ? data.api_info
      : undefined,
    notices: Array.isArray(data.announcements)
      ? data.announcements
      : undefined,
  };
}
```

### 4. Service Update

```typescript
// lib/api/services/tenant-api-service.ts
async getStatus(): Promise<TenantInfo> {
  const raw = await this.apiClient.get('/api/status', this.config);
  return this.adapter.normalizeTenantInfo(raw);
}
```

### 5. Component Access Pattern

```typescript
// Before
const tenant = useTenantStore((s) => s.selectedTenant);
const quotaUnit = tenant?.info?.quota_per_unit;

// After
const tenantId = useTenantStore((s) => s.selectedTenantId);
const tenantInfo = useTenantInfoStore((s) => s.tenantInfoMap[tenantId]);
const quotaUnit = tenantInfo?.creditUnit;
```

### 6. Tenant Deletion Cleanup

```typescript
// lib/state/tenant-store.ts
removeTenant: async (id) => {
  set((state) => {
    state.tenantList = state.tenantList.filter(t => t.id !== id);
  });
  await persist({ tenantList: get().tenantList });

  // Clean up tenant info
  useTenantInfoStore.getState().removeTenantInfo(id);
}
```

---

## Field Mapping Reference

| Old Field (Platform) | New Field (Normalized) | Type |
|---------------------|------------------------|------|
| `quota_per_unit` | `creditUnit` | `number?` |
| `usd_exchange_rate` | `exchangeRate` | `number?` |
| `quota_display_type` | `displayFormat` | `string?` |
| `api_info` | `endpoints` | `ApiEndpoint[]?` |
| `announcements` | `notices` | `Notice[]?` |

---

## Files to Modify

### Core Files (8 files)

1. `types/tenant.ts` - Type definitions
2. `lib/state/tenant-info-store.ts` - New store (create)
3. `lib/state/tenant-store.ts` - Cleanup logic
4. `lib/api/adapters/types.ts` - Interface extension
5. `lib/api/adapters/newapi-adapter.ts` - Adapter implementation
6. `lib/api/services/tenant-api-service.ts` - Service update
7. `lib/utils/quota-converter.ts` - Utility update
8. `lib/background/modules/usage-alert.ts` - Background module update

### Component Files (5 files)

9. `components/biz/tenant-select-card/index.tsx`
10. `components/biz/tenant-select-card/model-usage-panel.tsx`
11. `components/biz/tenant-select-card/token-list-panel.tsx`
12. `components/biz/tenant-select-card/api-endpoints-panel.tsx`
13. `components/biz-screen/popup-settings-screen/index.tsx`

### Hook Files (1 file)

14. `hooks/use-tenant-data-refresh.ts`

**Total**: 14 files (1 new, 13 modified)

---

## Testing Strategy

### Type Checking
```bash
bun run compile
```
- Verify no TypeScript errors
- All `tenant.info` references should be flagged

### Manual Testing
1. Add a new tenant → verify config persists
2. Fetch tenant info → verify data appears in UI
3. Switch tenants → verify correct tenant info displays
4. Delete tenant → verify tenant info is cleaned up
5. Test with missing fields → verify graceful degradation

---

## Common Pitfalls

1. **Forgetting optional chaining**: Always use `tenantInfo?.field`
2. **Not cleaning up on deletion**: Call `removeTenantInfo()` in `removeTenant()`
3. **Persisting tenant info**: Store must be runtime-only (no `storageItem`)
4. **Missing adapter call**: Service must call `adapter.normalizeTenantInfo()`

---

## Next Steps

After completing implementation:
1. Run `/speckit.tasks` to generate detailed task breakdown
2. Run `/speckit.implement` to execute tasks
3. Test thoroughly with manual verification
4. Commit changes with descriptive message

---

## Support

- **Spec**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/api-contracts.md](./contracts/api-contracts.md)
