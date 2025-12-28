// NOTE: Response Aggregates are now imported from platform types
// These replace the generic unknown types previously used for adapter sources
export type {
  BalanceSources,
  CostSources,
  TokenSources,
  TenantInfoSources,
} from '@/lib/api/types/platforms';

// =============================================================================
// Raw API Response
// =============================================================================

/** Wrapper for unprocessed API responses from services. */
export interface RawAPIResponse<T = unknown> {
  /** Raw response body */
  data: T;
  /** HTTP status code */
  status: number;
  /** Response headers if needed */
  headers?: Record<string, string>;
}

// =============================================================================
// Orchestrator Types
// =============================================================================

/** Base interface for domain orchestrators. */
export interface DomainOrchestrator<T> {
  /** Domain name for logging/debugging */
  readonly domain: string;
  /** Refresh data for the tenant and update store. Throws on error. */
  refresh(): Promise<T>;
}

// NOTE: Source Bags (BalanceSources, CostSources, TokenSources, TenantInfoSources)
// are now defined in @/lib/api/types/platforms/response-aggregates.ts with platform-specific types.
// They are re-exported at the top of this file.
