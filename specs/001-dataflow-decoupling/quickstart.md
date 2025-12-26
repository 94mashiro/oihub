# Quickstart: Dataflow Decoupling

**Feature**: 001-dataflow-decoupling
**Date**: 2025-12-26

## Overview

This guide explains how to work with the decoupled dataflow architecture.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOOKS / UI                               │
│  Call orchestrators, handle result.completeness                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATORS                               │
│  Coordinate: fetch → transform → store                           │
│  Handle errors, return OrchestratorResult<T>                     │
└─────────────────────────────────────────────────────────────────┘
                    │                   │
                    ▼                   ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│       SERVICES          │   │       ADAPTERS          │
│  Raw API fetching       │   │  Data transformation    │
│  Returns RawAPIResponse │   │  Accepts *Sources       │
└─────────────────────────┘   └─────────────────────────┘
                                        │
                                        ▼
                              ┌─────────────────────────┐
                              │        STORES           │
                              │  Normalized data        │
                              │  Keyed by TenantId      │
                              └─────────────────────────┘
```

## Adding a New Platform

### Step 1: Create Raw Service

```typescript
// lib/api/services/myplatform-service.ts

import type { IRawPlatformService, RawAPIResponse } from './types';
import { APIClient } from '@/lib/api/client';

export class MyPlatformService implements IRawPlatformService {
  private client: APIClient;

  constructor(tenant: Tenant) {
    this.client = new APIClient(tenant.url, {
      headers: { Authorization: `Bearer ${tenant.token}` }
    });
  }

  async fetchBalance(): Promise<RawAPIResponse> {
    const response = await this.client.get('/api/balance');
    return { data: response, status: 200 };
  }

  async fetchCosts(period: CostPeriod): Promise<RawAPIResponse> {
    const response = await this.client.get(`/api/costs?period=${period}`);
    return { data: response, status: 200 };
  }

  // ... other methods
}
```

### Step 2: Create Adapter

```typescript
// lib/api/adapters/myplatform-adapter.ts

import type { PlatformAdapterV2, Balance, Cost } from './types';
import type { BalanceSources, CostSources } from '@/lib/api/orchestrators/types';
import { TransformationError } from '@/lib/errors/transformation-error';

export class MyPlatformAdapter implements PlatformAdapterV2 {
  readonly platformType = 'myplatform' as const;

  normalizeBalance(sources: BalanceSources): Balance {
    const raw = sources.primary as MyPlatformBalanceResponse;

    if (typeof raw?.balance !== 'number') {
      throw new TransformationError(
        'Invalid balance format',
        sources.primary,
        'balance'
      );
    }

    return {
      remainingCredit: raw.balance,
      consumedCredit: raw.used ?? 0
    };
  }

  normalizeCosts(sources: CostSources): Cost[] {
    return (sources.costs as MyPlatformCostResponse[]).map(item => ({
      modelId: item.model,
      creditCost: item.cost,
      tokenUsage: item.tokens
    }));
  }

  // ... other methods
}
```

### Step 3: Register Platform

```typescript
// lib/api/services/index.ts

import { MyPlatformService } from './myplatform-service';

const serviceRegistry = {
  newapi: NewAPIService,
  cubence: CubenceService,
  myplatform: MyPlatformService  // Add here
};

// lib/api/adapters/index.ts

import { MyPlatformAdapter } from './myplatform-adapter';

const adapterRegistry = {
  newapi: new NewAPIAdapter(),
  cubence: new CubenceAdapter(),
  myplatform: new MyPlatformAdapter()  // Add here
};
```

## Multi-API Data Merge

When a platform requires data from multiple endpoints:

```typescript
// lib/api/orchestrators/balance-orchestrator.ts

async refresh(): Promise<OrchestratorResult<BalanceWithMeta>> {
  const errors: OrchestratorError[] = [];
  const sources: string[] = [];

  // Fetch from multiple endpoints in parallel
  const [balanceResult, usageResult] = await Promise.allSettled([
    this.service.fetchBalance(),
    this.service.fetchUsage()  // Additional endpoint
  ]);

  let primaryData: unknown = null;
  let usageData: unknown = null;

  if (balanceResult.status === 'fulfilled') {
    primaryData = balanceResult.value.data;
    sources.push('balance');
  } else {
    errors.push({ source: 'balance', type: 'api', ... });
  }

  if (usageResult.status === 'fulfilled') {
    usageData = usageResult.value.data;
    sources.push('usage');
  } else {
    errors.push({ source: 'usage', type: 'api', ... });
  }

  // Pass both to adapter
  const balanceSources: BalanceSources = {
    primary: primaryData,
    usage: usageData  // Adapter can merge both
  };

  const balance = this.adapter.normalizeBalance(balanceSources);
  // ...
}
```

## Error Handling

### In Adapters

```typescript
normalizeBalance(sources: BalanceSources): Balance {
  const raw = sources.primary;

  if (!raw || typeof raw !== 'object') {
    throw new TransformationError(
      'Expected object for balance',
      raw
    );
  }

  // Handle partial data gracefully
  return {
    remainingCredit: (raw as any).balance ?? 0,
    consumedCredit: (raw as any).used ?? 0
  };
}
```

### In Hooks

```typescript
const result = await orchestrator.refresh();

switch (result.completeness) {
  case 'full':
    // All good, data is complete
    break;
  case 'partial':
    // Show warning, data may be incomplete
    toast.warn('Some data could not be loaded');
    break;
  case 'failed':
    // Show error, no usable data
    toast.error('Failed to load data');
    break;
}
```

## Testing

Each layer can be tested in isolation:

```typescript
// Service test - mock HTTP client
const service = new MyPlatformService(mockTenant);
const result = await service.fetchBalance();
expect(result.data).toEqual(mockApiResponse);

// Adapter test - no mocks needed
const adapter = new MyPlatformAdapter();
const balance = adapter.normalizeBalance({ primary: mockRawData });
expect(balance.remainingCredit).toBe(100);

// Orchestrator test - mock service and adapter
const orchestrator = new BalanceOrchestrator(
  mockTenant,
  mockService,
  mockAdapter
);
const result = await orchestrator.refresh();
expect(result.completeness).toBe('full');
```

## File Naming

Follow kebab-case for all module files:

- `balance-orchestrator.ts` ✓
- `myplatform-service.ts` ✓
- `transformation-error.ts` ✓
- `BalanceOrchestrator.ts` ✗ (wrong)
