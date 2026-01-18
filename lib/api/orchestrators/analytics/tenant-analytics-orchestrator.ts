/**
 * Tenant Analytics Orchestrator
 *
 * Fetch-normalize-store flow for NewAPI analytics data.
 * Fetches balance and costs, normalizes into view models, updates store.
 */

import type { Tenant } from '@/types/tenant';
import type { CostPeriod } from '@/types/api';
import { NewAPIRawService } from '@/lib/api/services/newapi-service';
import { tenantAnalyticsStore } from '@/lib/state/tenant-analytics-store';
import {
  normalizeSummary,
  normalizeSeries,
  normalizeModelBreakdown,
  normalizeEndpointBreakdown,
  createEmptyAnalyticsBaseline,
} from './tenant-analytics-normalizers';

/**
 * Analytics orchestrator for NewAPI tenants.
 * Coordinates data fetching, normalization, and store updates.
 */
export class TenantAnalyticsOrchestrator {
  constructor(private readonly tenant: Tenant) {}

  /**
   * Fetch analytics data for tenant and period, normalize, and update store.
   * Uses SWR pattern: shows cached data immediately, fetches fresh data in background.
   *
   * @param period - The cost period to fetch data for
   */
  async refresh(period: CostPeriod): Promise<void> {
    const store = tenantAnalyticsStore.getState();

    // Check if we have cached data for this period
    const cachedData = store.getCachedData(period);

    if (cachedData) {
      // Load from cache immediately - NO loading state shown
      store.setAnalyticsData({
        balance: cachedData.balance,
        costs: cachedData.costs,
        summary: cachedData.summary,
        series: cachedData.series,
        models: cachedData.models,
        endpoints: cachedData.endpoints,
      });
      store.setRefreshing(true); // Background fetch in progress
    } else {
      // No cache: show loading state
      store.setStatus('loading');
    }

    try {
      // Fetch raw data from NewAPI
      const service = new NewAPIRawService(this.tenant);
      const [balance, costs, tenantInfo] = await Promise.all([
        service.fetchBalance(),
        service.fetchCosts(period),
        service.fetchTenantInfo().catch(() => undefined), // Optional, don't fail if missing
      ]);

      // Normalize into view models
      const summary = normalizeSummary(this.tenant.id, period, balance, costs, tenantInfo);
      const series = normalizeSeries(costs, period);
      const models = normalizeModelBreakdown(costs);
      const endpoints = normalizeEndpointBreakdown(costs);

      // Update cache
      store.setCachedData(period, {
        cachedAt: Date.now(),
        balance,
        costs,
        summary,
        series,
        models,
        endpoints,
      });

      // Update store with normalized data
      store.setAnalyticsData({
        balance,
        costs,
        summary,
        series,
        models,
        endpoints,
      });
      store.setRefreshing(false);
    } catch (error) {
      // Set error status with message
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch analytics data';
      store.setStatus('error', errorMessage);
      store.setRefreshing(false);

      // Set empty baseline to avoid undefined data
      const baseline = createEmptyAnalyticsBaseline(this.tenant.id, period);
      store.setAnalyticsData({
        summary: baseline.summary,
        series: baseline.series,
        models: baseline.models,
        endpoints: baseline.endpoints,
      });
    }
  }

  /**
   * Clear analytics data and cache from store.
   * Useful when switching tenants or navigating away from analytics screen.
   */
  clear(): void {
    const store = tenantAnalyticsStore.getState();
    store.clearAnalyticsData();
    store.clearCache();
  }
}
