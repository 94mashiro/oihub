/**
 * Tenant Analytics Data Model
 *
 * Type definitions for NewAPI analytics dashboard.
 * These types derive from raw NewAPI responses and provide
 * view models for summary metrics, time-series charts, and breakdowns.
 */

import type { TenantId } from './tenant';
import type { CostPeriod } from './api';
import type { NewAPIBalanceResponse, NewAPICostData } from '@/lib/api/types/platforms/newapi-response-types';

/**
 * Aggregate summary metrics for a tenant and period
 */
export interface NewAPIUsageSummary {
  /** Tenant identifier */
  tenantId: TenantId;

  /** Selected analytics period */
  period: CostPeriod;

  /** Start of analytics range (Unix seconds) */
  rangeStart: number;

  /** End of analytics range (Unix seconds) */
  rangeEnd: number;

  /** Total API requests in period */
  totalRequests: number;

  /** Total credit cost in period */
  totalCost: number;

  /** Total tokens consumed in period */
  totalTokens: number;

  /** Credits per unit (from tenant info) */
  quotaPerUnit?: number;

  /** Display format type (from tenant info) */
  displayType?: string;
}

/**
 * Time-series data point for charting usage trends
 */
export interface NewAPIUsagePoint {
  /** Timestamp for this data point (Unix seconds) */
  timestamp: number;

  /** Number of API requests at this timestamp */
  requestCount: number;

  /** Credit cost at this timestamp */
  cost: number;

  /** Tokens consumed at this timestamp */
  tokens: number;
}

/**
 * Usage breakdown by model for optimization insights
 */
export interface NewAPIModelUsage {
  /** AI model identifier */
  modelName: string;

  /** Number of requests for this model */
  requestCount: number;

  /** Total credit cost for this model */
  cost: number;

  /** Total tokens consumed by this model */
  tokens: number;

  /** Share of total cost (0..1) */
  share: number;
}

/**
 * Usage breakdown by endpoint for optimization insights
 */
export interface NewAPIEndpointUsage {
  /** API endpoint path */
  endpoint: string;

  /** Number of requests to this endpoint */
  requestCount: number;

  /** Total credit cost for this endpoint */
  cost: number;

  /** Total tokens consumed by this endpoint */
  tokens: number;

  /** Share of total cost (0..1) */
  share: number;
}

/**
 * Breakdown type selector
 */
export type BreakdownType = 'model' | 'endpoint';

/**
 * Analytics data loading status
 */
export type AnalyticsStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Complete analytics view state for a tenant
 */
export interface NewAPIAnalyticsViewState {
  /** Current loading/error status */
  status: AnalyticsStatus;

  /** Error message if status is 'error' */
  error?: string;

  /** Raw balance response from API */
  balance?: NewAPIBalanceResponse;

  /** Raw cost data array from API */
  costs?: NewAPICostData[];

  /** Derived summary metrics */
  summary?: NewAPIUsageSummary;

  /** Derived time-series data points (sorted by timestamp ascending) */
  series?: NewAPIUsagePoint[];

  /** Derived model breakdown (sorted by cost descending) */
  models?: NewAPIModelUsage[];

  /** Derived endpoint breakdown (sorted by cost descending) */
  endpoints?: NewAPIEndpointUsage[];

  /** Last update timestamp (Unix milliseconds) */
  lastUpdatedAt?: number;
}

/**
 * Analytics preferences (persistent user settings)
 */
export interface AnalyticsPreferences {
  /** Default period for analytics view */
  defaultPeriod: CostPeriod;

  /** Default breakdown type */
  defaultBreakdownType: BreakdownType;
}

/**
 * Cached analytics data for a specific period
 */
export interface CachedPeriodData {
  /** Timestamp when data was cached (Unix milliseconds) */
  cachedAt: number;

  /** Raw balance response from API */
  balance?: NewAPIBalanceResponse;

  /** Raw cost data array from API */
  costs?: NewAPICostData[];

  /** Derived summary metrics */
  summary?: NewAPIUsageSummary;

  /** Derived time-series data points */
  series?: NewAPIUsagePoint[];

  /** Derived model breakdown */
  models?: NewAPIModelUsage[];

  /** Derived endpoint breakdown */
  endpoints?: NewAPIEndpointUsage[];
}

/**
 * Runtime cache map for analytics data by period
 */
export type AnalyticsCacheMap = Partial<Record<CostPeriod, CachedPeriodData>>;
