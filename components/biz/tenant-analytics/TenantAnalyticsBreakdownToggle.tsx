/**
 * Tenant Analytics Breakdown Toggle
 *
 * Toggle between model and endpoint breakdown views.
 * Uses button group with semantic styling.
 */

import type { BreakdownType } from '@/types/tenant-analytics';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TenantAnalyticsBreakdownToggleProps {
  /** Current breakdown type */
  value: BreakdownType;

  /** Callback when breakdown type changes */
  onValueChange: (value: BreakdownType) => void;
}

/**
 * Breakdown type toggle component.
 * Displays toggle buttons for switching between model and endpoint views.
 */
export function TenantAnalyticsBreakdownToggle({
  value,
  onValueChange,
}: TenantAnalyticsBreakdownToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Breakdown:</span>
      <div className="inline-flex gap-1 rounded-lg border bg-muted p-1">
        <Button
          variant={value === 'model' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onValueChange('model')}
          className={cn('h-7 px-3 text-xs', value !== 'model' && 'hover:bg-background/50')}
        >
          By Model
        </Button>
        <Button
          variant={value === 'endpoint' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onValueChange('endpoint')}
          className={cn('h-7 px-3 text-xs', value !== 'endpoint' && 'hover:bg-background/50')}
        >
          By Endpoint
        </Button>
      </div>
    </div>
  );
}
