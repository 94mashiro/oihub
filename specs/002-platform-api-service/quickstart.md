# Quickstart: Platform API Service Abstraction

**Feature**: 002-platform-api-service
**Date**: 2025-12-26

## Overview

This feature introduces a generic `PlatformAPIService` that routes API calls based on `platformType` to platform-specific implementations. Business layer code should only interact with `PlatformAPIService`.

## Usage

### Basic Usage (Business Layer)

```typescript
import { PlatformAPIService } from '@/lib/api';
import type { Tenant } from '@/types/tenant';

// Create service for a tenant
const tenant: Tenant = {
  id: 'tenant-1',
  name: 'My Tenant',
  token: 'sk-xxx',
  userId: '123',
  url: 'https://api.example.com',
  platformType: 'newapi', // or undefined (defaults to 'newapi')
};

const api = new PlatformAPIService(tenant);

// All methods return unified types regardless of platform
const info = await api.getTenantInfo();     // TenantInfo
const balance = await api.getBalance();      // Balance
const tokens = await api.getTokens(1, 10);   // PaginationResult<Token>
const groups = await api.getTokenGroups();   // Record<string, TokenGroup>
const costs = await api.getCostData('7d');   // Cost[]
```

### Error Handling

```typescript
import { PlatformAPIService, PlatformAPIError, PlatformNotSupportedError } from '@/lib/api';

try {
  const api = new PlatformAPIService(tenant);
  const balance = await api.getBalance();
} catch (error) {
  if (error instanceof PlatformNotSupportedError) {
    // Unsupported platform type
    console.error(`Platform not supported: ${error.platformType}`);
  } else if (error instanceof PlatformAPIError) {
    // API call failed
    console.error(`${error.platformType} ${error.method} failed:`, error.cause);
  }
}
```

### Default Platform Type

If `tenant.platformType` is undefined, the service defaults to `'newapi'` and logs a warning:

```typescript
const tenant: Tenant = {
  id: 'tenant-1',
  // platformType not set
};

const api = new PlatformAPIService(tenant);
// Warning logged: "platformType undefined, defaulting to 'newapi'"
// api.platformType === 'newapi'
```

## Architecture Rules

1. **DO**: Import `PlatformAPIService` from `@/lib/api`
2. **DO**: Pass the full `Tenant` object to the constructor
3. **DO**: Handle `PlatformAPIError` and `PlatformNotSupportedError`
4. **DON'T**: Import platform-specific services (NewAPIService)
5. **DON'T**: Import adapters directly
6. **DON'T**: Access `apiClient` directly for tenant API calls

## File Locations

| File | Purpose |
|------|---------|
| `lib/api/services/platform-api-service.ts` | Generic routing service |
| `lib/api/services/newapi-service.ts` | NewAPI platform implementation |
| `lib/api/errors/platform-api-error.ts` | API error type |
| `lib/api/errors/platform-not-supported-error.ts` | Unsupported platform error |
| `lib/api/index.ts` | Public exports |

## Migration from TenantAPIService

Replace direct `TenantAPIService` usage with `PlatformAPIService`:

```typescript
// Before
import { TenantAPIService } from '@/lib/api/services/tenant-api-service';
const api = new TenantAPIService(tenant);

// After
import { PlatformAPIService } from '@/lib/api';
const api = new PlatformAPIService(tenant);
```

Method signatures remain identical - no other code changes required.
