/**
 * Popup Tenant Analytics Screen
 *
 * Full-screen analytics dashboard for a tenant.
 * Displays summary metrics and overview chart with loading/error/empty states.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from '@/components/ui/frame';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useTenantStore } from '@/lib/state/tenant-store';
import { useTenantAnalytics } from '@/hooks/use-tenant-analytics';
import { TenantAnalyticsSummaryCards } from '@/components/biz/tenant-analytics/TenantAnalyticsSummaryCards';
import { TenantAnalyticsOverviewCard } from '@/components/biz/tenant-analytics/TenantAnalyticsOverviewCard';
import { TenantAnalyticsPeriodSelect } from '@/components/biz/tenant-analytics/TenantAnalyticsPeriodSelect';
import { TenantAnalyticsTimeSeriesCard } from '@/components/biz/tenant-analytics/TenantAnalyticsTimeSeriesCard';
import { TenantAnalyticsBreakdownCard } from '@/components/biz/tenant-analytics/TenantAnalyticsBreakdownCard';

/**
 * Tenant analytics screen component.
 * Routed at /analytics/:tenantId.
 * Provides back navigation and loading/error/empty states.
 */
export function PopupTenantAnalyticsScreen() {
  const navigate = useNavigate();
  const { tenantId } = useParams<{ tenantId: string }>();

  // Get tenant from store
  const tenantList = useTenantStore((state) => state.tenantList);
  const tenant = tenantList.find((t) => t.id === tenantId);

  // Use analytics hook to fetch and manage data
  const analytics = tenant ? useTenantAnalytics(tenant) : null;

  // Handle back navigation
  const handleBack = () => {
    navigate('/');
  };

  // Tenant not found
  if (!tenant) {
    return (
      <Frame>
        <FrameHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBack} aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <FrameTitle>Analytics</FrameTitle>
          </div>
        </FrameHeader>
        <FramePanel className="flex items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Tenant not found</EmptyTitle>
              <EmptyDescription>The tenant you're looking for doesn't exist.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </FramePanel>
      </Frame>
    );
  }

  // Loading state (only show when no cached data exists)
  const hasCachedData = analytics?.summary !== undefined;
  if (!analytics || (analytics.status === 'loading' && !hasCachedData)) {
    return (
      <Frame>
        <FrameHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBack} aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <FrameTitle>{tenant.name} - Analytics</FrameTitle>
          </div>
        </FrameHeader>
        <FramePanel className="flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Spinner />
            <p className="text-sm text-muted-foreground">Loading analytics data...</p>
          </div>
        </FramePanel>
      </Frame>
    );
  }

  // Error state
  if (analytics.status === 'error') {
    return (
      <Frame>
        <FrameHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBack} aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <FrameTitle>{tenant.name} - Analytics</FrameTitle>
          </div>
        </FrameHeader>
        <FramePanel className="flex flex-col gap-3 p-3">
          <TenantAnalyticsPeriodSelect
            period={analytics.period}
            onPeriodChange={analytics.changePeriod}
          />
          <div className="flex-1 flex items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Failed to load analytics</EmptyTitle>
              <EmptyDescription>
                {analytics.error || 'An error occurred while fetching analytics data.'}
              </EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" size="sm" onClick={analytics.refresh}>
              Retry
            </Button>
          </Empty>
          </div>
        </FramePanel>
      </Frame>
    );
  }

  // Empty state (no data available)
  if (!analytics.summary || !analytics.series || analytics.series.length === 0) {
    return (
      <Frame>
        <FrameHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBack} aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <FrameTitle>{tenant.name} - Analytics</FrameTitle>
          </div>
        </FrameHeader>
        <FramePanel className="flex flex-col gap-3 p-3">
          <TenantAnalyticsPeriodSelect
            period={analytics.period}
            onPeriodChange={analytics.changePeriod}
          />
          <div className="flex-1 flex items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No analytics data</EmptyTitle>
              <EmptyDescription>
                No usage data found for the selected period. Try a different period or check back later.
              </EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" size="sm" onClick={analytics.refresh}>
              Refresh
            </Button>
          </Empty>
          </div>
        </FramePanel>
      </Frame>
    );
  }

  // Ready state - show analytics dashboard
  return (
    <Frame>
      <FrameHeader className="p-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBack} aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <FrameTitle>{tenant.name} - Analytics</FrameTitle>
        </div>
      </FrameHeader>
      <FramePanel className="flex flex-col gap-3 p-3 overflow-y-auto relative">
        {/* Period selector */}
        <TenantAnalyticsPeriodSelect
          period={analytics.period}
          onPeriodChange={analytics.changePeriod}
        />

        {/* Summary metrics cards */}
        <TenantAnalyticsSummaryCards summary={analytics.summary} />

        {/* Overview chart */}
        <TenantAnalyticsOverviewCard series={analytics.series} summary={analytics.summary} />

        {/* Time-series detailed chart */}
        <TenantAnalyticsTimeSeriesCard series={analytics.series} summary={analytics.summary} />

        {/* Usage breakdown by model/endpoint */}
        <TenantAnalyticsBreakdownCard
          models={analytics.models || []}
          endpoints={analytics.endpoints || []}
          summary={analytics.summary}
          defaultType={analytics.defaultBreakdownType}
        />
      </FramePanel>
    </Frame>
  );
}
