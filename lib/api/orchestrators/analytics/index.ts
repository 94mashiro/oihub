/**
 * Analytics Orchestrator Barrel
 *
 * Factory function and exports for tenant analytics orchestrator.
 */

import type { Tenant } from '@/types/tenant';
import type { CostPeriod } from '@/types/api';
import { TenantAnalyticsOrchestrator } from './tenant-analytics-orchestrator';

/**
 * Create a tenant analytics orchestrator instance.
 * Provides fetch-normalize-store flow for analytics data.
 *
 * @param tenant - Tenant to fetch analytics for
 * @param period - Analytics time period
 * @returns TenantAnalyticsOrchestrator instance
 *
 * @example
 * ```typescript
 * const orchestrator = createTenantAnalyticsOrchestrator(tenant, CostPeriod.DAY_7);
 * await orchestrator.refresh(); // Fetch and update store
 * orchestrator.clear(); // Clear analytics data
 * ```
 */
export function createTenantAnalyticsOrchestrator(
  tenant: Tenant,
  period: CostPeriod,
): TenantAnalyticsOrchestrator {
  return new TenantAnalyticsOrchestrator(tenant, period);
}

// Re-export orchestrator class
export { TenantAnalyticsOrchestrator } from './tenant-analytics-orchestrator';

// Re-export normalizers for testing
export * from './tenant-analytics-normalizers';
