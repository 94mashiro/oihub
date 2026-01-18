/**
 * Tenant Analytics Breakdown Card
 *
 * Horizontal bar chart showing usage breakdown by model or endpoint.
 * Displays cost ranking with share percentages and tooltips.
 */

import { memo, useMemo, useState, useCallback } from 'react';
import type {
  NewAPIModelUsage,
  NewAPIEndpointUsage,
  BreakdownType,
  NewAPIUsageSummary,
} from '@/types/tenant-analytics';
import { ChartContainer } from './ChartContainer';
import { ChartTooltip } from './ChartTooltip';
import { TenantAnalyticsBreakdownToggle } from './TenantAnalyticsBreakdownToggle';
import {
  formatCreditCost,
  formatCompactNumber,
  formatPercentage,
} from '@/lib/utils/tenant-analytics-utils';
import { ResponsiveContainer, BarChart, Bar, YAxis, Tooltip, Cell } from 'recharts';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

export interface TenantAnalyticsBreakdownCardProps {
  /** Model breakdown data */
  models: NewAPIModelUsage[];

  /** Endpoint breakdown data */
  endpoints: NewAPIEndpointUsage[];

  /** Summary metrics for context */
  summary: NewAPIUsageSummary;

  /** Default breakdown type */
  defaultType?: BreakdownType;
}

/**
 * Breakdown chart card component.
 * Displays horizontal bar chart with model or endpoint ranking.
 * Includes toggle for switching breakdown types.
 */
export const TenantAnalyticsBreakdownCard = memo(
  function TenantAnalyticsBreakdownCard({
    models,
    endpoints,
    summary,
    defaultType = 'model',
  }: TenantAnalyticsBreakdownCardProps) {
    const [breakdownType, setBreakdownType] = useState<BreakdownType>(defaultType);

    // Get chart colors from CSS variables
    const chartColors = useMemo(() => {
      if (typeof window === 'undefined') {
        return {
          primary: 'hsl(var(--primary))',
          info: 'hsl(var(--info))',
          muted: 'hsl(var(--muted-foreground))',
        };
      }

      const styles = getComputedStyle(document.documentElement);
      return {
        primary: `hsl(${styles.getPropertyValue('--primary')})`,
        info: `hsl(${styles.getPropertyValue('--info')})`,
        muted: `hsl(${styles.getPropertyValue('--muted-foreground')})`,
      };
    }, []);

    // Select data based on breakdown type (memoized)
    const chartData = useMemo(() => {
      const data = breakdownType === 'model' ? models : endpoints;

      // Take top 10 items only
      return data.slice(0, 10).map((item) => ({
        name: 'modelName' in item ? item.modelName : item.endpoint,
        cost: item.cost,
        requests: item.requestCount,
        tokens: item.tokens,
        share: item.share,
      }));
    }, [breakdownType, models, endpoints]);

    // Format Y-axis labels (names) - memoized callback
    const formatYAxis = useCallback((value: string) => {
      return value.length > 20 ? `${value.substring(0, 20)}...` : value;
    }, []);

    // Format tooltip values - memoized callback
    const formatTooltipValue = useCallback(
      (value: number, name?: string) => {
        if (name === 'cost')
          return formatCreditCost(value, summary.quotaPerUnit, summary.displayType);
        if (name === 'requests') return `${formatCompactNumber(value)} requests`;
        if (name === 'tokens') return `${formatCompactNumber(value)} tokens`;
        if (name === 'share') return formatPercentage(value);
        return formatCompactNumber(value);
      },
      [summary.quotaPerUnit, summary.displayType],
    );

    // Memoize tooltip content
    const tooltipContent = useMemo(
      () => <ChartTooltip valueFormatter={formatTooltipValue} />,
      [formatTooltipValue],
    );

  return (
    <ChartContainer
      title="Usage Breakdown"
      description="Cost ranking by model or endpoint"
    >
      <div className="flex flex-col gap-4">
        {/* Breakdown type toggle - always visible for fallback switching */}
        <TenantAnalyticsBreakdownToggle value={breakdownType} onValueChange={setBreakdownType} />

        {/* Empty state - no breakdown data available */}
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No breakdown data</EmptyTitle>
                <EmptyDescription>
                  No {breakdownType} data available for this period.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          /* Bar chart */
          <div className="select-none cursor-default [&_.recharts-bar-rectangle]:cursor-default">
          <ResponsiveContainer width="100%" height={Math.max(120, chartData.length * 24)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 5, left: 80, bottom: 5 }}
          >
            {/* Y Axis - names (model/endpoint) */}
            <YAxis
              type="category"
              dataKey="name"
              tickFormatter={formatYAxis}
              stroke={chartColors.muted}
              tick={{ fontSize: 10 }}
              tickLine={false}
              width={70}
            />

            {/* Tooltip with memoized content */}
            <Tooltip content={tooltipContent} />

            {/* Bar - cost */}
            <Bar dataKey="cost" name="Cost" isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index % 2 === 0 ? chartColors.primary : chartColors.info}
                  style={{ cursor: 'default' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
          </div>
        )}
      </div>
    </ChartContainer>
  );
  },
);
