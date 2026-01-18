# Research: Tenant Analytics Dashboard (NewAPI Only)

**Feature**: 001-tenant-analytics  
**Date**: 2026-01-18  
**Spec**: /Users/mashirowang/Workspace/packyapi-hub/specs/001-tenant-analytics/spec.md

## 1. Chart Library

**Decision**: Use Recharts for the analytics charts (`ResponsiveContainer`, `LineChart`/`AreaChart`, `BarChart`, `Tooltip`, `XAxis`, `YAxis`).  
**Rationale**: Context7 examples confirm responsive containers, axis formatters, and tooltip customization. Recharts is React-first, matches the popup’s SVG rendering needs, and aligns with the planned stack.  
**Alternatives considered**: `react-chartjs-2` (canvas + heavier config), ApexCharts (larger bundle), custom SVG (more maintenance).

## 2. Usage Data Source & Scope

**Decision**: Fetch analytics directly from NewAPI endpoints via `NewAPIRawService`: `/api/user/self` (request count + quota totals) and `/api/data/self` (usage points with `created_at`, `model_name`, `quota`, `token_used`, `count`).  
**Rationale**: The feature only targets NewAPI, so raw response types are sufficient and avoid cross-platform abstraction. Service layer use keeps API calls out of UI.  
**Alternatives considered**: Reuse normalized `costStore` or multi-platform orchestrators (over-abstract for this scope), direct `APIClient` usage in components (violates architecture).

## 3. Analytics State Handling

**Decision**: Keep analytics payload in view-local state via a dedicated `use-newapi-analytics` hook, passing derived data to chart components.  
**Rationale**: Data is screen-scoped, avoids persistent storage overhead, and aligns with the “no over-abstract” requirement.  
**Alternatives considered**: New global stores (`tenant-analytics-store`, preferences store) or extending `costStore`.

## 4. Chart Data Shaping

**Decision**: Request time-series data with `default_time=hour`, aggregate by timestamp and model in lightweight selectors, and cap inputs to <=1000 points.  
**Rationale**: Keeps UI responsive and meets the 3s load goal with small in-memory transforms.  
**Alternatives considered**: Client-side heavy grouping or per-request logs.

## 5. UI Composition & Navigation

**Decision**: Compose the dashboard using coss components and semantic tokens; add a tenant-card analytics entry that routes to `/analytics/:tenantId`; back navigation returns to the tenant list.  
**Rationale**: Keeps UX consistent with existing popup screens and avoids modal complexity.  
**Alternatives considered**: Modal overlay or embedding charts inside the card.
