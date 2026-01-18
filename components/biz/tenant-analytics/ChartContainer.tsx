/**
 * Chart Container Component
 *
 * Wrapper for chart components following coss design patterns.
 * Provides consistent card styling and layout for analytics charts.
 */

import { Card, CardHeader, CardTitle, CardPanel } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ChartContainerProps {
  /** Chart title */
  title: string;

  /** Optional description below title */
  description?: string;

  /** Chart content */
  children: React.ReactNode;

  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Chart container with shadcn-style card layout.
 * Provides consistent spacing and elevation for all charts.
 * Non-interactive: charts are read-only visualizations.
 */
export function ChartContainer({ title, description, children, className }: ChartContainerProps) {
  return (
    <Card className={cn('flex flex-col py-2 gap-2 rounded-xl', className)}>
      <CardHeader className="px-3 pb-1">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardPanel className="flex-1 px-2 py-1 select-none outline-none focus:outline-none [&_svg]:outline-none [&_*]:outline-none">
        {children}
      </CardPanel>
    </Card>
  );
}
