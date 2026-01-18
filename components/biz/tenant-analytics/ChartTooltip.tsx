/**
 * Chart Tooltip Component
 *
 * Custom tooltip content for Recharts with semantic styling.
 * Provides consistent formatting for chart hover details.
 */

import { cn } from '@/lib/utils';

export interface ChartTooltipProps {
  /** Whether the tooltip is active (has data) */
  active?: boolean;

  /** Payload data from chart */
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
  }>;

  /** Label for the data point (usually timestamp) */
  label?: string | number;

  /** Optional formatter for label */
  labelFormatter?: (label: string | number) => string;

  /** Optional formatter for values */
  valueFormatter?: (value: number, name?: string) => string;
}

/**
 * Tooltip content component for Recharts.
 * Renders chart data on hover with semantic colors and formatting.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formattedLabel = labelFormatter && label != null ? labelFormatter(label) : label;

  return (
    <div className="rounded-md border bg-card p-2 shadow-md">
      {formattedLabel && (
        <p className="mb-1 text-xs font-medium text-card-foreground">{formattedLabel}</p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, index) => {
          const value = entry.value ?? 0;
          const formattedValue = valueFormatter
            ? valueFormatter(value, entry.name)
            : value.toLocaleString();
          const name = entry.name || entry.dataKey || '';

          return (
            <div key={`tooltip-${index}`} className="flex items-center gap-2">
              {entry.color && (
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
              )}
              <span className="text-xs text-muted-foreground">{name}:</span>
              <span className="text-xs font-medium text-foreground">{formattedValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
