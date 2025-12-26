# Tasks: Platform API Service Abstraction

**Input**: Design documents from `/specs/002-platform-api-service/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Not explicitly requested in spec - test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in descriptions

## Path Conventions

Based on plan.md structure:
- Services: `lib/api/services/`
- Errors: `lib/api/errors/`
- Adapters: `lib/api/adapters/`
- Types: `lib/api/adapters/types.ts`, `types/`

---

## Phase 1: Setup

**Purpose**: Create directory structure and foundational types

- [x] T001 Create errors directory at `lib/api/errors/`
- [x] T002 [P] Create service types file at `lib/api/services/types.ts` with `IPlatformService` interface per data-model.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Error types that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Create `PlatformAPIError` class in `lib/api/errors/platform-api-error.ts` per data-model.md
- [x] T004 [P] Create `AdapterTransformError` class in `lib/api/errors/adapter-transform-error.ts` per data-model.md
- [x] T005 [P] Create `PlatformNotSupportedError` class in `lib/api/errors/platform-not-supported-error.ts` per data-model.md
- [x] T006 Create errors index export at `lib/api/errors/index.ts`

**Checkpoint**: Foundation ready - error types available for all services

---

## Phase 3: User Story 1 - Business Layer Calls Generic API Service (Priority: P1) 🎯 MVP

**Goal**: Provide a generic `PlatformAPIService` that routes by `platformType` to platform-specific services

**Independent Test**: Call `PlatformAPIService` with platformType "newapi" and verify unified types returned

### Implementation for User Story 1

- [x] T007 [US1] Rename `lib/api/services/tenant-api-service.ts` to `lib/api/services/newapi-service.ts` and update class name to `NewAPIService`
- [x] T008 [US1] Update `NewAPIService` to wrap API errors in `PlatformAPIError` in `lib/api/services/newapi-service.ts`
- [x] T009 [US1] Create `PlatformAPIService` with registry-based routing in `lib/api/services/platform-api-service.ts`
- [x] T010 [US1] Implement default platformType fallback to 'newapi' with console.warn in `lib/api/services/platform-api-service.ts`
- [x] T011 [US1] Update services index to export only `PlatformAPIService` in `lib/api/services/index.ts`
- [x] T012 [US1] Update main API exports in `lib/api/index.ts` to expose `PlatformAPIService` and error types

**Checkpoint**: User Story 1 complete - business layer can use `PlatformAPIService`

---

## Phase 4: User Story 2 - Platform Service Uses Data Adapter (Priority: P2)

**Goal**: Ensure each platform service uses its adapter to transform responses

**Independent Test**: Verify platform service methods call adapter before returning

### Implementation for User Story 2

- [x] T013 [US2] Verify `NewAPIService` uses `NewAPIAdapter` for all methods in `lib/api/services/newapi-service.ts`
- [x] T014 [US2] Add `AdapterTransformError` handling in adapter calls in `lib/api/services/newapi-service.ts`

**Checkpoint**: User Story 2 complete - adapter integration verified

---

## Phase 5: User Story 3 - Unified Data Types Returned (Priority: P3)

**Goal**: All API calls return identical unified types regardless of platform

**Independent Test**: Call same method, verify return type conforms to unified schema

### Implementation for User Story 3

- [x] T015 [US3] Verify all `NewAPIService` methods return unified types (TenantInfo, Balance, etc.) in `lib/api/services/newapi-service.ts`

**Checkpoint**: User Story 3 complete - type consistency guaranteed

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T016 Run `bun run compile` to verify TypeScript compilation passes
- [x] T017 Verify no direct imports of `NewAPIService` in business layer code
- [x] T018 Validate implementation matches quickstart.md usage examples

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on User Story 1 (uses NewAPIService)
- **User Story 3 (Phase 5)**: Depends on User Story 1 (verifies types)
- **Polish (Phase 6)**: Depends on all user stories

### User Story Dependencies

- **User Story 1 (P1)**: Core routing - must complete first
- **User Story 2 (P2)**: Adapter integration - depends on US1 services existing
- **User Story 3 (P3)**: Type verification - depends on US1 services existing

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T001, T002 can run in parallel
```

**Phase 2 (Foundational)**:
```
T003, T004, T005 can run in parallel (different files)
```

**Phase 3 (User Story 1)**:
```
T007 first (rename file)
After T007: T008 (same file)
After T008: T009, T010 (platform service)
```

---

## Parallel Example: Foundational Phase

```bash
# Launch all error types together:
Task: "Create PlatformAPIError in lib/api/errors/platform-api-error.ts"
Task: "Create AdapterTransformError in lib/api/errors/adapter-transform-error.ts"
Task: "Create PlatformNotSupportedError in lib/api/errors/platform-not-supported-error.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test `PlatformAPIService` with newapi tenant
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. User Story 1 → Business layer can use generic service (MVP!)
3. User Story 2 → Adapter integration verified
4. User Story 3 → Type consistency guaranteed
5. Polish → Production ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Existing `TenantAPIService` is refactored to `NewAPIService`
- No OneAPI service - only newapi platform supported
- No PlatformType extension needed
- No tests included (not requested in spec)
- Commit after each task or logical group
