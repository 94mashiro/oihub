# Quickstart: Store Field Abstraction

**Feature**: 001-store-field-abstraction

## Overview

This feature streamlines store data structures and introduces a platform adapter architecture for cross-platform API support.

## Key Changes

### 1. Normalized Types

Replace platform-specific types with normalized versions:

```typescript
// Before: 22+ fields
interface TenantBalance { quota, used_quota, id, username, ... }

// After: 2 fields
interface Balance { remainingCredit, consumedCredit }
```

### 2. Platform Adapter

New adapter layer normalizes API responses:

```typescript
import { newAPIAdapter } from '@/lib/api/adapters/newapi-adapter';

// Normalize raw API response
const balance = newAPIAdapter.normalizeBalance(rawResponse);
```

### 3. Store Updates

Stores now use normalized types:

```typescript
// balance-store.ts
const balance = useBalanceStore((s) => s.balanceMap[tenantId]);
// balance.remainingCredit, balance.consumedCredit
```

## File Locations

| Purpose | Path |
|---------|------|
| Normalized types | `lib/api/adapters/types.ts` |
| NewAPI adapter | `lib/api/adapters/newapi-adapter.ts` |
| Balance store | `lib/state/balance-store.ts` |
| Cost store | `lib/state/cost-store.ts` |
| Token store | `lib/state/token-store.ts` |

## Migration

Existing stored data migrates automatically on first load. No user action required.

## Adding New Platforms

1. Create adapter in `lib/api/adapters/[platform]-adapter.ts`
2. Implement `PlatformAdapter` interface
3. Add platform type to `PlatformType` union
4. Register adapter in adapter registry
