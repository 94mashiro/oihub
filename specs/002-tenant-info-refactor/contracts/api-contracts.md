# API Contracts: Tenant Info Storage Refactoring

**Date**: 2025-12-26
**Feature**: Tenant Info Storage Refactoring
**Branch**: 002-tenant-info-refactor

## Overview

This document defines the internal API contracts for the tenant info refactoring. Since this is a refactoring of internal data structures (not external APIs), the contracts focus on TypeScript interfaces and method signatures.

---

## Store Contracts

### TenantInfoStore

**Purpose**: Runtime store for tenant info data

**Location**: `lib/state/tenant-info-store.ts`

**Interface**:
```typescript
interface TenantInfoStoreState {
  // State
  ready: boolean;
  tenantInfoMap: Record<TenantId, TenantInfo>;

  // Actions
  setTenantInfo(tenantId: TenantId, info: TenantInfo): void;
  removeTenantInfo(tenantId: TenantId): void;
  getTenantInfo(tenantId: TenantId): TenantInfo | undefined;
  hydrate(): Promise<void>;
}
```

**Method Contracts**:

#### `setTenantInfo(tenantId: TenantId, info: TenantInfo): void`
- **Purpose**: Store or update tenant info for a specific tenant
- **Preconditions**: None
- **Postconditions**: `tenantInfoMap[tenantId]` contains the provided info
- **Side Effects**: Triggers re-render in subscribed components
- **Error Handling**: No errors thrown

#### `removeTenantInfo(tenantId: TenantId): void`
- **Purpose**: Remove tenant info for a deleted tenant
- **Preconditions**: None
- **Postconditions**: `tenantInfoMap[tenantId]` is undefined
- **Side Effects**: Triggers re-render in subscribed components
- **Error Handling**: No errors thrown (idempotent)

#### `getTenantInfo(tenantId: TenantId): TenantInfo | undefined`
- **Purpose**: Retrieve tenant info for a specific tenant
- **Preconditions**: None
- **Postconditions**: None (read-only)
- **Returns**: TenantInfo if exists, undefined otherwise
- **Error Handling**: No errors thrown

#### `hydrate(): Promise<void>`
- **Purpose**: Initialize store (no-op for runtime-only store)
- **Preconditions**: None
- **Postconditions**: `ready` is true
- **Side Effects**: Sets `ready` to true
- **Error Handling**: No errors thrown

---

## Adapter Contracts

### PlatformAdapter.normalizeTenantInfo

**Purpose**: Transform platform-specific tenant info to normalized format

**Location**: `lib/api/adapters/types.ts`

**Signature**:
```typescript
normalizeTenantInfo(raw: unknown): TenantInfo;
```

**Contract**:
- **Input**: `raw` - Unknown type (platform-specific API response)
- **Output**: `TenantInfo` - Normalized tenant info with optional fields
- **Preconditions**: None (must handle any input)
- **Postconditions**: Returns valid TenantInfo object (all fields optional)
- **Error Handling**: No errors thrown; returns empty object `{}` for invalid input
- **Idempotency**: Yes (pure function)

**Implementation Requirements**:
1. Validate input type (check for object)
2. Extract and validate each field
3. Return normalized object with business-centric field names
4. Handle missing or invalid fields gracefully (return undefined)

**Example Implementation** (newapi):
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

## Service Contracts

### TenantAPIService.getStatus

**Purpose**: Fetch tenant info from platform API

**Location**: `lib/api/services/tenant-api-service.ts`

**Current Signature**:
```typescript
getStatus(): Promise<TenantInfo>;  // Returns raw platform response
```

**New Signature**:
```typescript
async getStatus(): Promise<TenantInfo>;  // Returns normalized TenantInfo
```

**Contract Changes**:
- **Before**: Returns raw platform-specific response
- **After**: Returns normalized TenantInfo via adapter
- **Preconditions**: `this.adapter` is initialized
- **Postconditions**: Returns normalized TenantInfo with business-centric field names
- **Error Handling**: Throws on network errors (existing behavior)
- **Breaking Change**: Yes - return type structure changes

**Implementation**:
```typescript
async getStatus(): Promise<TenantInfo> {
  const raw = await this.apiClient.get('/api/status', this.config);
  return this.adapter.normalizeTenantInfo(raw);
}
```

---

## Type Contracts

### Tenant (Modified)

**Location**: `types/tenant.ts`

**Before**:
```typescript
export interface Tenant {
  id: TenantId;
  name: string;
  token: string;
  userId: string;
  url: string;
  info?: TenantInfo;  // REMOVED
  platformType?: PlatformType;
}
```

**After**:
```typescript
export interface Tenant {
  id: TenantId;
  name: string;
  token: string;
  userId: string;
  url: string;
  platformType?: PlatformType;
  // info field removed
}
```

**Breaking Change**: Yes - `info` field removed

---

### TenantInfo (Modified)

**Location**: `types/tenant.ts`

**Before** (platform-specific):
```typescript
export interface TenantInfo {
  quota_per_unit: number;
  usd_exchange_rate: number;
  quota_display_type: string;
  api_info: ApiEndpoint[];
  announcements?: Notice[];
}
```

**After** (normalized):
```typescript
export interface TenantInfo {
  creditUnit?: number;
  exchangeRate?: number;
  displayFormat?: string;
  endpoints?: ApiEndpoint[];
  notices?: Notice[];
}
```

**Breaking Changes**:
- All field names changed (snake_case → camelCase, business-centric names)
- All fields now optional (graceful degradation)

---

## Component Access Contracts

### Before (Coupled to Tenant Store)

```typescript
// Access pattern
const tenant = useTenantStore((s) => s.selectedTenant);
const quotaUnit = tenant?.info?.quota_per_unit;
const displayType = tenant?.info?.quota_display_type;
```

### After (Decoupled via TenantInfoStore)

```typescript
// Access pattern
const tenantId = useTenantStore((s) => s.selectedTenantId);
const tenantInfo = useTenantInfoStore((s) => s.tenantInfoMap[tenantId]);
const quotaUnit = tenantInfo?.creditUnit;
const displayType = tenantInfo?.displayFormat;
```

**Contract Requirements**:
- Components MUST check `tenantInfo` for undefined
- Components MUST use optional chaining for field access
- Components MUST provide fallback UI for missing data

---

## Backward Compatibility

### Breaking Changes

1. **Tenant.info field removed**
   - Impact: All components accessing `tenant.info` will break
   - Migration: Update to use `useTenantInfoStore()`

2. **TenantInfo field names changed**
   - Impact: All code referencing old field names will break
   - Migration: Update to use new field names (TypeScript will catch)

3. **TenantAPIService.getStatus() return type changed**
   - Impact: Code expecting raw response will break
   - Migration: Update to expect normalized TenantInfo

### Non-Breaking Changes

1. **TenantInfoStore is new**
   - Impact: None (new functionality)

2. **PlatformAdapter.normalizeTenantInfo() is new**
   - Impact: None (new method)

---

## Validation Rules

### TenantInfo Validation

All fields are optional. When present:

- `creditUnit`: Must be positive number
- `exchangeRate`: Must be positive number
- `displayFormat`: Must be non-empty string
- `endpoints`: Must be array (can be empty)
- `notices`: Must be array (can be empty)

**Validation Location**: Adapter layer (during normalization)

**Validation Strategy**: Type checking + graceful fallback to undefined

---

## Summary

The contracts define:
1. TenantInfoStore interface for runtime tenant info storage
2. PlatformAdapter.normalizeTenantInfo() for field normalization
3. Modified TenantAPIService.getStatus() to return normalized data
4. Updated Tenant and TenantInfo types with breaking changes
5. Component access pattern changes

All contracts prioritize graceful degradation with optional fields and no error throwing.
