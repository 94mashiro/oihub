/**
 * Tenant Analytics Normalizers
 *
 * Transform raw NewAPI responses into analytics view models
 * (summary metrics, time-series points, model/endpoint breakdowns)
 */

import type { TenantId } from '@/types/tenant';
import type { CostPeriod } from '@/types/api';
import type {
  NewAPIUsageSummary,
  NewAPIUsagePoint,
  NewAPIModelUsage,
  NewAPIEndpointUsage,
} from '@/types/tenant-analytics';
import type {
  NewAPIBalanceResponse,
  NewAPICostData,
  NewAPITenantInfoResponse,
} from '@/lib/api/types/platforms/newapi-response-types';
import {
  getPeriodRange,
  capDataPoints,
  getIntervalSeconds,
} from '@/lib/utils/tenant-analytics-utils';

/**
 * Normalize raw balance and costs into summary metrics
 */
export function normalizeSummary(
  tenantId: TenantId,
  period: CostPeriod,
  balance: NewAPIBalanceResponse,
  costs: NewAPICostData[],
  tenantInfo?: NewAPITenantInfoResponse,
): NewAPIUsageSummary {
  const [rangeStart, rangeEnd] = getPeriodRange(period);

  // Aggregate totals from costs array
  const totals = costs.reduce(
    (acc, cost) => ({
      requests: acc.requests + (cost.count || 0),
      cost: acc.cost + (cost.quota || 0),
      tokens: acc.tokens + (cost.token_used || 0),
    }),
    { requests: 0, cost: 0, tokens: 0 },
  );

  return {
    tenantId,
    period,
    rangeStart,
    rangeEnd,
    totalRequests: totals.requests,
    totalCost: totals.cost,
    totalTokens: totals.tokens,
    quotaPerUnit: tenantInfo?.quota_per_unit,
    displayType: tenantInfo?.quota_display_type,
  };
}

/**
 * Normalize raw costs into time-series points
 * Groups by timestamp and fills gaps with zero-value points
 * Only fills gaps between the first and last data point (not the entire period)
 */
export function normalizeSeries(costs: NewAPICostData[], period: CostPeriod): NewAPIUsagePoint[] {
  if (costs.length === 0) {
    return [];
  }

  const interval = getIntervalSeconds(period);

  // Group costs by timestamp
  const grouped = new Map<number, NewAPIUsagePoint>();

  for (const cost of costs) {
    // Round timestamp to interval boundary for consistent grouping
    const rawTimestamp = cost.created_at;
    const timestamp = Math.floor(rawTimestamp / interval) * interval;
    const existing = grouped.get(timestamp);

    if (existing) {
      // Aggregate into existing point
      existing.requestCount += cost.count || 0;
      existing.cost += cost.quota || 0;
      existing.tokens += cost.token_used || 0;
    } else {
      // Create new point
      grouped.set(timestamp, {
        timestamp,
        requestCount: cost.count || 0,
        cost: cost.quota || 0,
        tokens: cost.token_used || 0,
      });
    }
  }

  // Find the actual data range (first to last data point)
  const timestamps = Array.from(grouped.keys()).sort((a, b) => a - b);
  const dataStart = timestamps[0];
  const dataEnd = timestamps[timestamps.length - 1];

  // Generate continuous timeline only between first and last data point
  const series: NewAPIUsagePoint[] = [];

  for (let ts = dataStart; ts <= dataEnd; ts += interval) {
    const existing = grouped.get(ts);
    if (existing) {
      series.push(existing);
    } else {
      // Fill gap with zero-value point
      series.push({
        timestamp: ts,
        requestCount: 0,
        cost: 0,
        tokens: 0,
      });
    }
  }

  // Cap to max chart points for performance
  return capDataPoints(series);
}

/**
 * Normalize raw costs into model breakdown
 * Groups by model_name and calculates share
 */
export function normalizeModelBreakdown(costs: NewAPICostData[]): NewAPIModelUsage[] {
  // Group costs by model_name
  const grouped = new Map<string, NewAPIModelUsage>();

  for (const cost of costs) {
    const modelName = cost.model_name || 'unknown';
    const existing = grouped.get(modelName);

    if (existing) {
      // Aggregate into existing model
      existing.requestCount += cost.count || 0;
      existing.cost += cost.quota || 0;
      existing.tokens += cost.token_used || 0;
    } else {
      // Create new model entry
      grouped.set(modelName, {
        modelName,
        requestCount: cost.count || 0,
        cost: cost.quota || 0,
        tokens: cost.token_used || 0,
        share: 0, // Will calculate after aggregation
      });
    }
  }

  // Convert to array
  const models = Array.from(grouped.values());

  // Calculate total cost for share calculation
  const totalCost = models.reduce((sum, model) => sum + model.cost, 0);

  // Calculate share for each model
  if (totalCost > 0) {
    for (const model of models) {
      model.share = model.cost / totalCost;
    }
  }

  // Sort by cost descending and return
  return models.sort((a, b) => b.cost - a.cost);
}

/**
 * Normalize raw costs into endpoint breakdown
 * Note: NewAPI doesn't provide endpoint data in costs response,
 * so this returns an empty array as a placeholder for future implementation
 */
export function normalizeEndpointBreakdown(_costs: NewAPICostData[]): NewAPIEndpointUsage[] {
  // TODO: NewAPI doesn't provide endpoint-level breakdown in current API
  // This is a placeholder for future implementation
  return [];
}

/**
 * Create empty baseline analytics data for a tenant
 * Used when no data is available or during loading states
 */
export function createEmptyAnalyticsBaseline(
  tenantId: TenantId,
  period: CostPeriod,
): {
  summary: NewAPIUsageSummary;
  series: NewAPIUsagePoint[];
  models: NewAPIModelUsage[];
  endpoints: NewAPIEndpointUsage[];
} {
  const [rangeStart, rangeEnd] = getPeriodRange(period);

  return {
    summary: {
      tenantId,
      period,
      rangeStart,
      rangeEnd,
      totalRequests: 0,
      totalCost: 0,
      totalTokens: 0,
    },
    series: [],
    models: [],
    endpoints: [],
  };
}
