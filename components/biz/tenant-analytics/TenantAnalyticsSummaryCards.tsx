/**
 * Tenant Analytics Summary Cards
 *
 * Display summary metrics for tenant usage (requests, cost, tokens).
 * Uses Card components with semantic styling.
 */

import type { NewAPIUsageSummary } from '@/types/tenant-analytics';
import { Card, CardHeader, CardTitle, CardPanel } from '@/components/ui/card';
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
export function TenantAnalyticsSummaryCards({ summary }: TenantAnalyticsSummaryCardsProps) {
  const dateRange = formatDateRange(summary.rangeStart, summary.rangeEnd);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">{dateRange}</p>
      <div className="grid grid-cols-3 gap-3">
        {/* Total Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardPanel>
            <p className="text-2xl font-semibold text-foreground">
              {formatCompactNumber(summary.totalRequests)}
            </p>
          </CardPanel>
        </Card>

        {/* Total Cost */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardPanel>
            <p className="text-2xl font-semibold text-foreground">
              {formatCreditCost(summary.totalCost, summary.quotaPerUnit, summary.displayType)}
            </p>
          </CardPanel>
        </Card>

        {/* Total Tokens */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tokens
            </CardTitle>
          </CardHeader>
          <CardPanel>
            <p className="text-2xl font-semibold text-foreground">
              {formatCompactNumber(summary.totalTokens)}
            </p>
          </CardPanel>
        </Card>
      </div>
    </div>
  );
}
