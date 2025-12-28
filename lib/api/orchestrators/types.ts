import type { Balance, Cost, Token, TokenGroup } from '@/lib/api/adapters/types';
import type { TenantInfo } from '@/types/tenant';

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

// NOTE: Source Bags (BalanceSources, CostSources, TokenSources, TenantInfoSources)
// are now defined in @/lib/api/types/platforms/response-aggregates.ts with platform-specific types.
// They are re-exported at the top of this file.

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
