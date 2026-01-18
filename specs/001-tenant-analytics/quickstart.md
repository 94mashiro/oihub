# Quickstart: Tenant Analytics Dashboard (NewAPI Only)

**Feature**: 001-tenant-analytics
**Date**: 2026-01-18
**Status**: ✅ Implemented

## Overview

This feature adds a NewAPI-only analytics dashboard in the popup. It fetches raw usage data via `NewAPIRawService`, derives summary + chart series using orchestrators and normalizers, and renders charts with Recharts. The analytics screen is accessible from the tenant card accordion panel.

## Architecture

### Data Flow

1. **Fetch**: `NewAPIRawService` → `/api/user/self` + `/api/data/self`
2. **Normalize**: `TenantAnalyticsOrchestrator` → summary, series, models, endpoints
3. **Store**: `tenantAnalyticsStore` (session-scoped) + `analyticsPreferencesStore` (persistent)
4. **Consume**: `useTenantAnalytics` hook → components

### Components

- **Screen**: `PopupTenantAnalyticsScreen` (routed at `/analytics/:tenantId`)
- **Charts**:
  - `TenantAnalyticsSummaryCards` - summary metrics
  - `TenantAnalyticsOverviewCard` - area chart
  - `TenantAnalyticsTimeSeriesCard` - multi-line chart
  - `TenantAnalyticsBreakdownCard` - horizontal bar chart
- **Controls**:
  - `TenantAnalyticsPeriodSelect` - period selector
  - `TenantAnalyticsBreakdownToggle` - breakdown type toggle

## Route Setup

The analytics route is configured in the popup router with lazy loading and Suspense:

```tsx
// entrypoints/popup/App.tsx
import { lazy, Suspense } from 'react';

const PopupTenantAnalyticsScreen = lazy(() =>
  import('@/components/biz-screen/PopupTenantAnalyticsScreen').then((m) => ({
    default: m.PopupTenantAnalyticsScreen,
  })),
);

<Suspense fallback={<Spinner />}>
  <Routes>
    <Route path="/analytics/:tenantId" element={<PopupTenantAnalyticsScreen />} />
  </Routes>
</Suspense>;
```

## Tenant Card Entry Point

The analytics entry is added as an accordion item in the tenant card:

```tsx
// components/biz/tenant-select-card/index.tsx
import { BarChart3 } from 'lucide-react';

<AccordionItem value="analytics">
  <AccordionTrigger className="py-2 text-xs">
    <div className="flex items-center gap-1">
      <BarChart3 className="size-3" />
      <span>Analytics</span>
    </div>
  </AccordionTrigger>
  <AccordionPanel className="pb-2">
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={() => navigate(`/analytics/${tenantId}`)}
    >
      View Analytics Dashboard
    </Button>
  </AccordionPanel>
</AccordionItem>;
```

## Analytics Screen Usage

The analytics screen uses the `useTenantAnalytics` hook to fetch and manage data:

```tsx
// components/biz-screen/PopupTenantAnalyticsScreen.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useTenantStore } from '@/lib/state/tenant-store';
import { useTenantAnalytics } from '@/hooks/use-tenant-analytics';

const { tenantId } = useParams<{ tenantId: string }>();
const tenant = useTenantStore((state) =>
  state.tenantList.find((t) => t.id === tenantId),
);

const analytics = tenant ? useTenantAnalytics(tenant) : null;

// Handle states: loading, error, empty, ready
if (!analytics || analytics.status === 'loading') {
  return <Spinner />;
}

if (analytics.status === 'error') {
  return <Empty title="Failed to load analytics" description={analytics.error} />;
}

// Render analytics dashboard
return (
  <>
    <TenantAnalyticsPeriodSelect period={analytics.period} onPeriodChange={analytics.changePeriod} />
    <TenantAnalyticsSummaryCards summary={analytics.summary} />
    <TenantAnalyticsOverviewCard series={analytics.series} summary={analytics.summary} />
    <TenantAnalyticsTimeSeriesCard series={analytics.series} summary={analytics.summary} />
    <TenantAnalyticsBreakdownCard models={analytics.models} endpoints={analytics.endpoints} summary={analytics.summary} />
  </>
);
```

## File Structure

```text
/Users/mashirowang/Workspace/packyapi-hub/
├── components/
│   ├── biz/
│   │   └── tenant-analytics/
│   │       ├── ChartContainer.tsx
│   │       ├── ChartTooltip.tsx
│   │       ├── TenantAnalyticsSummaryCards.tsx
│   │       ├── TenantAnalyticsOverviewCard.tsx
│   │       ├── TenantAnalyticsPeriodSelect.tsx
│   │       ├── TenantAnalyticsTimeSeriesCard.tsx
│   │       ├── TenantAnalyticsBreakdownToggle.tsx
│   │       └── TenantAnalyticsBreakdownCard.tsx
│   └── biz-screen/
│       └── PopupTenantAnalyticsScreen.tsx
├── hooks/
│   └── use-tenant-analytics.ts
├── lib/
│   ├── api/
│   │   └── orchestrators/
│   │       └── analytics/
│   │           ├── tenant-analytics-normalizers.ts
│   │           ├── tenant-analytics-orchestrator.ts
│   │           └── index.ts
│   ├── state/
│   │   ├── analytics-preferences-store.ts
│   │   └── tenant-analytics-store.ts
│   └── utils/
│       └── tenant-analytics-utils.ts
└── types/
    └── tenant-analytics.ts
```

## Testing Checklist

### User Story 1: View Tenant Usage Overview
- [X] Analytics accordion item appears on each tenant card
- [X] Clicking analytics button navigates to `/analytics/:tenantId`
- [X] Summary metrics display total requests, cost, and tokens
- [X] Overview chart renders with area chart showing usage trends
- [X] Loading state shows spinner with message
- [X] Error state shows error message with retry button
- [X] Empty state shows empty message when no data
- [X] Back button navigates to tenant list

### User Story 2: Analyze Usage Trends Over Time
- [X] Period selector displays 1d, 7d, 14d, 30d options
- [X] Changing period refreshes data and updates charts
- [X] Time-series chart displays requests, cost, and tokens
- [X] Hovering chart points shows detailed tooltip
- [X] X-axis labels format based on selected period
- [X] Y-axis labels use compact number format
- [X] Chart data is memoized for performance

### User Story 3: Compare Usage Across Models/Endpoints
- [X] Breakdown toggle displays "By Model" and "By Endpoint" options
- [X] Switching breakdown type updates chart
- [X] Breakdown chart displays top 10 items
- [X] Bar chart shows cost ranking with alternating colors
- [X] Tooltip displays cost, requests, tokens, and share
- [X] Empty state shows when no breakdown data available

### User Story 4: Navigate Between Tenant List and Analytics
- [X] Analytics entry is accessible from tenant card accordion
- [X] Clicking analytics navigates to dashboard
- [X] Back button preserves tenant list selection
- [X] Navigation is seamless without page refresh

### Cross-Cutting Concerns
- [X] All charts use semantic CSS variables for colors
- [X] Charts have no animations for performance
- [X] Data points are capped to 1000 for performance
- [X] All components follow coss design patterns
- [X] Loading/error/empty states are consistent
- [X] Typography and spacing follow UI design rules
