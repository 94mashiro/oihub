# Tasks: Tenant Info Storage Refactoring

**Input**: Design documents from `/specs/002-tenant-info-refactor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested - no test tasks included per constitution

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Type Definitions)

**Purpose**: Update type definitions to support separation of configuration from runtime data

- [X] T001 Remove `info?: TenantInfo` field from `Tenant` interface in types/tenant.ts
- [X] T002 Update `TenantInfo` interface with normalized field names (creditUnit, exchangeRate, displayFormat, endpoints, notices) in types/tenant.ts
- [X] T003 Ensure all `TenantInfo` fields are optional in types/tenant.ts

---

## Phase 2: Foundational (Adapter & Store Infrastructure)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add `normalizeTenantInfo(raw: unknown): TenantInfo` method to `PlatformAdapter` interface in lib/api/adapters/types.ts
- [X] T005 [P] Implement `normalizeTenantInfo()` method in lib/api/adapters/newapi-adapter.ts with field mapping (quota_per_unit → creditUnit, usd_exchange_rate → exchangeRate, quota_display_type → displayFormat, api_info → endpoints, announcements → notices)
- [X] T006 [P] Create `lib/state/tenant-info-store.ts` with `TenantInfoStoreState` interface (ready, tenantInfoMap, setTenantInfo, removeTenantInfo, getTenantInfo, hydrate)
- [X] T007 Implement store using `createStore` pattern with `storageItem: undefined` (runtime-only) in lib/state/tenant-info-store.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Separate Configuration from Runtime Data (Priority: P1) 🎯 MVP

**Goal**: Tenant configuration data (user-provided settings) stored separately from runtime data (API-fetched information)

**Independent Test**: Verify that tenant configuration (id, name, token, userId, url, platformType) persists in tenant store while runtime info is stored separately in tenant-info-store, and that both can be accessed independently without coupling

### Implementation for User Story 1

- [X] T008 [US1] Update `TenantAPIService.getStatus()` to use `this.adapter.normalizeTenantInfo(raw)` in lib/api/services/tenant-api-service.ts
- [X] T009 [US1] Update `removeTenant()` to call `useTenantInfoStore.getState().removeTenantInfo(id)` for cleanup in lib/state/tenant-store.ts

**Checkpoint**: At this point, User Story 1 should be fully functional - tenant config and runtime info are separated

---

## Phase 4: User Story 2 - Streamlined Tenant Info Fields (Priority: P2)

**Goal**: Tenant info only stores fields that are actively used by components with normalized business-centric names

**Independent Test**: Verify that only actively consumed fields (creditUnit, exchangeRate, displayFormat, endpoints, notices) are persisted and all existing UI functionality continues to work

### Implementation for User Story 2

- [X] T010 [P] [US2] Update `components/biz/tenant-select-card/index.tsx` to access tenant info via `useTenantInfoStore()` instead of `tenant.info`
- [X] T011 [P] [US2] Update `components/biz/tenant-select-card/model-usage-panel.tsx` to access tenant info via `useTenantInfoStore()` with normalized field names
- [X] T012 [P] [US2] Update `components/biz/tenant-select-card/token-list-panel.tsx` to access tenant info via `useTenantInfoStore()` with normalized field names
- [X] T013 [P] [US2] Update `components/biz/tenant-select-card/api-endpoints-panel.tsx` to access tenant info via `useTenantInfoStore()` with normalized field names (endpoints instead of api_info)
- [X] T014 [P] [US2] Update `components/biz-screen/popup-settings-screen/index.tsx` to access tenant info via `useTenantInfoStore()` with normalized field names
- [X] T015 [P] [US2] Update `lib/utils/quota-converter.ts` to access tenant info via `useTenantInfoStore()` with normalized field names (creditUnit, exchangeRate, displayFormat)
- [X] T016 [P] [US2] Update `lib/background/modules/usage-alert.ts` to access tenant info via `useTenantInfoStore()` with normalized field names
- [X] T017 [P] [US2] Update `hooks/use-tenant-data-refresh.ts` to update tenant info in `useTenantInfoStore()` instead of tenant store

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - all components use normalized fields from separate store

---

## Phase 5: User Story 3 - Platform Adapter for Tenant Info (Priority: P3)

**Goal**: Platform adapter for tenant info that normalizes platform-specific API responses, enabling future platform support

**Independent Test**: Verify that the newapi adapter correctly normalizes /api/status response to the common tenant info structure, and that new platforms can be added by implementing the adapter interface without store modifications

### Implementation for User Story 3

- [X] T018 [US3] Verify `normalizeTenantInfo()` implementation in lib/api/adapters/newapi-adapter.ts handles unknown input types and returns empty object for invalid data
- [X] T019 [US3] Verify `TenantAPIService.getStatus()` in lib/api/services/tenant-api-service.ts uses adapter for normalization before storage
- [X] T020 [US3] Verify adapter pattern enables future platform support by checking that no platform-specific logic exists in stores or components

**Checkpoint**: All user stories should now be independently functional - adapter pattern is complete and extensible

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T021 [P] Run `bun run compile` to verify no TypeScript errors
- [X] T022 [P] Manual test: Add a new tenant and verify config persists in tenant store
- [X] T023 [P] Manual test: Fetch tenant info and verify data appears in UI with normalized field names
- [X] T024 [P] Manual test: Switch tenants and verify correct tenant info displays
- [X] T025 [P] Manual test: Delete tenant and verify tenant info is cleaned up from runtime store
- [X] T026 [P] Manual test: Test with missing fields and verify graceful degradation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for store infrastructure but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Validates adapter pattern from US1 and US2

### Within Each User Story

- US1: Service update before store cleanup logic
- US2: All component updates can run in parallel (marked [P])
- US3: Verification tasks can run in parallel (marked [P])

### Parallel Opportunities

- All Setup tasks (T001-T003) can run in parallel (same file, but independent changes)
- All Foundational tasks marked [P] (T005, T006) can run in parallel
- Once Foundational phase completes, US1 can start
- Once US1 completes, all US2 component updates (T010-T017) can run in parallel
- All US3 verification tasks (T018-T020) can run in parallel
- All Polish tasks (T021-T026) can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all component updates for User Story 2 together:
Task: "Update components/biz/tenant-select-card/index.tsx"
Task: "Update components/biz/tenant-select-card/model-usage-panel.tsx"
Task: "Update components/biz/tenant-select-card/token-list-panel.tsx"
Task: "Update components/biz/tenant-select-card/api-endpoints-panel.tsx"
Task: "Update components/biz-screen/popup-settings-screen/index.tsx"
Task: "Update lib/utils/quota-converter.ts"
Task: "Update lib/background/modules/usage-alert.ts"
Task: "Update hooks/use-tenant-data-refresh.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (type definitions)
2. Complete Phase 2: Foundational (adapter & store infrastructure) - CRITICAL
3. Complete Phase 3: User Story 1 (separation of config and runtime data)
4. **STOP and VALIDATE**: Test that tenant config persists separately from runtime info
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (all components use normalized fields)
4. Add User Story 3 → Test independently → Deploy/Demo (adapter pattern validated)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (service & store updates)
   - Developer B: User Story 2 (component updates) - can start after US1 completes
   - Developer C: User Story 3 (adapter validation) - can start after US1 completes
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No tests included (not requested per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total: 26 tasks (3 setup, 4 foundational, 2 US1, 8 US2, 3 US3, 6 polish)
- Parallel opportunities: 18 tasks can run in parallel within their phases
- Suggested MVP scope: Phase 1 + Phase 2 + Phase 3 (User Story 1 only)
