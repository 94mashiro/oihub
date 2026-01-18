/**
 * Tenant Analytics Utilities
 *
 * Helper functions for analytics data formatting, period handling,
 * and data capping for performance.
 */

import { CostPeriod, COST_PERIOD_DAYS } from '@/types/api';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

/**
 * Get human-readable label for a cost period
 */
export function getPeriodLabel(period: CostPeriod): string {
  const labels: Record<CostPeriod, string> = {
    [CostPeriod.DAY_1]: 'Last 24 Hours',
    [CostPeriod.DAY_7]: 'Last 7 Days',
    [CostPeriod.DAY_14]: 'Last 14 Days',
    [CostPeriod.DAY_30]: 'Last 30 Days',
  };
  return labels[period];
}

/**
 * Get short label for a cost period (for UI components)
 */
export function getPeriodShortLabel(period: CostPeriod): string {
  const labels: Record<CostPeriod, string> = {
    [CostPeriod.DAY_1]: '24h',
    [CostPeriod.DAY_7]: '7d',
    [CostPeriod.DAY_14]: '14d',
    [CostPeriod.DAY_30]: '30d',
  };
  return labels[period];
}

/**
 * Calculate date range for analytics period
 * Returns [rangeStart, rangeEnd] as Unix seconds
 */
export function getPeriodRange(period: CostPeriod): [number, number] {
  const now = new Date();
  const days = COST_PERIOD_DAYS[period];

  // End: now (end of current day)
  const rangeEnd = Math.floor(endOfDay(now).getTime() / 1000);

  // Start: N days ago (start of that day)
  const startDate = subDays(now, days);
  const rangeStart = Math.floor(startOfDay(startDate).getTime() / 1000);

  return [rangeStart, rangeEnd];
}

/**
 * Format date range for display
 */
export function formatDateRange(rangeStart: number, rangeEnd: number): string {
  const start = new Date(rangeStart * 1000);
  const end = new Date(rangeEnd * 1000);

  const startStr = format(start, 'MMM d');
  const endStr = format(end, 'MMM d, yyyy');

  return `${startStr} - ${endStr}`;
}

/**
 * Format timestamp for chart axis labels
 */
export function formatChartTimestamp(timestamp: number, period: CostPeriod): string {
  const date = new Date(timestamp * 1000);

  // For 1-day period, show hour labels
  if (period === CostPeriod.DAY_1) {
    return format(date, 'HH:mm');
  }

  // For 7-day period, show short day labels
  if (period === CostPeriod.DAY_7) {
    return format(date, 'EEE');
  }

  // For longer periods, show date labels
  return format(date, 'MMM d');
}

/**
 * Maximum data points to render in charts (performance cap)
 */
export const MAX_CHART_POINTS = 1000;

/**
 * Cap data points array to maximum length
 * Takes evenly distributed samples if exceeding limit
 */
export function capDataPoints<T>(points: T[], maxPoints: number = MAX_CHART_POINTS): T[] {
  if (points.length <= maxPoints) {
    return points;
  }

  // Calculate sampling interval
  const interval = points.length / maxPoints;

  // Sample evenly distributed points
  const sampled: T[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const index = Math.floor(i * interval);
    sampled.push(points[index]);
  }

  return sampled;
}

/**
 * Format credit cost for display with proper unit
 */
export function formatCreditCost(
  cost: number,
  quotaPerUnit?: number,
  displayType?: string,
): string {
  if (!quotaPerUnit || quotaPerUnit === 0) {
    // Fallback: show raw cost
    return cost.toFixed(2);
  }

  // Convert quota to display units (e.g., dollars)
  const displayValue = cost / quotaPerUnit;

  // Format based on display type
  if (displayType === 'usd' || displayType === 'dollar') {
    return `$${displayValue.toFixed(2)}`;
  }

  // Default: show value with 2 decimals
  return displayValue.toFixed(2);
}

/**
 * Format large numbers in compact form (e.g., 1.2K, 3.4M)
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

/**
 * Format percentage share (0..1 to percentage string)
 */
export function formatPercentage(share: number): string {
  return `${(share * 100).toFixed(1)}%`;
}

/**
 * Get the interval in seconds for a cost period's time series
 * DAY_1: 1 hour intervals
 * Longer periods: 1 day intervals
 */
export function getIntervalSeconds(period: CostPeriod): number {
  if (period === CostPeriod.DAY_1) {
    return 60 * 60; // 1 hour
  }
  return 60 * 60 * 24; // 1 day
}
