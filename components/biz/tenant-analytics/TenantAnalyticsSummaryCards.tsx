/**
 * Tenant Analytics Summary Cards
 *
 * Display summary metrics for tenant usage (requests, cost, tokens).
 * Uses simplified card styling with minimal padding.
 */

import { memo, useMemo } from 'react';
import type { NewAPIUsageSummary } from '@/types/tenant-analytics';
import {
  formatCreditCost,
  formatCompactNumber,
  formatDateRange,
} from '@/lib/utils/tenant-analytics-utils';

export interface TenantAnalyticsSummaryCardsProps {
  /** Summary metrics to display */
  summary: NewAPIUsageSummary;
}

/**
 * Summary metrics cards component.
 * Displays total requests, cost, and tokens in a grid layout.
 */
export const TenantAnalyticsSummaryCards = memo(
  function TenantAnalyticsSummaryCards({ summary }: TenantAnalyticsSummaryCardsProps) {
    // Memoize all formatted values to avoid recalculation on re-renders
    const formattedValues = useMemo(
      () => ({
        dateRange: formatDateRange(summary.rangeStart, summary.rangeEnd),
        requests: formatCompactNumber(summary.totalRequests),
        cost: formatCreditCost(summary.totalCost, summary.quotaPerUnit, summary.displayType),
        tokens: formatCompactNumber(summary.totalTokens),
      }),
      [summary],
    );

    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">{formattedValues.dateRange}</p>
        <div className="grid grid-cols-3 gap-2">
          {/* Total Requests */}
          <div className="border rounded-xl bg-card p-3 flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Total Requests</p>
            <p className="text-lg font-semibold text-foreground">
              {formattedValues.requests}
            </p>
          </div>

          {/* Total Cost */}
          <div className="border rounded-xl bg-card p-3 flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="text-lg font-semibold text-foreground">
              {formattedValues.cost}
            </p>
          </div>

          {/* Total Tokens */}
          <div className="border rounded-xl bg-card p-3 flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Total Tokens</p>
            <p className="text-lg font-semibold text-foreground">
              {formattedValues.tokens}
            </p>
          </div>
        </div>
      </div>
    );
  },
);
