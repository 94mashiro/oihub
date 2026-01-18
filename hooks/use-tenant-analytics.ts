/**
 * Tenant Analytics Hook
 *
 * React hook for consuming analytics data in screens.
 * Provides loading states, data access, and orchestrator control.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import type { Tenant } from '@/types/tenant';
import type { CostPeriod } from '@/types/api';
import { tenantAnalyticsStore } from '@/lib/state/tenant-analytics-store';
import { analyticsPreferencesStore } from '@/lib/state/analytics-preferences-store';
import { createTenantAnalyticsOrchestrator } from '@/lib/api/orchestrators/analytics';

/**
 * Hook for tenant analytics data and orchestrator control.
 *
 * Features:
 * - Auto-fetch on mount with tenant and period
 * - Exposes loading/error/ready states
 * - Provides summary, series, models, endpoints data
 * - Manual refresh capability
 * - Period change handling
 *
 * @param tenant - Tenant to fetch analytics for
 * @param initialPeriod - Initial period (defaults to user preference)
 * @returns Analytics data, states, and control functions
 *
 * @example
 * ```typescript
 * const analytics = useTenantAnalytics(tenant);
 *
 * if (analytics.status === 'loading') return <Loader />;
 * if (analytics.status === 'error') return <Error message={analytics.error} />;
 *
 * return (
 *   <div>
 *     <TenantAnalyticsSummaryCards summary={analytics.summary} />
 *     <TenantAnalyticsOverviewCard series={analytics.series} />
 *   </div>
 * );
 * ```
 */
export function useTenantAnalytics(tenant: Tenant, initialPeriod?: CostPeriod) {
  // Subscribe to analytics store
  const analyticsState = useStore(tenantAnalyticsStore);

  // Subscribe to preferences store for default period
  const preferences = useStore(analyticsPreferencesStore);

  // Determine current period (prioritize store period to ensure reactivity on period changes)
  const currentPeriod = analyticsState.period || initialPeriod || preferences.defaultPeriod;

  // Track if initial fetch has completed
  const hasFetchedRef = useRef(false);

  // Create orchestrator instance (memoized)
  const orchestrator = useMemo(
    () => createTenantAnalyticsOrchestrator(tenant, currentPeriod),
    [tenant, currentPeriod],
  );

  // Auto-fetch on mount or when tenant/period changes
  useEffect(() => {
    // Clear cache when tenant changes
    if (analyticsState.tenantId && analyticsState.tenantId !== tenant.id) {
      tenantAnalyticsStore.getState().clearCache();
    }

    // Skip if already fetching/fetched for this tenant+period
    const needsRefresh =
      !hasFetchedRef.current ||
      analyticsState.tenantId !== tenant.id ||
      analyticsState.period !== currentPeriod;

    if (!needsRefresh) {
      return;
    }

    // Fetch analytics data
    void orchestrator.refresh();
    hasFetchedRef.current = true;

    // Cleanup: clear analytics data when unmounting
    return () => {
      orchestrator.clear();
    };
  }, [tenant.id, currentPeriod, orchestrator]);

  // Expose refresh function for manual refresh
  const refresh = async () => {
    await orchestrator.refresh();
  };

  // Expose period change function
  const changePeriod = async (newPeriod: CostPeriod) => {
    await analyticsState.setPeriod(newPeriod);
    // Reset ref to ensure useEffect triggers on next render
    hasFetchedRef.current = false;
  };

  return {
    // State flags
    status: analyticsState.status,
    ready: analyticsState.ready,
    error: analyticsState.error,
    lastUpdatedAt: analyticsState.lastUpdatedAt,
    isRefreshing: analyticsState.isRefreshing,

    // Current context
    tenantId: analyticsState.tenantId,
    period: analyticsState.period,

    // Analytics data
    summary: analyticsState.summary,
    series: analyticsState.series,
    models: analyticsState.models,
    endpoints: analyticsState.endpoints,
    balance: analyticsState.balance,
    costs: analyticsState.costs,

    // Control functions
    refresh,
    changePeriod,

    // Preferences
    defaultPeriod: preferences.defaultPeriod,
    defaultBreakdownType: preferences.defaultBreakdownType,
  };
}
