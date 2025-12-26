# Data Model: Tenant Info Storage Refactoring

**Date**: 2025-12-26
**Feature**: Tenant Info Storage Refactoring
**Branch**: 002-tenant-info-refactor

## Overview

This document defines the data structures, relationships, and state transitions for the tenant info refactoring.

---

## Entity Definitions

### 1. Tenant (Modified)

**Purpose**: User-provided configuration for a tenant (platform account)

**Location**: `types/tenant.ts`

**Fields**:
```typescript
export interface Tenant {
  id: TenantId;              // Unique identifier
  name: string;              // User-provided display name
  token: string;             // API authentication token
  userId: string;            // User ID on the platform
  url: string;               // Platform API base URL
  platformType?: PlatformType; // Platform identifier (e.g., 'newapi')
  // REMOVED: info?: TenantInfo;  // Moved to separate store
}
```

**Validation Rules**:
- `id`: Required, non-empty string
- `name`: Required, non-empty string
- `token`: Required, non-empty string
- `userId`: Required, non-empty string
- `url`: Required, valid URL format
- `platformType`: Optional, must be valid PlatformType enum value

**Persistence**: Stored in `local:tenant` via tenant-store

**Relationships**:
- One-to-one with TenantInfo (via tenant ID lookup)

---

### 2. TenantInfo (New, Normalized)

**Purpose**: Runtime data fetched from platform APIs about a tenant

**Location**: `types/tenant.ts`

**Fields**:
```typescript
export interface TenantInfo {
  creditUnit?: number;        // Currency conversion rate (e.g., 0.002 USD per credit)
  exchangeRate?: number;       // USD exchange rate (e.g., 7.2 CNY per USD)
  displayFormat?: string;      // Currency display format ('USD' | 'CNY')
  endpoints?: ApiEndpoint[];   // Available API endpoints
  notices?: Notice[];          // Platform announcements
}

export interface ApiEndpoint {
  id: number;
  route: string;
  description: string;
  url: string;
}

export interface Notice {
  id: number;
  content: string;
  extra: string;
  publishDate: string;
  type: string;
}
```

**Validation Rules**:
- All fields are optional (graceful degradation)
- `creditUnit`: If present, must be positive number
- `exchangeRate`: If present, must be positive number
- `displayFormat`: If present, must be non-empty string
- `endpoints`: If present, must be array (can be empty)
- `notices`: If present, must be array (can be empty)

**Persistence**: NOT persisted (runtime-only, stored in memory)

**Relationships**:
- One-to-one with Tenant (via tenant ID key)

---

### 3. TenantInfoStoreState (New)

**Purpose**: Zustand store state for tenant info

**Location**: `lib/state/tenant-info-store.ts`

**Fields**:
```typescript
interface TenantInfoStoreState {
  ready: boolean;                           // Hydration status
  tenantInfoMap: Record<TenantId, TenantInfo>; // Tenant ID -> TenantInfo mapping

  // Actions
  setTenantInfo: (tenantId: TenantId, info: TenantInfo) => void;
  removeTenantInfo: (tenantId: TenantId) => void;
  getTenantInfo: (tenantId: TenantId) => TenantInfo | undefined;
  hydrate: () => Promise<void>;
}
```

**State Transitions**:
```
Initial State:
  ready: false
  tenantInfoMap: {}

After Hydration:
  ready: true
  tenantInfoMap: {} (empty, no persistence)

After API Fetch:
  ready: true
  tenantInfoMap: { [tenantId]: TenantInfo }

After Tenant Deletion:
  ready: true
  tenantInfoMap: { ...without deleted tenant }
```

---

### 4. PlatformAdapter (Modified)

**Purpose**: Interface for normalizing platform-specific API responses

**Location**: `lib/api/adapters/types.ts`

**Methods**:
```typescript
export interface PlatformAdapter {
  readonly platformType: PlatformType;

  // Existing methods
  normalizeBalance(raw: unknown): Balance;
  normalizeCosts(raw: unknown[]): Cost[];
  normalizeTokens(raw: unknown[]): Token[];
  normalizeTokenGroups(raw: unknown): Record<string, TokenGroup>;

  // New method
  normalizeTenantInfo(raw: unknown): TenantInfo;
}
```

**Validation Rules**:
- `normalizeTenantInfo` must handle unknown input types
- Must return TenantInfo with all fields optional
- Must not throw errors (return empty object on invalid input)

---

## Data Flow

### Fetch and Store Tenant Info

```
1. Component/Hook triggers fetch
   ↓
2. TenantAPIService.getStatus(tenantId)
   ↓
3. APIClient.get('/api/status')
   ↓
4. Platform returns raw response
   ↓
5. Adapter.normalizeTenantInfo(raw)
   ↓
6. TenantInfoStore.setTenantInfo(tenantId, normalized)
   ↓
7. Components re-render with new data
```

### Access Tenant Info in Component

```
1. Component calls useTenantInfoStore()
   ↓
2. Select tenantInfoMap[tenantId]
   ↓
3. Render with optional chaining (tenantInfo?.field)
```

### Delete Tenant

```
1. TenantStore.removeTenant(tenantId)
   ↓
2. Remove from tenantList
   ↓
3. Persist updated tenantList
   ↓
4. TenantInfoStore.removeTenantInfo(tenantId)
   ↓
5. Remove from tenantInfoMap
```

---

## Field Mapping (newapi Platform)

| Raw Field (API Response) | Normalized Field | Transformation |
|--------------------------|------------------|----------------|
| `quota_per_unit` | `creditUnit` | Direct copy (number) |
| `usd_exchange_rate` | `exchangeRate` | Direct copy (number) |
| `quota_display_type` | `displayFormat` | Direct copy (string) |
| `api_info` | `endpoints` | Direct copy (array) |
| `announcements` | `notices` | Direct copy (array) |

**Transformation Logic** (in newapi-adapter.ts):
```typescript
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

---

## Migration Strategy

**No migration needed** - this is a development-phase change.

**Cleanup Steps**:
1. Remove `info` field from Tenant type
2. TypeScript compiler will flag all references to `tenant.info`
3. Update each reference to use `useTenantInfoStore()`
4. Existing persisted data with `info` field will be ignored (no breaking changes)

---

## Component Update Pattern

**Before**:
```typescript
const tenant = useTenantStore((s) => s.selectedTenant);
const quotaUnit = tenant?.info?.quota_per_unit;
```

**After**:
```typescript
const tenantId = useTenantStore((s) => s.selectedTenantId);
const tenantInfo = useTenantInfoStore((s) => s.tenantInfoMap[tenantId]);
const quotaUnit = tenantInfo?.creditUnit;
```

---

## Error Handling

### Missing Tenant Info
- Components check `tenantInfo` for undefined
- Render fallback UI (e.g., "Data unavailable")
- No errors thrown

### API Fetch Failure
- TenantAPIService catches errors
- Returns empty TenantInfo object
- Components handle gracefully with optional chaining

### Invalid API Response
- Adapter validates input types
- Returns empty TenantInfo object for invalid data
- No errors thrown

---

## Summary

The data model separates tenant configuration (persisted) from tenant info (runtime). All tenant info fields are optional to support graceful degradation. The adapter pattern ensures platform-agnostic normalization. Components access tenant info via dedicated store with tenant ID lookup.
