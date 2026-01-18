/**
 * Tenant Analytics Breakdown Card
 *
 * Horizontal bar chart showing usage breakdown by model or endpoint.
 * Displays cost ranking with share percentages and tooltips.
 */

import { useMemo, useState } from 'react';
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
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
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
export function TenantAnalyticsBreakdownCard({
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

  // Format Y-axis labels (names)
  const formatYAxis = (value: string) => {
    // Truncate long names
    return value.length > 20 ? `${value.substring(0, 20)}...` : value;
  };

  // Format X-axis labels (cost values)
  const formatXAxis = (value: number) => {
    return formatCompactNumber(value);
  };

  // Format tooltip values
  const formatTooltipValue = (value: number, name?: string) => {
    if (name === 'cost')
      return formatCreditCost(value, summary.quotaPerUnit, summary.displayType);
    if (name === 'requests') return `${formatCompactNumber(value)} requests`;
    if (name === 'tokens') return `${formatCompactNumber(value)} tokens`;
    if (name === 'share') return formatPercentage(value);
    return formatCompactNumber(value);
  };

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
          <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 40)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 100, bottom: 10 }}
          >
            {/* Y Axis - names (model/endpoint) */}
            <YAxis
              type="category"
              dataKey="name"
              tickFormatter={formatYAxis}
              stroke={chartColors.muted}
              tick={{ fontSize: 12 }}
              tickLine={false}
              width={90}
            />

            {/* X Axis - cost values */}
            <XAxis
              type="number"
              tickFormatter={formatXAxis}
              stroke={chartColors.muted}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />

            {/* Tooltip with custom content */}
            <Tooltip content={<ChartTooltip valueFormatter={formatTooltipValue} />} />

            {/* Bar - cost */}
            <Bar dataKey="cost" name="Cost" isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index % 2 === 0 ? chartColors.primary : chartColors.info}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
    </ChartContainer>
  );
}
