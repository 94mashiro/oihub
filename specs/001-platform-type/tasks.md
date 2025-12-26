# Tasks: 平台类型字段

**Input**: Design documents from `/specs/001-platform-type/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested - test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing infrastructure and type definitions

- [X] T001 Verify PlatformType and PlatformAdapter types exist in lib/api/adapters/types.ts
- [X] T002 [P] Verify Tenant interface includes optional platformType field in types/tenant.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add error handling to getAdapter function when adapter not found in lib/api/adapters/index.ts
- [X] T004 [P] Add DEFAULT_PLATFORM_TYPE constant in lib/constants/tenants.ts (value: "newapi")

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 添加账号时指定平台类型 (Priority: P1)

**Goal**: 用户在添加新账号时选择平台类型，系统保存该信息

**Independent Test**: 添加一个新账号并验证其 platformType 字段被正确保存

### Implementation for User Story 1

- [X] T005 [US1] Add platform type selector UI component to tenant add form in entrypoints/popup/components/
- [X] T006 [US1] Update tenant-store addTenant action to include platformType with default fallback in lib/state/tenant-store.ts
- [X] T007 [US1] Ensure platformType is persisted when saving new tenant via WXT storage

**Checkpoint**: User Story 1 complete - new tenants can be added with platform type selection

---

## Phase 4: User Story 2 - 获取数据时使用正确的适配器 (Priority: P1)

**Goal**: 系统根据账号的 platformType 字段选择对应的适配器进行数据转换

**Independent Test**: 为已保存的账号获取余额数据，验证系统使用了正确的适配器

### Implementation for User Story 2

- [X] T008 [US2] Update TenantAPIService constructor to read platformType from tenant and select adapter in lib/api/services/tenant-api-service.ts
- [X] T009 [US2] Apply default platformType ("newapi") when tenant.platformType is undefined in lib/api/services/tenant-api-service.ts
- [X] T010 [US2] Handle adapter not found error with user-visible error message in lib/api/services/tenant-api-service.ts

**Checkpoint**: User Story 2 complete - data fetching uses correct adapter based on platformType

---

## Phase 5: User Story 3 - 编辑账号时修改平台类型 (Priority: P2)

**Goal**: 用户在编辑已有账号时可以修改平台类型

**Independent Test**: 编辑一个已有账号的平台类型并验证更改被保存

### Implementation for User Story 3

- [X] T011 [US3] Add platform type selector to tenant edit form in entrypoints/popup/components/
- [X] T012 [US3] Update tenant-store updateTenant action to handle platformType changes in lib/state/tenant-store.ts

**Checkpoint**: User Story 3 complete - existing tenants can have their platform type modified

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T013 Verify backward compatibility with tenants that have no platformType field
- [X] T014 Run quickstart.md validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority and can proceed in parallel
  - US3 (P2) can start after Foundational but is lower priority
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May reuse UI component from US1

### Within Each User Story

- UI components before store updates
- Store updates before persistence verification
- Core implementation before integration

### Parallel Opportunities

- T001 and T002 can run in parallel (Setup phase)
- T003 and T004 can run in parallel (Foundational phase)
- US1 and US2 can be worked on in parallel after Foundational phase
- T011 may reuse component from T005 (consider implementing US1 first)

---

## Parallel Example: Foundational Phase

```bash
# Launch foundational tasks together:
Task: "Add error handling to getAdapter function in lib/api/adapters/index.ts"
Task: "Add DEFAULT_PLATFORM_TYPE constant in lib/constants/tenants.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (verify existing types)
2. Complete Phase 2: Foundational (error handling + constants)
3. Complete Phase 3: User Story 1 (add tenant with platformType)
4. Complete Phase 4: User Story 2 (use correct adapter)
5. **STOP and VALIDATE**: Test adding tenant and fetching data
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Can add tenants with platformType
3. Add User Story 2 -> Test independently -> Data fetching works correctly
4. Add User Story 3 -> Test independently -> Can edit platformType
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- UI components must use coss Select component with appropriate className overrides for styling
