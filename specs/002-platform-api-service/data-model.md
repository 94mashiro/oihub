# Data Model: Platform API Service Abstraction

**Feature**: 002-platform-api-service
**Date**: 2025-12-26

## Entities

### Existing Types (No Changes)

These types already exist in the codebase and will be reused as-is:

| Entity | Location | Purpose |
|--------|----------|---------|
| `Tenant` | `types/tenant.ts` | Tenant configuration with platformType |
| `TenantInfo` | `types/tenant.ts` | Normalized tenant metadata |
| `Balance` | `lib/api/adapters/types.ts` | Normalized credit balance |
| `Cost` | `lib/api/adapters/types.ts` | Normalized cost record |
| `Token` | `lib/api/adapters/types.ts` | Normalized API token |
| `TokenGroup` | `lib/api/adapters/types.ts` | Token group metadata |
| `PlatformType` | `lib/api/adapters/types.ts` | Platform type union (unchanged: 'newapi' only) |
| `PlatformAdapter` | `lib/api/adapters/types.ts` | Adapter interface |
| `PaginationResult<T>` | `types/api.ts` | Paginated response wrapper |
| `CostPeriod` | `types/api.ts` | Cost query period enum |

### New Types

#### IPlatformService Interface

```typescript
// lib/api/services/types.ts - NEW
import type { Balance, Cost, Token, TokenGroup } from '@/lib/api/adapters/types';
import type { TenantInfo, Tenant } from '@/types/tenant';
import type { PaginationResult, CostPeriod } from '@/types/api';

export interface IPlatformService {
  getTenantInfo(): Promise<TenantInfo>;
  getBalance(): Promise<Balance>;
  getTokens(page: number, size: number): Promise<PaginationResult<Token>>;
  getTokenGroups(): Promise<Record<string, TokenGroup>>;
  getCostData(period: CostPeriod): Promise<Cost[]>;
}
```

#### PlatformAPIError

```typescript
// lib/api/errors/platform-api-error.ts - NEW
import type { PlatformType } from '@/lib/api/adapters/types';

export class PlatformAPIError extends Error {
  constructor(
    public readonly platformType: PlatformType,
    public readonly method: string,
    public readonly cause: Error
  ) {
    super(`[${platformType}] ${method} failed: ${cause.message}`);
    this.name = 'PlatformAPIError';
  }
}
```

#### AdapterTransformError

```typescript
// lib/api/errors/adapter-transform-error.ts - NEW
export class AdapterTransformError extends Error {
  constructor(
    public readonly sourceShape: string,
    public readonly targetType: string,
    public readonly cause?: Error
  ) {
    super(`Failed to transform ${sourceShape} to ${targetType}`);
    this.name = 'AdapterTransformError';
  }
}
```

#### PlatformNotSupportedError

```typescript
// lib/api/errors/platform-not-supported-error.ts - NEW
export class PlatformNotSupportedError extends Error {
  constructor(public readonly platformType: string) {
    super(`Platform not supported: ${platformType}`);
    this.name = 'PlatformNotSupportedError';
  }
}
```

## Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                        Business Layer                           │
│                    (uses PlatformAPIService)                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Tenant (with platformType)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PlatformAPIService                          │
│              implements IPlatformService                        │
│         routes by tenant.platformType to:                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                        ┌───────────────┐
                        │ NewAPIService │
                        │ (implements   │
                        │ IPlatformSvc) │
                        └───────┬───────┘
                                │
                                │ uses
                                ▼
                        ┌───────────────┐
                        │ NewAPIAdapter │
                        │ (normalizes)  │
                        └───────┬───────┘
                                │
                                │ produces
                                ▼
    ┌───────────────────────────────────────────────────────────┐
    │              Unified Types                                 │
    │  TenantInfo, Balance, Cost, Token, TokenGroup             │
    └───────────────────────────────────────────────────────────┘
```

## Validation Rules

| Field | Rule | Error |
|-------|------|-------|
| `tenant.platformType` | Must be valid `PlatformType` or undefined | `PlatformNotSupportedError` |
| `tenant.platformType` | If undefined, defaults to `'newapi'` | Warning logged |
| API response | Must be transformable by adapter | `AdapterTransformError` |
| API call | Must succeed or throw | `PlatformAPIError` |

## State Transitions

Not applicable - this feature is stateless service layer. Each API call is independent.
