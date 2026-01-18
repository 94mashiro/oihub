# Implementation Plan: Tenant Analytics Dashboard

**Branch**: `001-tenant-analytics` | **Date**: 2026-01-18 | **Spec**: /Users/mashirowang/Workspace/packyapi-hub/specs/001-tenant-analytics/spec.md
**Input**: Feature specification from `/Users/mashirowang/Workspace/packyapi-hub/specs/001-tenant-analytics/spec.md`

## Summary

Implement a NewAPI-only analytics dashboard in the popup. Add an analytics entry on each tenant card that routes to a dedicated screen. Fetch raw NewAPI usage data via `NewAPIRawService` (`/api/user/self` and `/api/data/self`) and derive summary metrics, time-series points, and model breakdowns for charts rendered with Recharts. UI uses coss components with semantic tokens, includes loading/error/empty states, and provides back navigation. Avoid cross-platform abstractions or generic analytics stores.

## Technical Context

**Language/Version**: TypeScript 5.9.2, React 19.1.1  
**Primary Dependencies**: WXT 0.20.6, React Router 7.10.1, Zustand 5.0.9, coss UI components, Tailwind CSS v4, Recharts, date-fns  
**Storage**: WXT storage via `createStore` for existing global stores; analytics data kept in view-local state (no new persistent store)  
**Testing**: `bun test`, `bun run compile`, `bun run lint`  
**Target Platform**: Chrome + Firefox extension popup (WXT)  
**Project Type**: Browser extension (popup UI + background service worker)  
**Performance Goals**: <=3s data load for <=1000 points; <=150ms chart render after data; <=10MB in-memory analytics data per tenant  
**Constraints**: Popup min width 400px; avoid heavy UI-thread work; NewAPI-only data flow; API calls stay in service layer (no direct `APIClient` usage in UI)  
**Scale/Scope**: Single analytics screen; 1 tenant at a time; 1-3 charts; <=1000 data points

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Cross-browser parity plan (Chrome and Firefox) with any documented gaps
- [x] UX consistency plan references coss components and `docs/ui-design-rules.md`
- [x] Architecture discipline confirmed (createStore, service layer via `NewAPIRawService`, naming rules)
- [x] Testing strategy includes automated tests and cross-browser validation
- [x] Performance budgets and measurement plan defined

**Post-Design Check (Phase 1)**: PASS - no deviations required.

## Project Structure

### Documentation (this feature)

```text
/Users/mashirowang/Workspace/packyapi-hub/specs/001-tenant-analytics/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
/Users/mashirowang/Workspace/packyapi-hub/
├── entrypoints/
│   ├── background.ts
│   ├── content.ts
│   └── popup/
│       ├── App.tsx
│       └── main.tsx
├── components/
│   ├── biz/
│   ├── biz-screen/
│   │   └── popup-chart-screen/
│   └── ui/
├── hooks/
├── lib/
│   ├── api/
│   ├── state/
│   └── utils/
├── types/
├── assets/
└── public/
```

**Structure Decision**: Use the existing WXT extension layout. Add the analytics screen under
`/Users/mashirowang/Workspace/packyapi-hub/components/biz-screen/popup-chart-screen/` with
supporting chart components and a NewAPI analytics hook in `/Users/mashirowang/Workspace/packyapi-hub/hooks/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
