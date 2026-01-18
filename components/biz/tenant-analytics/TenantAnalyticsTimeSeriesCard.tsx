/**
 * Tenant Analytics Time-Series Card
 *
 * Interactive time-series chart showing detailed usage trends.
 * Displays requests, cost, and tokens over time with hover tooltips.
 */

import { useMemo } from 'react';
import type { NewAPIUsagePoint, NewAPIUsageSummary } from '@/types/tenant-analytics';
import { ChartContainer } from './ChartContainer';
import { ChartTooltip } from './ChartTooltip';
import {
  formatChartTimestamp,
  formatCompactNumber,
  formatCreditCost,
} from '@/lib/utils/tenant-analytics-utils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export interface TenantAnalyticsTimeSeriesCardProps {
  /** Time-series data points */
  series: NewAPIUsagePoint[];

  /** Summary metrics for context */
  summary: NewAPIUsageSummary;
}

/**
 * Time-series chart card component.
 * Displays multi-metric line chart with interactive tooltips.
 * Memoized data transformation for performance.
 */
export function TenantAnalyticsTimeSeriesCard({
  series,
  summary,
}: TenantAnalyticsTimeSeriesCardProps) {
  // Get chart colors from CSS variables
  const chartColors = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        primary: 'hsl(var(--primary))',
        info: 'hsl(var(--info))',
        success: 'hsl(var(--success))',
        muted: 'hsl(var(--muted-foreground))',
      };
    }

    const styles = getComputedStyle(document.documentElement);
    return {
      primary: `hsl(${styles.getPropertyValue('--primary')})`,
      info: `hsl(${styles.getPropertyValue('--info')})`,
      success: `hsl(${styles.getPropertyValue('--success')})`,
      muted: `hsl(${styles.getPropertyValue('--muted-foreground')})`,
    };
  }, []);

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

  // Format tooltip label (timestamp)
  const formatTooltipLabel = (label: string | number) => {
    const timestamp = typeof label === 'number' ? label : Number(label);
    return formatChartTimestamp(timestamp, summary.period);
  };

  // Format Y-axis labels with compact numbers
  const formatYAxis = (value: number) => {
    return formatCompactNumber(value);
  };

  // Format tooltip values with appropriate units
  const formatTooltipValue = (value: number, name?: string) => {
    if (name === 'Requests') return `${formatCompactNumber(value)}`;
    if (name === 'Cost')
      return formatCreditCost(value, summary.quotaPerUnit, summary.displayType);
    if (name === 'Tokens') return formatCompactNumber(value);
    return formatCompactNumber(value);
  };

  return (
    <ChartContainer
      title="Usage Trends"
      description="Detailed metrics over time (requests, cost, tokens)"
    >
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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

          {/* Y Axis - metric values */}
          <YAxis
            tickFormatter={formatYAxis}
            stroke={chartColors.muted}
            tick={{ fontSize: 12 }}
            tickLine={false}
            width={60}
          />

          {/* Tooltip with custom content */}
          <Tooltip
            content={
              <ChartTooltip
                labelFormatter={formatTooltipLabel}
                valueFormatter={formatTooltipValue}
              />
            }
          />

          {/* Legend */}
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            iconType="line"
            iconSize={10}
            verticalAlign="top"
            height={36}
          />

          {/* Lines for each metric */}
          <Line
            type="monotone"
            dataKey="requests"
            name="Requests"
            stroke={chartColors.primary}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="cost"
            name="Cost"
            stroke={chartColors.info}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="tokens"
            name="Tokens"
            stroke={chartColors.success}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
