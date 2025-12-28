# Tasks: Platform Service Response Type Definitions

**Input**: Design documents from `/specs/001-service-response-types/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Tests**: Not requested in specification - all validation is through TypeScript compilation (`bun run compile`)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and type module structure

- [X] T001 Create platforms directory structure at lib/api/types/platforms/
- [X] T002 [P] Create index.ts barrel export file at lib/api/types/platforms/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core platform type definitions that MUST be complete before ANY user story can be validated

**⚠️ CRITICAL**: No adapter or service type updates can begin until platform types exist

### Platform Type Definitions

- [X] T003 [P] Create NewAPI response types in lib/api/types/platforms/newapi-response-types.ts (NewAPIBalanceResponse, NewAPICostData, NewAPICostsResponse, NewAPIToken, NewAPITokensResponse, NewAPITokenGroup, NewAPITokenGroupsResponse, NewAPITenantInfoResponse)
- [X] T004 [P] Create Cubence response types in lib/api/types/platforms/cubence-response-types.ts (CubenceBalanceResponse, CubenceCostData, CubenceCostsResponse, CubenceToken, CubenceTokensResponse, CubenceTokenGroup, CubenceTokenGroupsResponse, CubenceTenantInfoResponse)
- [X] T005 [P] Create PackyCode Codex response types in lib/api/types/platforms/packycode-codex-response-types.ts (PackyCodeCodexBalanceResponse, PackyCodeCodexCostData, PackyCodeCodexCostsResponse, PackyCodeCodexToken, PackyCodeCodexTokensResponse, PackyCodeCodexTokenGroup, PackyCodeCodexTokenGroupsResponse, PackyCodeCodexTenantInfoResponse)

### Response Aggregates

- [X] T006 Create Response Aggregate types in lib/api/types/platforms/response-aggregates.ts (BalanceSources, CostSources, TokenSources, TenantInfoSources for all platforms)

### Platform Type Mapping Utility

- [X] T007 Create PlatformResponseTypeMap and PlatformResponse utility types in lib/api/types/platforms/index.ts

**Checkpoint**: Foundation ready - all platform types defined and exportable. Validate with `bun run compile`

---

## Phase 3: User Story 1 - Developer Integration with Type Safety (Priority: P1) 🎯 MVP

**Goal**: Developers can import platform-specific response types and get full IDE autocomplete + compile-time type safety when working with raw API responses

**Independent Test**:
1. Import platform types in a new file
2. Verify IDE autocomplete shows all expected fields
3. Attempt to access non-existent field - should show TypeScript error
4. Run `bun run compile` - should pass with no errors

### Implementation for User Story 1

- [X] T008 [P] [US1] Update index.ts exports in lib/api/types/platforms/index.ts to re-export all platform types
- [X] T009 [P] [US1] Add JSDoc comments to non-obvious fields in lib/api/types/platforms/newapi-response-types.ts (quota, used_quota, ratio, aff_* fields)
- [X] T010 [P] [US1] Add JSDoc comments to non-obvious fields in lib/api/types/platforms/cubence-response-types.ts (available_credit vs total_credit, rate, category)
- [X] T011 [P] [US1] Add JSDoc comments to non-obvious fields in lib/api/types/platforms/packycode-codex-response-types.ts (remaining_quota vs total_quota, credit_ratio, token_group)

**Checkpoint**: User Story 1 complete - developers can import types and get full autocomplete. Validate by:
1. Opening any platform type file in IDE
2. Creating test import: `import { NewAPIBalanceResponse } from '@/lib/api/types/platforms'`
3. Verifying autocomplete works for all fields
4. Running `bun run compile`

---

## Phase 4: User Story 2 - Adapter Maintainability and Refactoring (Priority: P2)

**Goal**: Platform adapters use typed source parameters instead of `unknown`, enabling TypeScript to catch field access errors when APIs change

**Independent Test**:
1. Modify a platform response type (simulate API change)
2. TypeScript should immediately highlight affected adapter code
3. Revert change and verify compilation passes

### Implementation for User Story 2

- [X] T012 [US2] Update IRawPlatformService interface in lib/api/services/types.ts to use platform-specific return types
- [X] T013 [P] [US2] Update newapi-service.ts in lib/api/services/newapi-service.ts to import and use NewAPI response types
- [X] T014 [P] [US2] Update cubence-service.ts in lib/api/services/cubence-service.ts to import and use Cubence response types
- [X] T015 [P] [US2] Update packycode-codex-service.ts in lib/api/services/packycode-codex-service.ts to import and use PackyCode Codex response types
- [X] T016 [US2] Update PlatformAdapter interface in lib/api/adapters/types.ts to use typed source parameters from Response Aggregates
- [X] T017 [P] [US2] Update newapi-adapter.ts in lib/api/adapters/newapi-adapter.ts to use NewAPI*Sources types
- [ ] T018 [P] [US2] Update cubence-adapter.ts in lib/api/adapters/cubence-adapter.ts to use Cubence*Sources types
- [ ] T019 [P] [US2] Update packycode-codex-adapter.ts in lib/api/adapters/packycode-codex-adapter.ts to use PackyCodeCodex*Sources types

**Checkpoint**: User Story 2 complete - adapters have typed inputs. Validate by:
1. Running `bun run compile` - should pass
2. Test drift detection: temporarily rename a field in a response type
3. Verify TypeScript errors appear in corresponding adapter
4. Revert the field rename

---

## Phase 5: User Story 3 - Cross-Platform Consistency Validation (Priority: P3)

**Goal**: Developers can verify that all platforms provide sufficient data for normalized entity requirements by reviewing type definitions

**Independent Test**:
1. Review each platform's response types against normalized entity requirements
2. Trace each normalized field back to at least one raw field from each platform
3. Identify any platforms lacking necessary raw data for a normalized field

### Implementation for User Story 3

- [X] T020 [US3] Update orchestrator types in lib/api/orchestrators/types.ts to use typed Response Aggregates instead of unknown
- [ ] T021 [P] [US3] Verify type coverage for Balance normalized entity - ensure all platforms have mappable fields in their BalanceResponse types
- [ ] T022 [P] [US3] Verify type coverage for Cost normalized entity - ensure all platforms have mappable fields in their CostsResponse types
- [ ] T023 [P] [US3] Verify type coverage for Token normalized entity - ensure all platforms have mappable fields in their TokensResponse types
- [ ] T024 [P] [US3] Verify type coverage for TenantInfo normalized entity - ensure all platforms have mappable fields in their TenantInfoResponse types

**Checkpoint**: User Story 3 complete - all normalized entities have traceable field mappings. Validate by:
1. Running `bun run compile`
2. Reviewing JSDoc comments that document field mappings (e.g., "maps to remainingCredit")
3. Creating a field mapping table if gaps are found

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [ ] T025 Run full TypeScript compilation validation via `bun run compile`
- [ ] T026 Verify IDE autocomplete performance (< 100ms response per FR-018)
- [ ] T027 [P] Clean up any unused imports or types discovered during implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires platform types from US1 phase but those are in Foundational
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires typed orchestrators which come from US2, so best done after US2

### Within Each User Story

- Types/interfaces before implementations
- Export updates before imports
- Core types before utility types
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (T003, T004, T005)
- Once Foundational phase completes, all user story JSDoc tasks (T009, T010, T011) can run in parallel
- Service updates (T013, T014, T015) can run in parallel
- Adapter updates (T017, T018, T019) can run in parallel
- Coverage verification tasks (T021, T022, T023, T024) can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all platform type definitions together:
Task: "Create NewAPI response types in lib/api/types/platforms/newapi-response-types.ts"
Task: "Create Cubence response types in lib/api/types/platforms/cubence-response-types.ts"
Task: "Create PackyCode Codex response types in lib/api/types/platforms/packycode-codex-response-types.ts"
```

## Parallel Example: User Story 2 Services

```bash
# Launch all service updates together:
Task: "Update newapi-service.ts in lib/api/services/newapi-service.ts"
Task: "Update cubence-service.ts in lib/api/services/cubence-service.ts"
Task: "Update packycode-codex-service.ts in lib/api/services/packycode-codex-service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T007)
3. Complete Phase 3: User Story 1 (T008-T011)
4. **STOP and VALIDATE**: Run `bun run compile` + verify IDE autocomplete
5. Platform types are usable for development

### Incremental Delivery

1. Complete Setup + Foundational → Platform types exist
2. Add User Story 1 → Types exportable with JSDoc → MVP Ready
3. Add User Story 2 → Services/adapters typed → Full type safety
4. Add User Story 3 → Orchestrators typed → Complete coverage
5. Each story adds value without breaking previous stories

### Single Developer Strategy

1. Complete Setup (T001-T002)
2. Complete Foundational - types in parallel (T003-T005), then T006, T007
3. Complete User Story 1 (T008-T011)
4. Validate MVP with `bun run compile`
5. Continue with User Story 2 (T012-T019)
6. Continue with User Story 3 (T020-T024)
7. Final validation (T025-T027)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable via `bun run compile`
- TypeScript compilation is the validation mechanism (no runtime tests needed)
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
