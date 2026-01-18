/**
 * Analytics Orchestrator Barrel
 *
 * Factory function and exports for tenant analytics orchestrator.
 */

import type { Tenant } from '@/types/tenant';
import { TenantAnalyticsOrchestrator } from './tenant-analytics-orchestrator';

/**
 * Create a tenant analytics orchestrator instance.
 * Provides fetch-normalize-store flow for analytics data.
 *
 * @param tenant - Tenant to fetch analytics for
 * @returns TenantAnalyticsOrchestrator instance
 *
 * @example
 * ```typescript
 * const orchestrator = createTenantAnalyticsOrchestrator(tenant);
 * await orchestrator.refresh(CostPeriod.DAY_7); // Fetch and update store
 * orchestrator.clear(); // Clear analytics data
 * ```
 */
export function createTenantAnalyticsOrchestrator(
  tenant: Tenant,
): TenantAnalyticsOrchestrator {
  return new TenantAnalyticsOrchestrator(tenant);
}

// Re-export orchestrator class
export { TenantAnalyticsOrchestrator } from './tenant-analytics-orchestrator';

// Re-export normalizers for testing
export * from './tenant-analytics-normalizers';
