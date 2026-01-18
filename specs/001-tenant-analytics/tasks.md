---

description: "Task list for Tenant Analytics Dashboard implementation"
---

# Tasks: Tenant Analytics Dashboard

**Input**: Design documents from `/specs/001-tenant-analytics/`
**Prerequisites**: plan.md (template), spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested in feature specification - test tasks omitted.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- This plan uses absolute paths rooted at `/Users/mashirowang/Workspace/packyapi-hub/`
- Popup entrypoints: `/Users/mashirowang/Workspace/packyapi-hub/entrypoints/popup/`
- Screens: `/Users/mashirowang/Workspace/packyapi-hub/components/biz-screen/`
- Feature components: `/Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-analytics/`
- Stores: `/Users/mashirowang/Workspace/packyapi-hub/lib/state/`
- Orchestrators: `/Users/mashirowang/Workspace/packyapi-hub/lib/api/orchestrators/`
- Types: `/Users/mashirowang/Workspace/packyapi-hub/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Core dependencies required for analytics UI

- [X] T001 Add `recharts` dependency to `/Users/mashirowang/Workspace/packyapi-hub/package.json` and update `/Users/mashirowang/Workspace/packyapi-hub/bun.lock`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Analytics data model, storage, and fetch pipeline required for all stories

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Create analytics data types in `/Users/mashirowang/Workspace/packyapi-hub/types/tenant-analytics.ts`
- [X] T003 [P] Create analytics preferences store (`createStore`, `local:analytics-preferences`) in `/Users/mashirowang/Workspace/packyapi-hub/lib/state/analytics-preferences-store.ts`
- [X] T004 [P] Create tenant analytics store (`createStore`, `session:tenant-analytics`) in `/Users/mashirowang/Workspace/packyapi-hub/lib/state/tenant-analytics-store.ts`
- [X] T005 [P] Add analytics utility helpers (period labels, range formatting, point cap) in `/Users/mashirowang/Workspace/packyapi-hub/lib/utils/tenant-analytics-utils.ts`
- [X] T006 [P] Add analytics normalizers (summary + series + empty baseline per platform) in `/Users/mashirowang/Workspace/packyapi-hub/lib/api/orchestrators/analytics/tenant-analytics-normalizers.ts`
- [X] T007 Create tenant analytics orchestrator (fetch raw services, set store status/data) in `/Users/mashirowang/Workspace/packyapi-hub/lib/api/orchestrators/analytics/tenant-analytics-orchestrator.ts`
- [X] T008 Create analytics orchestrator barrel/factory in `/Users/mashirowang/Workspace/packyapi-hub/lib/api/orchestrators/analytics/index.ts`
- [X] T009 Export analytics orchestrator from `/Users/mashirowang/Workspace/packyapi-hub/lib/api/orchestrators/index.ts`
- [X] T010 Create analytics hook for screen consumption in `/Users/mashirowang/Workspace/packyapi-hub/hooks/use-tenant-analytics.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Tenant Usage Overview (Priority: P1) MVP

**Goal**: Show an analytics dashboard with summary metrics and an overview chart for a tenant

**Independent Test**: Open `/analytics/:tenantId` directly and verify summary metrics + overview chart render for that tenant

### Implementation for User Story 1

- [X] T011 [P] [US1] Create shadcn-style chart container wrapper in `/Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-analytics/ChartContainer.tsx`
- [X] T012 [P] [US1] Create chart tooltip content component in `/Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-analytics/ChartTooltip.tsx`
- [X] T013 [P] [US1] Create summary metrics component in `/Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-analytics/TenantAnalyticsSummaryCards.tsx`
- [X] T014 [US1] Create overview chart card (no animation, semantic colors) in `/Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-analytics/TenantAnalyticsOverviewCard.tsx`
- [X] T015 [US1] Build analytics screen layout + loading/error/empty states in `/Users/mashirowang/Workspace/packyapi-hub/components/biz-screen/PopupTenantAnalyticsScreen.tsx`

**Checkpoint**: User Story 1 complete - analytics overview is accessible and renders for a tenant

---

## Phase 4: User Story 4 - Navigate Between Tenant List and Analytics (Priority: P1)

**Goal**: Provide entry and back navigation between tenant list and analytics while preserving context

**Independent Test**: Click analytics entry from a tenant card, then return to the list and verify selection is preserved

### Implementation for User Story 4

- [X] T016 [P] [US4] Add analytics route with lazy/Suspense in `/Users/mashirowang/Workspace/packyapi-hub/entrypoints/popup/App.tsx`
- [X] T017 [P] [US4] Add analytics entry button on tenant card in `/Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-select-card/index.tsx`
- [X] T018 [US4] Add back button + tenant context sync in `/Users/mashirowang/Workspace/packyapi-hub/components/biz-screen/PopupTenantAnalyticsScreen.tsx`

**Checkpoint**: User Story 4 complete - navigation between list and analytics is seamless

---

## Phase 5: User Story 2 - Analyze Usage Trends Over Time (Priority: P2)

**Goal**: Provide interactive time-series charting with period selection and hover details

**Independent Test**: Change period, hover chart points, and verify detailed tooltip data per time bucket

### Implementation for User Story 2

- [X] T019 [P] [US2] Create period selector component in `/Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-analytics/TenantAnalyticsPeriodSelect.tsx`
- [X] T020 [US2] Create time-series chart card (interactive tooltip, memoized data) in `/Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-analytics/TenantAnalyticsTimeSeriesCard.tsx`
- [X] T021 [US2] Update analytics screen to render period selector + time-series chart in `/Users/mashirowang/Workspace/packyapi-hub/components/biz-screen/PopupTenantAnalyticsScreen.tsx`

**Checkpoint**: User Story 2 complete - time-series analysis is interactive and period-aware

---

## Phase 6: User Story 3 - Compare Usage Across Models/Endpoints (Priority: P3)

**Goal**: Visualize usage breakdown by model or endpoint for optimization insights

**Independent Test**: Switch breakdown type and verify chart updates with model/endpoint ranking

### Implementation for User Story 3

- [X] T022 [P] [US3] Extend breakdown normalization (model + endpoint) in `/Users/mashirowang/Workspace/packyapi-hub/lib/api/orchestrators/analytics/tenant-analytics-normalizers.ts`
- [X] T023 [P] [US3] Create breakdown toggle component in `/Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-analytics/TenantAnalyticsBreakdownToggle.tsx`
- [X] T024 [US3] Create breakdown chart card (bar chart + tooltip) in `/Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-analytics/TenantAnalyticsBreakdownCard.tsx`
- [X] T025 [US3] Update analytics screen to render breakdown section in `/Users/mashirowang/Workspace/packyapi-hub/components/biz-screen/PopupTenantAnalyticsScreen.tsx`

**Checkpoint**: User Story 3 complete - usage breakdown is visible and comparable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final UX polish and documentation alignment

- [X] T026 [P] Tune responsive layout and spacing in `/Users/mashirowang/Workspace/packyapi-hub/components/biz-screen/PopupTenantAnalyticsScreen.tsx`
- [X] T027 Update validation notes/checklist in `/Users/mashirowang/Workspace/packyapi-hub/specs/001-tenant-analytics/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational - no story dependencies
- **User Story 4 (P1)**: Depends on User Story 1 (analytics screen exists)
- **User Story 2 (P2)**: Depends on User Story 1 (analytics screen + data pipeline)
- **User Story 3 (P3)**: Depends on User Story 1 (analytics screen + data pipeline)

### Parallel Opportunities

- Foundational tasks T003-T006 can run in parallel after T002
- User Story 1 tasks T011-T013 can run in parallel
- User Story 4 tasks T016-T017 can run in parallel
- User Story 2 tasks T019-T020 can run in parallel
- User Story 3 tasks T022-T023 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Create shadcn-style chart container wrapper in /Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-analytics/ChartContainer.tsx"
Task: "Create chart tooltip content component in /Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-analytics/ChartTooltip.tsx"
Task: "Create summary metrics component in /Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-analytics/TenantAnalyticsSummaryCards.tsx"
```

## Parallel Example: User Story 4

```bash
Task: "Add analytics route with lazy/Suspense in /Users/mashirowang/Workspace/packyapi-hub/entrypoints/popup/App.tsx"
Task: "Add analytics entry button on tenant card in /Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-select-card/index.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Create period selector component in /Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-analytics/TenantAnalyticsPeriodSelect.tsx"
Task: "Create time-series chart card in /Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-analytics/TenantAnalyticsTimeSeriesCard.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Extend breakdown normalization (model + endpoint) in /Users/mashirowang/Workspace/packyapi-hub/lib/api/orchestrators/analytics/tenant-analytics-normalizers.ts"
Task: "Create breakdown toggle component in /Users/mashirowang/Workspace/packyapi-hub/components/biz/tenant-analytics/TenantAnalyticsBreakdownToggle.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Validate independently (MVP)
3. Add User Story 4 -> Validate navigation
4. Add User Story 2 -> Validate time-series analysis
5. Add User Story 3 -> Validate breakdown analysis

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 4
   - Developer C: User Story 2
   - Developer D: User Story 3

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid direct APIClient usage in hooks/components; route API work through orchestrators/services
- Use coss UI components + semantic CSS variables for all UI
