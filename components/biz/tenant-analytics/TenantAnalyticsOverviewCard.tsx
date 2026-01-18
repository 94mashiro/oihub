/**
 * Tenant Analytics Overview Card
 *
 * Display overview area chart showing usage trends over time.
 * Uses Recharts with semantic colors and no animations.
 */

import { useMemo } from 'react';
import type { NewAPIUsagePoint, NewAPIUsageSummary } from '@/types/tenant-analytics';
import { ChartContainer } from './ChartContainer';
import { ChartTooltip } from './ChartTooltip';
import { formatChartTimestamp, formatCompactNumber } from '@/lib/utils/tenant-analytics-utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export interface TenantAnalyticsOverviewCardProps {
  /** Time-series data points */
  series: NewAPIUsagePoint[];

  /** Summary metrics for period context */
  summary: NewAPIUsageSummary;
}

/**
 * Overview chart card component.
 * Displays usage trends as an area chart with semantic styling.
 * No animations for performance on large datasets.
 */
export function TenantAnalyticsOverviewCard({
  series,
  summary,
}: TenantAnalyticsOverviewCardProps) {
  // Get chart colors from CSS variables
  const chartColors = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        primary: 'hsl(var(--primary))',
        primaryForeground: 'hsl(var(--primary-foreground))',
        muted: 'hsl(var(--muted-foreground))',
      };
    }

    const styles = getComputedStyle(document.documentElement);
    return {
      primary: `hsl(${styles.getPropertyValue('--primary')})`,
      primaryForeground: `hsl(${styles.getPropertyValue('--primary-foreground')})`,
      muted: `hsl(${styles.getPropertyValue('--muted-foreground')})`,
    };
  }, []);

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

  // Format tooltip label (timestamp)
  const formatTooltipLabel = (label: string | number) => {
    const timestamp = typeof label === 'number' ? label : Number(label);
    return formatChartTimestamp(timestamp, summary.period);
  };

  // Format Y-axis labels with compact numbers
  const formatYAxis = (value: number) => {
    return formatCompactNumber(value);
  };

  // Format tooltip values
  const formatTooltipValue = (value: number, name?: string) => {
    if (name === 'requests') return `${formatCompactNumber(value)} requests`;
    if (name === 'cost') return `${value.toFixed(2)} credits`;
    if (name === 'tokens') return `${formatCompactNumber(value)} tokens`;
    return formatCompactNumber(value);
  };

  return (
    <ChartContainer title="Usage Overview" description="Request volume over time">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {/* Grid with semantic border color */}
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.muted} opacity={0.3} />

          {/* X Axis - timestamp */}
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => formatChartTimestamp(value, summary.period)}
            stroke={chartColors.muted}
            tick={{ fontSize: 12 }}
            tickLine={false}
          />

          {/* Y Axis - request count */}
          <YAxis
            tickFormatter={formatYAxis}
            stroke={chartColors.muted}
            tick={{ fontSize: 12 }}
            tickLine={false}
            width={60}
          />

          {/* Tooltip with custom content */}
          <Tooltip
            content={<ChartTooltip labelFormatter={formatTooltipLabel} valueFormatter={formatTooltipValue} />}
          />

          {/* Area - request count (primary metric) */}
          <Area
            type="monotone"
            dataKey="requests"
            name="Requests"
            stroke={chartColors.primary}
            fill={chartColors.primary}
            fillOpacity={0.2}
            strokeWidth={2}
            isAnimationActive={false} // Disable animation for performance
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
