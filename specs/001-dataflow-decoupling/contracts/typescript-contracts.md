# TypeScript Contracts: Dataflow Decoupling

**Feature**: 001-dataflow-decoupling
**Date**: 2025-12-26

This file defines the TypeScript interfaces and types for the decoupled dataflow architecture.

## Core Types

```typescript
// lib/api/orchestrators/types.ts

import type { PlatformType } from '@/lib/api/adapters';
import type { Tenant, TenantInfo } from '@/types/tenant';
import type { Balance, Cost, Token, TokenGroup } from '@/lib/api/adapters/types';

// =============================================================================
// Raw API Response
// =============================================================================

/** Wrapper for unprocessed API responses from services. */
export interface RawAPIResponse {
  /** Raw response body */
  data: unknown;
  /** HTTP status code */
  status: number;
  /** Response headers if needed */
  headers?: Record<string, string>;
}

// =============================================================================
// Entity Metadata
// =============================================================================

/** Metadata attached to normalized entities for data quality tracking. */
export interface EntityMeta {
  /** Whether all sources succeeded */
  completeness: 'full' | 'partial';
  /** Error messages from failed sources */
  errors: string[];
  /** Unix timestamp of fetch */
  fetchedAt: number;
  /** Names of sources that contributed */
  sources: string[];
}

// =============================================================================
// Orchestrator Types
// =============================================================================

/** Overall result status from orchestration. */
export type CompletenessStatus = 'full' | 'partial' | 'failed';

/** Structured error from orchestration process. */
export interface OrchestratorError {
  /** Which API endpoint or transformation failed */
  source: string;
  /** Error category */
  type: 'api' | 'transform';
  /** Human-readable error description */
  message: string;
  /** Whether retry might succeed */
  recoverable: boolean;
}

/** Generic result type returned by orchestrators. */
export interface OrchestratorResult<T> {
  /** Normalized entity or null on total failure */
  data: T | null;
  /** Overall result status */
  completeness: CompletenessStatus;
  /** All errors encountered */
  errors: OrchestratorError[];
}

/** Base interface for domain orchestrators. */
export interface DomainOrchestrator<T> {
  /** Domain name for logging/debugging */
  readonly domain: string;
  /** Refresh data for the tenant and update store */
  refresh(): Promise<OrchestratorResult<T>>;
}

// =============================================================================
// Source Bags (Adapter Input Types)
// =============================================================================

/** Sources for balance normalization. */
export interface BalanceSources {
  /** Main balance endpoint response (required) */
  primary: unknown;
  /** Usage data for merge (platform-specific) */
  usage?: unknown;
  /** Credits data for merge (platform-specific) */
  credits?: unknown;
}

/** Sources for cost normalization. */
export interface CostSources {
  /** Cost records from API */
  costs: unknown[];
}

/** Sources for token normalization. */
export interface TokenSources {
  /** Token list from API */
  tokens: unknown[];
  /** Token group metadata */
  groups?: unknown;
}

/** Sources for tenant info normalization. */
export interface TenantInfoSources {
  /** Platform status endpoint response */
  status: unknown;
}

// =============================================================================
// Extended Normalized Types (with metadata)
// =============================================================================

/** Balance with optional metadata. */
export interface BalanceWithMeta extends Balance {
  _meta?: EntityMeta;
}

/** Cost array result with metadata. */
export interface CostsWithMeta {
  costs: Cost[];
  _meta?: EntityMeta;
}

/** Token data with metadata. */
export interface TokensWithMeta {
  tokens: Token[];
  groups: Record<string, TokenGroup>;
  _meta?: EntityMeta;
}

/** TenantInfo with metadata. */
export interface TenantInfoWithMeta extends TenantInfo {
  _meta?: EntityMeta;
}
```

## Service Interface (Updated)

```typescript
// lib/api/services/types.ts (updated)

import type { RawAPIResponse } from '@/lib/api/orchestrators/types';
import type { CostPeriod } from '@/lib/state/cost-store';

/**
 * Raw platform service interface.
 * Services ONLY fetch raw data - no transformation.
 */
export interface IRawPlatformService {
  /** Fetch raw balance data */
  fetchBalance(): Promise<RawAPIResponse>;

  /** Fetch raw cost data for a period */
  fetchCosts(period: CostPeriod): Promise<RawAPIResponse>;

  /** Fetch raw token list */
  fetchTokens(): Promise<RawAPIResponse>;

  /** Fetch raw token groups */
  fetchTokenGroups(): Promise<RawAPIResponse>;

  /** Fetch raw tenant/platform info */
  fetchTenantInfo(): Promise<RawAPIResponse>;
}
```

## Adapter Interface (Updated)

```typescript
// lib/api/adapters/types.ts (additions)

import type {
  BalanceSources,
  CostSources,
  TokenSources,
  TenantInfoSources
} from '@/lib/api/orchestrators/types';

/**
 * Updated platform adapter interface.
 * Adapters accept source bags for multi-API merge support.
 */
export interface PlatformAdapterV2 {
  readonly platformType: PlatformType;

  /** Transform balance sources into normalized Balance */
  normalizeBalance(sources: BalanceSources): Balance;

  /** Transform cost sources into normalized Cost array */
  normalizeCosts(sources: CostSources): Cost[];

  /** Transform token sources into normalized Token array */
  normalizeTokens(sources: TokenSources): Token[];

  /** Transform token sources into TokenGroup map */
  normalizeTokenGroups(sources: TokenSources): Record<string, TokenGroup>;

  /** Transform tenant info sources into TenantInfo */
  normalizeTenantInfo(sources: TenantInfoSources): TenantInfo;
}
```

## Error Types

```typescript
// lib/errors/transformation-error.ts

/** Error thrown when adapter transformation fails. */
export class TransformationError extends Error {
  readonly name = 'TransformationError';

  constructor(
    message: string,
    /** The raw data that failed to transform */
    public readonly rawData: unknown,
    /** Specific field that caused the error */
    public readonly field?: string
  ) {
    super(message);
  }
}

/** Error thrown when API call fails. */
export class APIError extends Error {
  readonly name = 'APIError';

  constructor(
    message: string,
    /** HTTP status code */
    public readonly status: number,
    /** Endpoint that failed */
    public readonly endpoint: string,
    /** Whether retry might succeed */
    public readonly recoverable: boolean
  ) {
    super(message);
  }
}
```

## Orchestrator Implementations

```typescript
// lib/api/orchestrators/balance-orchestrator.ts

import type { Tenant } from '@/types/tenant';
import type {
  DomainOrchestrator,
  OrchestratorResult,
  OrchestratorError,
  BalanceSources,
  BalanceWithMeta
} from './types';
import type { IRawPlatformService } from '@/lib/api/services/types';
import type { PlatformAdapterV2 } from '@/lib/api/adapters/types';
import { balanceStore } from '@/lib/state/balance-store';
import { TransformationError } from '@/lib/errors/transformation-error';

export class BalanceOrchestrator implements DomainOrchestrator<BalanceWithMeta> {
  readonly domain = 'balance';

  constructor(
    private readonly tenant: Tenant,
    private readonly service: IRawPlatformService,
    private readonly adapter: PlatformAdapterV2
  ) {}

  async refresh(): Promise<OrchestratorResult<BalanceWithMeta>> {
    const errors: OrchestratorError[] = [];
    const sources: string[] = [];
    let primaryData: unknown = null;

    // Fetch primary balance data
    try {
      const response = await this.service.fetchBalance();
      primaryData = response.data;
      sources.push('balance');
    } catch (error) {
      errors.push({
        source: 'balance',
        type: 'api',
        message: error instanceof Error ? error.message : 'Unknown error',
        recoverable: true
      });
    }

    // If no primary data, return failed
    if (primaryData === null) {
      return { data: null, completeness: 'failed', errors };
    }

    // Transform
    try {
      const balanceSources: BalanceSources = { primary: primaryData };
      const balance = this.adapter.normalizeBalance(balanceSources);

      const result: BalanceWithMeta = {
        ...balance,
        _meta: {
          completeness: errors.length === 0 ? 'full' : 'partial',
          errors: errors.map(e => e.message),
          fetchedAt: Date.now(),
          sources
        }
      };

      // Update store
      await balanceStore.setBalance(this.tenant.id, result);

      return {
        data: result,
        completeness: errors.length === 0 ? 'full' : 'partial',
        errors
      };
    } catch (error) {
      if (error instanceof TransformationError) {
        errors.push({
          source: 'balance-transform',
          type: 'transform',
          message: error.message,
          recoverable: false
        });
      }
      return { data: null, completeness: 'failed', errors };
    }
  }
}
```

## Usage Example

```typescript
// hooks/use-balance-refresh.ts (example usage)

import { BalanceOrchestrator } from '@/lib/api/orchestrators/balance-orchestrator';
import { getRawService } from '@/lib/api/services';
import { getAdapter } from '@/lib/api/adapters';

export function useBalanceRefresh(tenant: Tenant) {
  const refresh = async () => {
    const service = getRawService(tenant);
    const adapter = getAdapter(tenant.platformType);
    const orchestrator = new BalanceOrchestrator(tenant, service, adapter);

    const result = await orchestrator.refresh();

    if (result.completeness === 'failed') {
      // Handle total failure
      console.error('Balance refresh failed:', result.errors);
    } else if (result.completeness === 'partial') {
      // Handle partial data
      console.warn('Balance refresh partial:', result.errors);
    }

    return result;
  };

  return { refresh };
}
```
