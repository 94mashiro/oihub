# Data Model: Tenant Analytics (NewAPI Only)

**Date**: 2026-01-18  
**Feature**: Tenant Analytics Dashboard  
**Branch**: 001-tenant-analytics

## Overview

The analytics dashboard uses raw NewAPI responses and derives lightweight view models for summary metrics, time-series charts, and model breakdowns. Data is scoped to a single tenant and period.

---

## Entity Definitions

### 1. NewAPIBalanceResponse (Existing)

**Purpose**: Source for total requests and quota totals.  
**Location**: `/Users/mashirowang/Workspace/packyapi-hub/lib/api/types/platforms/newapi-response-types.ts`

**Fields used**:
- `request_count`: total API requests
- `quota`: remaining credits
- `used_quota`: consumed credits

**Validation Rules**:
- `request_count`, `quota`, `used_quota` are non-negative numbers when present

---

### 2. NewAPICostData (Existing)

**Purpose**: Raw usage points for time-series and model aggregation.  
**Location**: `/Users/mashirowang/Workspace/packyapi-hub/lib/api/types/platforms/newapi-response-types.ts`

**Fields used**:
- `created_at`: Unix seconds
- `model_name`: model identifier
- `quota`: credit cost
- `token_used`: tokens consumed
- `count`: request count

**Validation Rules**:
- `created_at`: > 0
- `quota`, `token_used`, `count`: non-negative numbers
- `model_name`: non-empty string (fallback to `"unknown"` in UI if missing)

---

### 3. NewAPIUsageSummary (Derived)

**Purpose**: Aggregate totals for a tenant and period.  
**Location**: `/Users/mashirowang/Workspace/packyapi-hub/types/tenant-analytics.ts`

```typescript
export interface NewAPIUsageSummary {
  tenantId: TenantId;
  period: CostPeriod;
  rangeStart: number; // Unix seconds
  rangeEnd: number;   // Unix seconds
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  quotaPerUnit?: number;
  displayType?: string;
}
```

**Validation Rules**:
- `tenantId`: non-empty string
- `period`: valid `CostPeriod`
- `rangeStart` <= `rangeEnd`
- totals are non-negative

---

### 4. NewAPIUsagePoint (Derived)

**Purpose**: Time-series point for charting usage trends.  
**Location**: `/Users/mashirowang/Workspace/packyapi-hub/types/tenant-analytics.ts`

```typescript
export interface NewAPIUsagePoint {
  timestamp: number; // Unix seconds
  requestCount: number;
  cost: number;
  tokens: number;
}
```

**Validation Rules**:
- `timestamp`: > 0
- `requestCount`, `cost`, `tokens`: non-negative

---

### 5. NewAPIModelUsage (Derived)

**Purpose**: Usage breakdown by model for charts.  
**Location**: `/Users/mashirowang/Workspace/packyapi-hub/types/tenant-analytics.ts`

```typescript
export interface NewAPIModelUsage {
  modelName: string;
  requestCount: number;
  cost: number;
  tokens: number;
  share: number; // 0..1 of totalCost
}
```

**Validation Rules**:
- `modelName`: non-empty string
- `share`: 0..1

---

### 6. NewAPIAnalyticsViewState (Derived)

**Purpose**: View-local state for analytics screen.  
**Location**: `/Users/mashirowang/Workspace/packyapi-hub/hooks/use-newapi-analytics.ts`

```typescript
type AnalyticsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface NewAPIAnalyticsViewState {
  status: AnalyticsStatus;
  error?: string;
  balance?: NewAPIBalanceResponse;
  costs?: NewAPICostData[];
  summary?: NewAPIUsageSummary;
  series?: NewAPIUsagePoint[];
  models?: NewAPIModelUsage[];
  lastUpdatedAt?: number; // Unix ms
}
```

**Validation Rules**:
- `status` must be valid
- `series` sorted by `timestamp` ascending
- `models` sorted by `cost` descending

---

## Relationships

```
Tenant --[fetches]--> NewAPIBalanceResponse + NewAPICostData[]
Tenant --[derives]--> NewAPIUsageSummary + NewAPIUsagePoint[] + NewAPIModelUsage[]
```

---

## State Transitions

```
idle -> loading -> ready
idle -> loading -> error
ready -> loading (manual refresh) -> ready/error
```

---

## Storage Notes

Analytics data is view-local and not persisted. Existing global stores (`tenant-store`, `tenant-info-store`) remain unchanged.
