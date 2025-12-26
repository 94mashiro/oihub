# Tasks: Dataflow Decoupling

**Input**: Design documents from `/specs/001-dataflow-decoupling/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested in feature specification - test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure (WXT browser extension):
- Types/interfaces: `lib/api/orchestrators/types.ts`, `lib/api/services/types.ts`, `lib/api/adapters/types.ts`
- Orchestrators: `lib/api/orchestrators/`
- Services: `lib/api/services/`
- Adapters: `lib/api/adapters/`
- Errors: `lib/errors/`
- Hooks: `hooks/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new directories and foundational type definitions

- [X] T001 Create orchestrators directory at lib/api/orchestrators/
- [X] T002 Create errors directory at lib/errors/
- [X] T003 [P] Define orchestrator types (RawAPIResponse, EntityMeta, OrchestratorResult, OrchestratorError, DomainOrchestrator, *Sources, *WithMeta) in lib/api/orchestrators/types.ts
- [X] T004 [P] Define TransformationError class in lib/errors/transformation-error.ts
- [X] T005 [P] Define APIError class in lib/errors/api-error.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update existing interfaces to support decoupled architecture - MUST complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Update IRawPlatformService interface in lib/api/services/types.ts to return RawAPIResponse instead of normalized types
- [X] T007 Add PlatformAdapterV2 interface with source bags to lib/api/adapters/types.ts
- [X] T008 Create orchestrators index file with exports in lib/api/orchestrators/index.ts
- [X] T009 Add getRawService factory function to lib/api/services/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Developer Adds New Platform Support (Priority: P1) 🎯 MVP

**Goal**: Enable independent platform implementations where services only fetch raw data and adapters transform independently

**Independent Test**: Add a mock platform and verify only platform-specific files (service + adapter) need to be created, with no changes to stores or hooks

### Implementation for User Story 1

- [X] T010 [US1] Refactor NewAPIService to return RawAPIResponse (remove adapter calls) in lib/api/services/newapi-service.ts
- [X] T011 [US1] Update NewAPIAdapter to implement PlatformAdapterV2 with source bags in lib/api/adapters/newapi-adapter.ts
- [X] T012 [US1] Implement BalanceOrchestrator in lib/api/orchestrators/balance-orchestrator.ts
- [X] T013 [US1] Implement CostOrchestrator in lib/api/orchestrators/cost-orchestrator.ts
- [X] T014 [US1] Implement TokenOrchestrator in lib/api/orchestrators/token-orchestrator.ts
- [X] T015 [US1] Implement TenantInfoOrchestrator in lib/api/orchestrators/tenant-info-orchestrator.ts
- [X] T016 [US1] Update use-tenant-data-refresh.ts hook to use orchestrators instead of PlatformAPIService in hooks/use-tenant-data-refresh.ts
- [X] T017 [US1] Update use-cost-loader.ts hook to use CostOrchestrator in hooks/use-cost-loader.ts
- [X] T018 [US1] Update use-tokens-loader.ts hook to use TokenOrchestrator in hooks/use-tokens-loader.ts

**Checkpoint**: NewAPI platform works with decoupled architecture; data flows service → adapter → store without layer coupling

---

## Phase 4: User Story 2 - Platform Requires Multi-API Data Merge (Priority: P1)

**Goal**: Enable adapters to receive and merge data from multiple API endpoints into a single normalized entity

**Independent Test**: Create a platform where balance data comes from two mock endpoints and verify adapter correctly merges both responses

### Implementation for User Story 2

- [X] T019 [US2] Extend BalanceOrchestrator to support multi-source fetching with Promise.allSettled in lib/api/orchestrators/balance-orchestrator.ts
- [X] T020 [US2] Add partial data handling to BalanceOrchestrator (return partial result when some sources fail) in lib/api/orchestrators/balance-orchestrator.ts
- [X] T021 [US2] Update NewAPIAdapter.normalizeBalance to handle optional usage/credits sources in lib/api/adapters/newapi-adapter.ts
- [X] T022 [US2] Add EntityMeta population with completeness and errors to all orchestrators in lib/api/orchestrators/

**Checkpoint**: Multi-API merge works; partial failures return partial data with error metadata

---

## Phase 5: User Story 3 - Developer Modifies API Response Format (Priority: P2)

**Goal**: Demonstrate that API response format changes only require adapter modifications

**Independent Test**: Change a mock API response format and verify only the adapter file needs modification

### Implementation for User Story 3

- [X] T023 [P] [US3] Refactor CubenceService to return RawAPIResponse in lib/api/services/cubence-service.ts
- [X] T024 [P] [US3] Refactor PackyCodeCodexService to return RawAPIResponse in lib/api/services/packycode-codex-service.ts
- [X] T025 [US3] Update CubenceAdapter to implement PlatformAdapterV2 with source bags in lib/api/adapters/cubence-adapter.ts
- [X] T026 [US3] Update PackyCodeCodexAdapter to implement PlatformAdapterV2 with source bags in lib/api/adapters/packycode-codex-adapter.ts

**Checkpoint**: All platforms use decoupled architecture; adapter changes isolated from services

---

## Phase 6: User Story 4 - System Handles Platform-Specific Error Responses (Priority: P2)

**Goal**: Decouple error handling so each platform defines its own error parsing

**Independent Test**: Simulate platform-specific error responses and verify correct error type identification

### Implementation for User Story 4

- [X] T027 [US4] Add platform-specific error parsing to NewAPIService in lib/api/services/newapi-service.ts
- [X] T028 [US4] Add platform-specific error parsing to CubenceService in lib/api/services/cubence-service.ts
- [X] T029 [US4] Add platform-specific error parsing to PackyCodeCodexService in lib/api/services/packycode-codex-service.ts
- [X] T030 [US4] Ensure orchestrators normalize errors from different platforms into OrchestratorError format in lib/api/orchestrators/

**Checkpoint**: Platform-specific errors correctly parsed and normalized

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and validation

- [X] T031 [P] Remove deprecated PlatformAPIService methods that called adapters directly in lib/api/services/platform-api-service.ts
- [X] T032 [P] Update background usage-alert module to use orchestrators in lib/background/modules/usage-alert.ts
- [X] T033 Run bun run compile to verify type checking passes
- [X] T034 Verify backward compatibility - existing store data still works

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 but US2 extends US1's orchestrators
  - US3 and US4 are P2 and can proceed after US1/US2
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - establishes core decoupled architecture
- **User Story 2 (P1)**: Depends on US1 orchestrators existing - extends them for multi-source
- **User Story 3 (P2)**: Can start after US1 - applies pattern to remaining platforms
- **User Story 4 (P2)**: Can start after US1 - adds error handling layer

### Within Each User Story

- Services before adapters (services define raw response shape)
- Adapters before orchestrators (orchestrators use both)
- Orchestrators before hooks (hooks consume orchestrators)

### Parallel Opportunities

- T003, T004, T005 can run in parallel (different files)
- T023, T024 can run in parallel (different platform services)
- T031, T032 can run in parallel (different modules)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all type definitions together:
Task: "Define orchestrator types in lib/api/orchestrators/types.ts"
Task: "Define TransformationError class in lib/errors/transformation-error.ts"
Task: "Define APIError class in lib/errors/api-error.ts"
```

## Parallel Example: User Story 3

```bash
# Launch platform service refactors together:
Task: "Refactor CubenceService to return RawAPIResponse in lib/api/services/cubence-service.ts"
Task: "Refactor PackyCodeCodexService to return RawAPIResponse in lib/api/services/packycode-codex-service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test NewAPI platform with decoupled architecture
5. Verify: service returns raw data, adapter transforms independently, orchestrator coordinates

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test NewAPI decoupling → MVP complete
3. Add User Story 2 → Test multi-API merge → Enhanced capability
4. Add User Story 3 → All platforms decoupled → Full coverage
5. Add User Story 4 → Error handling decoupled → Production ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- FR-010 (backward compatibility) verified in T034
