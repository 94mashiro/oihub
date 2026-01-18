/**
 * Tenant Analytics Hook
 *
 * React hook for consuming analytics data in screens.
 * Provides loading states, data access, and orchestrator control.
 */

import { useEffect, useMemo, useRef, useCallback } from 'react';
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

  // Track tenant changes for cleanup
  const prevTenantIdRef = useRef<string | null>(null);

  // Stable orchestrator ref - recreated only when tenant.id changes
  const orchestratorRef = useRef<ReturnType<typeof createTenantAnalyticsOrchestrator> | null>(null);

  // Create orchestrator (only recreate when tenant.id changes)
  // Using useMemo to ensure synchronous creation before first useEffect
  useMemo(() => {
    orchestratorRef.current = createTenantAnalyticsOrchestrator(tenant);
  }, [tenant.id]);

  // Auto-fetch on mount or when tenant/period changes
  // Simplified dependencies: only tenant.id and currentPeriod trigger refetch
  useEffect(() => {
    const tenantChanged = prevTenantIdRef.current !== null && prevTenantIdRef.current !== tenant.id;
    prevTenantIdRef.current = tenant.id;

    // Clear cache only when tenant changes (not period changes)
    if (tenantChanged) {
      tenantAnalyticsStore.getState().clearCache();
      hasFetchedRef.current = false;
    }

    // Get current store state for comparison (avoid stale closure)
    const currentState = tenantAnalyticsStore.getState();

    // Skip if already fetched for this exact tenant+period combination
    const needsRefresh =
      !hasFetchedRef.current ||
      currentState.tenantId !== tenant.id ||
      currentState.period !== currentPeriod;

    if (!needsRefresh) {
      return;
    }

    // Update store context before fetching
    void currentState.setTenantId(tenant.id);
    void currentState.setPeriod(currentPeriod);

    // Fetch analytics data using ref to avoid dependency on orchestrator object
    if (orchestratorRef.current) {
      void orchestratorRef.current.refresh(currentPeriod);
    }
    hasFetchedRef.current = true;
  }, [tenant.id, currentPeriod]);

  // Expose refresh function for manual refresh - memoized
  const refresh = useCallback(async () => {
    if (orchestratorRef.current) {
      await orchestratorRef.current.refresh(currentPeriod);
    }
  }, [currentPeriod]);

  // Expose period change function - memoized
  const changePeriod = useCallback(async (newPeriod: CostPeriod) => {
    // Reset ref BEFORE updating state to ensure useEffect triggers on next render
    hasFetchedRef.current = false;
    await tenantAnalyticsStore.getState().setPeriod(newPeriod);
  }, []);

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
