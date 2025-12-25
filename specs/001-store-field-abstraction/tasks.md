# Tasks: Store Field Abstraction for Cross-Platform Support

**Input**: Design documents from `/specs/001-store-field-abstraction/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested in feature specification - test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in descriptions

## Path Conventions

Based on plan.md structure:
- Adapters: `lib/api/adapters/`
- Stores: `lib/state/`
- Types: `lib/types/` and `types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create adapter layer directory and type definitions

- [X] T001 Create adapters directory at lib/api/adapters/
- [X] T002 [P] Create normalized types in lib/api/adapters/types.ts (Balance, Cost, Token, TokenGroup, PlatformType)
- [X] T003 [P] Create PlatformAdapter interface in lib/api/adapters/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement newapi adapter that all stores will use

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create newapi adapter in lib/api/adapters/newapi-adapter.ts implementing PlatformAdapter interface
- [X] T005 Add adapter registry/factory in lib/api/adapters/index.ts for platform type lookup
- [X] T006 Add migration utilities in lib/state/migrations.ts for version-based data migration

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Streamlined Store Data (Priority: P1) MVP

**Goal**: Reduce persisted store fields to only those actively used by components

**Independent Test**: Verify all persisted fields are referenced in components, extension loads without errors, UI displays data correctly

### Implementation for User Story 1

- [X] T007 [US1] Update Balance type in lib/state/balance-store.ts to use normalized Balance (remainingCredit, consumedCredit)
- [X] T008 [US1] Add balance migration function in lib/state/balance-store.ts (v1→v2: quota→remainingCredit, used_quota→consumedCredit)
- [X] T009 [US1] Update Cost type in lib/state/cost-store.ts to use normalized Cost (modelId, creditCost, tokenUsage)
- [X] T010 [US1] Add cost migration function in lib/state/cost-store.ts (v1→v2: model_name→modelId, quota→creditCost, token_used→tokenUsage)
- [X] T011 [US1] Update Token type in types/token.ts to use normalized Token (secretKey, label, lastUsedAt, creditConsumed, group)
- [X] T012 [US1] Update TokenGroup type in types/token.ts to use normalized TokenGroup (description, multiplier)
- [X] T013 [US1] Add token migration function in lib/state/token-store.ts (v1→v2: key→secretKey, name→label, etc.)
- [X] T014 [US1] Update component selectors in entrypoints/popup/ to use new field names
- [X] T015 [US1] Run bun run compile to verify type safety

**Checkpoint**: User Story 1 complete - stores use streamlined types, existing UI works

---

## Phase 4: User Story 2 - Platform Adapter Architecture (Priority: P2)

**Goal**: Enable new platform integrations without modifying core store logic

**Independent Test**: Implement mock adapter, verify it integrates with stores without store modifications

### Implementation for User Story 2

- [X] T016 [US2] Integrate newapi adapter into TenantAPIService in lib/api/services/tenant-api-service.ts
- [X] T017 [US2] Update getSelfInfo() to use adapter.normalizeBalance() in lib/api/services/tenant-api-service.ts
- [X] T018 [US2] Update getCostData() to use adapter.normalizeCosts() in lib/api/services/tenant-api-service.ts
- [X] T019 [US2] Update getTokens() to use adapter.normalizeTokens() in lib/api/services/tenant-api-service.ts
- [X] T020 [US2] Update getTokenGroups() to use adapter.normalizeTokenGroups() in lib/api/services/tenant-api-service.ts
- [X] T021 [US2] Add graceful error handling for adapter normalization failures in lib/api/services/tenant-api-service.ts

**Checkpoint**: User Story 2 complete - API responses normalized through adapter layer

---

## Phase 5: User Story 3 - Tenant Platform Configuration (Priority: P3)

**Goal**: Allow users to specify platform type per tenant

**Independent Test**: Add tenant with platform selector, verify correct adapter used for API calls

### Implementation for User Story 3

- [X] T022 [US3] Add platformType field to Tenant type in lib/state/tenant-store.ts
- [X] T023 [US3] Add tenant migration function in lib/state/tenant-store.ts (add platformType: 'newapi' default)
- [X] T024 [US3] Update TenantAPIService constructor to accept platformType and select adapter in lib/api/services/tenant-api-service.ts
- [X] T025 [US3] Update API service instantiation to pass tenant's platformType in lib/api/index.ts

**Checkpoint**: User Story 3 complete - tenants can specify platform type

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [X] T026 Run bun run compile to verify all types pass
- [X] T027 Run bun run dev to verify extension loads correctly
- [X] T028 Verify data migration works by loading extension with existing stored data
- [X] T029 Verify UI displays balance, cost, and token data correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Builds on US1 types but independently testable
- **User Story 3 (P3)**: Can start after Foundational - Depends on US2 adapter integration

### Within Each User Story

- Type definitions before store updates
- Store updates before service integration
- Service integration before UI updates

### Parallel Opportunities

- T002 and T003 can run in parallel (different sections of same file)
- T007-T013 (US1 type updates) can be parallelized across different files
- T016-T020 (US2 service updates) must be sequential (same file)

---

## Parallel Example: User Story 1

```bash
# Launch type updates in parallel:
Task: "Update Balance type in lib/state/balance-store.ts"
Task: "Update Cost type in lib/state/cost-store.ts"
Task: "Update Token type in types/token.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify stores use streamlined types, UI works
5. Deploy if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. User Story 1 → Test independently → Deploy (MVP!)
3. User Story 2 → Test independently → Deploy
4. User Story 3 → Test independently → Deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
