# Tasks: i7Relay Platform Adapter/Service Framework

**Input**: Design documents from `/specs/001-i7relay-adapter/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Tests**: Not requested - framework code only, tests will be added when implementing actual logic.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Browser extension (WXT)
- **Base path**: `lib/api/` for API infrastructure

---

## Phase 1: Setup (Response Types)

**Purpose**: Create foundational response type definitions that all other components depend on

- [X] T001 [P] Create i7Relay response type definitions in `lib/api/types/platforms/i7relay-response-types.ts`
- [X] T002 Update platform types index to export i7relay types in `lib/api/types/platforms/index.ts`

**Checkpoint**: Response types available for import by service and adapter

---

## Phase 2: User Story 1 - Developer Adds i7Relay Tenant (Priority: P1) 🎯 MVP

**Goal**: 开发者能创建 i7Relay 类型租户，系统能正确实例化 I7RelayRawService

**Independent Test**: 创建 platformType 为 'i7relay' 的租户，验证 getRawService() 返回 I7RelayRawService 实例

### Implementation for User Story 1

- [X] T003 [US1] Create I7RelayRawService class in `lib/api/services/i7relay-service.ts`
- [X] T004 [US1] Register i7relay service factory in `lib/api/services/raw-service-factory.ts`

**Checkpoint**: `getRawService(tenant)` 能正确返回 I7RelayRawService 实例（方法抛出 NotImplementedError）

---

## Phase 3: User Story 2 - System Loads i7Relay Adapter (Priority: P2)

**Goal**: 系统能通过 i7relay adapter 进行数据标准化转换

**Independent Test**: 调用 i7relayAdapter.normalizeBalance({}) 返回符合 Balance 类型的默认值

### Implementation for User Story 2

- [X] T005 [US2] Create i7relayAdapter object in `lib/api/adapters/i7relay-adapter.ts`
- [X] T006 [US2] Update adapters index to export i7relay adapter in `lib/api/adapters/index.ts`

**Checkpoint**: `i7relayAdapter` 可导入，所有 5 个 normalize 方法可调用并返回正确类型

---

## Phase 4: User Story 3 - Orchestrators Support i7Relay (Priority: P3)

**Goal**: 所有 orchestrator 能识别 i7relay 平台类型并调用对应的 service/adapter

**Independent Test**: 创建 i7relay 租户，调用任意 orchestrator 的 refresh 方法不抛出 PlatformNotSupportedError

### Implementation for User Story 3

- [X] T007 [P] [US3] Add i7relay case to balance orchestrator in `lib/api/orchestrators/balance/balance-orchestrator.ts`
- [X] T008 [P] [US3] Add i7relay case to cost orchestrator in `lib/api/orchestrators/cost/cost-orchestrator.ts`
- [X] T009 [P] [US3] Add i7relay case to token orchestrator in `lib/api/orchestrators/token/token-orchestrator.ts`
- [X] T010 [P] [US3] Add i7relay case to tenant-info orchestrator in `lib/api/orchestrators/tenant-info/tenant-info-orchestrator.ts`

**Checkpoint**: 所有 4 个 orchestrator 都支持 i7relay 平台类型

---

## Phase 5: Polish & Validation

**Purpose**: 验证所有代码通过类型检查

- [X] T011 Run TypeScript type check with `bun run compile`
- [X] T012 Verify quickstart.md checklist items complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup (T001, T002)
- **User Story 2 (Phase 3)**: Depends on Setup (T001, T002) - can run parallel with US1
- **User Story 3 (Phase 4)**: Depends on US1 (T003, T004) and US2 (T005, T006)
- **Polish (Phase 5)**: Depends on all user stories complete

### User Story Dependencies

```
Phase 1: Setup
    │
    ├──────────────────┐
    ▼                  ▼
Phase 2: US1       Phase 3: US2
(Service)          (Adapter)
    │                  │
    └────────┬─────────┘
             ▼
      Phase 4: US3
    (Orchestrators)
             │
             ▼
      Phase 5: Polish
```

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T003/T004 (US1) and T005/T006 (US2) can run in parallel after Setup
- T007, T008, T009, T010 (US3) can ALL run in parallel (different orchestrator files)

---

## Parallel Example: User Story 3

```bash
# Launch all orchestrator updates together:
Task: "Add i7relay case to balance orchestrator in lib/api/orchestrators/balance/balance-orchestrator.ts"
Task: "Add i7relay case to cost orchestrator in lib/api/orchestrators/cost/cost-orchestrator.ts"
Task: "Add i7relay case to token orchestrator in lib/api/orchestrators/token/token-orchestrator.ts"
Task: "Add i7relay case to tenant-info orchestrator in lib/api/orchestrators/tenant-info/tenant-info-orchestrator.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: User Story 1 (T003-T004)
3. **STOP and VALIDATE**: Test service instantiation
4. Continue with US2 and US3

### Incremental Delivery

1. Setup → Response types ready
2. Add US1 → Service can be instantiated (MVP!)
3. Add US2 → Adapter can normalize data
4. Add US3 → Full orchestrator integration
5. Polish → Type check passes

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All service methods throw NotImplementedError (framework only)
- All adapter methods return default empty values
- Commit after each task or logical group
- Run `bun run compile` after each phase to catch type errors early
