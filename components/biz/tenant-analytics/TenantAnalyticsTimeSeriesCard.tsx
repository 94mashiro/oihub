/**
 * Tenant Analytics Time-Series Card
 *
 * Interactive time-series chart showing detailed usage trends.
 * Displays requests, cost, and tokens over time with hover tooltips.
 */

import { memo, useMemo, useCallback } from 'react';
import type { NewAPIUsagePoint, NewAPIUsageSummary } from '@/types/tenant-analytics';
import { ChartContainer } from './ChartContainer';
import { ChartTooltip } from './ChartTooltip';
import {
  formatChartTimestamp,
  formatCompactNumber,
  formatCreditCost,
} from '@/lib/utils/tenant-analytics-utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';

export interface TenantAnalyticsTimeSeriesCardProps {
  /** Time-series data points */
  series: NewAPIUsagePoint[];

  /** Summary metrics for context */
  summary: NewAPIUsageSummary;
}

// Chart colors - defined outside component to avoid recreating on each render
const CHART_COLORS = {
  requests: '#d4d4d8', // zinc-300 (lightest)
  cost: '#a1a1aa', // zinc-400 (medium)
  tokens: '#71717a', // zinc-500 (darkest)
  muted: '#71717a', // zinc-500
} as const;

/**
 * Time-series chart card component.
 * Displays multi-metric line chart with interactive tooltips.
 * Memoized data transformation for performance.
 */
export const TenantAnalyticsTimeSeriesCard = memo(
  function TenantAnalyticsTimeSeriesCard({
    series,
    summary,
  }: TenantAnalyticsTimeSeriesCardProps) {
    // Format chart data for Recharts (memoized)
    const chartData = useMemo(
      () =>
        series.map((point) => ({
          timestamp: point.timestamp,
          requests: point.requestCount,
          cost: point.cost,
          tokens: point.tokens,
        })),
      [series],
    );

    // Format tooltip label (timestamp) - memoized callback
    const formatTooltipLabel = useCallback(
      (label: string | number) => {
        const timestamp = typeof label === 'number' ? label : Number(label);
        return formatChartTimestamp(timestamp, summary.period);
      },
      [summary.period],
    );

    // Format tooltip values with appropriate units - memoized callback
    const formatTooltipValue = useCallback(
      (value: number, name?: string) => {
        if (name === 'Requests') return `${formatCompactNumber(value)}`;
        if (name === 'Cost') return formatCreditCost(value, summary.quotaPerUnit, summary.displayType);
        if (name === 'Tokens') return formatCompactNumber(value);
        return formatCompactNumber(value);
      },
      [summary.quotaPerUnit, summary.displayType],
    );

    // Memoize tooltip content to prevent recreation
    const tooltipContent = useMemo(
      () => (
        <ChartTooltip labelFormatter={formatTooltipLabel} valueFormatter={formatTooltipValue} />
      ),
      [formatTooltipLabel, formatTooltipValue],
    );

    return (
      <ChartContainer
        title="Usage Trends"
        description="Detailed metrics over time (requests, cost, tokens)"
      >
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
            {/* Gradient definitions for each metric - large opacity span */}
            <defs>
              <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.requests} stopOpacity={0.5} />
                <stop offset="100%" stopColor={CHART_COLORS.requests} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.cost} stopOpacity={0.5} />
                <stop offset="100%" stopColor={CHART_COLORS.cost} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="tokensGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.tokens} stopOpacity={0.5} />
                <stop offset="100%" stopColor={CHART_COLORS.tokens} stopOpacity={0.05} />
              </linearGradient>
            </defs>

            {/* Grid with semantic border color */}
            <CartesianGrid strokeDasharray="2 2" stroke={CHART_COLORS.muted} opacity={0.2} />

            {/* X Axis - timestamp */}
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => formatChartTimestamp(value, summary.period)}
              stroke={CHART_COLORS.muted}
              tick={{ fontSize: 10 }}
              tickLine={false}
            />

            {/* Tooltip with memoized content */}
            <Tooltip content={tooltipContent} />

            {/* Areas for each metric with gradient fills - animations start simultaneously */}
            <Area
              type="monotone"
              dataKey="requests"
              name="Requests"
              stroke={CHART_COLORS.requests}
              fill="url(#requestsGradient)"
              fillOpacity={1}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              isAnimationActive={true}
              animationDuration={250}
              animationBegin={0}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="cost"
              name="Cost"
              stroke={CHART_COLORS.cost}
              fill="url(#costGradient)"
              fillOpacity={1}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              isAnimationActive={true}
              animationDuration={250}
              animationBegin={0}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="tokens"
              name="Tokens"
              stroke={CHART_COLORS.tokens}
              fill="url(#tokensGradient)"
              fillOpacity={1}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              isAnimationActive={true}
              animationDuration={250}
              animationBegin={0}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  },
  (prev, next) => prev.series === next.series && prev.summary === next.summary,
);
