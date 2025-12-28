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
