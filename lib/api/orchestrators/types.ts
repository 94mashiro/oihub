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
