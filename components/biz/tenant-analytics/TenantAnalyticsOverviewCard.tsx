/**
 * Tenant Analytics Overview Card
 *
 * Display overview area chart showing usage trends over time.
 * Uses Recharts with semantic colors and optimized animations.
 */

import { memo, useMemo, useCallback } from 'react';
import type { NewAPIUsagePoint, NewAPIUsageSummary } from '@/types/tenant-analytics';
import { ChartContainer } from './ChartContainer';
import { ChartTooltip } from './ChartTooltip';
import { formatChartTimestamp, formatCompactNumber } from '@/lib/utils/tenant-analytics-utils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export interface TenantAnalyticsOverviewCardProps {
  /** Time-series data points */
  series: NewAPIUsagePoint[];

  /** Summary metrics for period context */
  summary: NewAPIUsageSummary;
}

// Chart colors - defined outside component to avoid recreating on each render
const CHART_COLORS = {
  primary: '#a1a1aa', // zinc-400 (fill and stroke same color)
  muted: '#71717a', // zinc-500
} as const;

/**
 * Overview chart card component.
 * Displays usage trends as an area chart with semantic styling.
 * Optimized animations for smooth data transitions.
 */
export const TenantAnalyticsOverviewCard = memo(
  function TenantAnalyticsOverviewCard({ series, summary }: TenantAnalyticsOverviewCardProps) {
    // Format chart data for Recharts
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

    // Calculate average request count for reference line (excluding zero values)
    const averageRequests = useMemo(() => {
      const nonZeroData = chartData.filter((point) => point.requests > 0);
      if (nonZeroData.length === 0) return 0;
      const sum = nonZeroData.reduce((acc, point) => acc + point.requests, 0);
      return Math.round(sum / nonZeroData.length);
    }, [chartData]);

    // Format tooltip label (timestamp) - memoized callback
    const formatTooltipLabel = useCallback(
      (label: string | number) => {
        const timestamp = typeof label === 'number' ? label : Number(label);
        return formatChartTimestamp(timestamp, summary.period);
      },
      [summary.period],
    );

    // Format tooltip values - memoized callback
    const formatTooltipValue = useCallback((value: number, name?: string) => {
      if (name === 'requests') return `${formatCompactNumber(value)} requests`;
      if (name === 'cost') return `${value.toFixed(2)} credits`;
      if (name === 'tokens') return `${formatCompactNumber(value)} tokens`;
      return formatCompactNumber(value);
    }, []);

    // Memoize tooltip content to prevent recreation
    const tooltipContent = useMemo(
      () => (
        <ChartTooltip labelFormatter={formatTooltipLabel} valueFormatter={formatTooltipValue} />
      ),
      [formatTooltipLabel, formatTooltipValue],
    );

    return (
      <ChartContainer title="Usage Overview" description="Request volume over time">
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
            {/* Gradient definitions for area fill - large opacity span */}
            <defs>
              <linearGradient id="overviewGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.5} />
                <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0.05} />
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

            {/* Average reference line */}
            <ReferenceLine
              y={averageRequests}
              stroke={CHART_COLORS.muted}
              strokeWidth={1.5}
              strokeDasharray="8 4"
              label={{
                value: `Avg: ${formatCompactNumber(averageRequests)}`,
                position: 'insideTopRight',
                fontSize: 10,
                fill: CHART_COLORS.muted,
              }}
            />

            {/* Area - request count with gradient fill */}
            <Area
              type="monotone"
              dataKey="requests"
              name="Requests"
              stroke={CHART_COLORS.primary}
              fill="url(#overviewGradient)"
              fillOpacity={1}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
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
