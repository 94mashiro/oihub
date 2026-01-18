/**
 * Tenant Analytics Period Selector
 *
 * Period selector component for changing analytics time range.
 * Uses button group for period selection.
 */

import type { CostPeriod } from '@/types/api';
import { CostPeriod as CostPeriodEnum } from '@/types/api';
import { Button } from '@/components/ui/button';
import { getPeriodShortLabel } from '@/lib/utils/tenant-analytics-utils';
import { cn } from '@/lib/utils';

export interface TenantAnalyticsPeriodSelectProps {
  /** Current selected period */
  period: CostPeriod;

  /** Callback when period changes */
  onPeriodChange: (period: CostPeriod) => void;

  /** Disable period selector during refresh */
  disabled?: boolean;
}

const PERIOD_OPTIONS: CostPeriod[] = [
  CostPeriodEnum.DAY_1,
  CostPeriodEnum.DAY_7,
  CostPeriodEnum.DAY_14,
  CostPeriodEnum.DAY_30,
];

/**
 * Period selector component.
 * Displays button group for selecting analytics time range.
 */
export function TenantAnalyticsPeriodSelect({
  period,
  onPeriodChange,
  disabled = false,
}: TenantAnalyticsPeriodSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Period:</span>
      <div className="inline-flex gap-1 rounded-lg border bg-muted p-1">
        {PERIOD_OPTIONS.map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPeriodChange(p)}
            disabled={disabled}
            className={cn('h-7 px-3 text-xs', period !== p && 'hover:bg-background/50')}
          >
            {getPeriodShortLabel(p)}
          </Button>
        ))}
      </div>
    </div>
  );
}
