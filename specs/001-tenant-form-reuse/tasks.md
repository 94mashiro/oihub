# Tasks: Tenant Form Reuse

**Input**: Design documents from `/specs/001-tenant-form-reuse/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: No automated tests required (manual testing per plan.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Browser extension**: `components/biz-screen/` for screen components
- Paths based on plan.md structure

---

## Phase 1: Setup

**Purpose**: Create shared component directory structure

- [x] T001 Create tenant-form directory at components/biz-screen/tenant-form/

---

## Phase 2: User Story 1 - Developer Maintains Tenant Form (Priority: P1) 🎯 MVP

**Goal**: Extract shared form fields into a single reusable component

**Independent Test**: Modify a form field validation and verify it applies to both create and edit screens

### Implementation for User Story 1

- [x] T002 [US1] Define TenantFormProps and TenantFormData interfaces in components/biz-screen/tenant-form/index.tsx
- [x] T003 [US1] Extract PROVIDER_PRESETS and PLATFORM_TYPE_OPTIONS constants to components/biz-screen/tenant-form/index.tsx
- [x] T004 [US1] Implement TenantForm component with form fields (name, platformType, url, token, userId) in components/biz-screen/tenant-form/index.tsx
- [x] T005 [US1] Add conditional presets section (mode === 'create' only) in components/biz-screen/tenant-form/index.tsx
- [x] T006 [US1] Add form validation and error display in components/biz-screen/tenant-form/index.tsx

**Checkpoint**: Shared TenantForm component is complete and ready for integration

---

## Phase 3: User Story 2 - User Creates New Tenant (Priority: P1)

**Goal**: Integrate shared form into create screen while preserving all functionality

**Independent Test**: Fill out create form, select preset, submit, verify tenant is created

### Implementation for User Story 2

- [x] T007 [US2] Refactor popup-tenant-create-screen to import TenantForm in components/biz-screen/popup-tenant-create-screen/index.tsx
- [x] T008 [US2] Replace inline form with TenantForm component (mode="create") in components/biz-screen/popup-tenant-create-screen/index.tsx
- [x] T009 [US2] Verify preset selection auto-populates name and URL fields
- [x] T010 [US2] Verify form submission creates tenant and navigates back

**Checkpoint**: Create tenant screen works identically to before refactoring

---

## Phase 4: User Story 3 - User Edits Existing Tenant (Priority: P1)

**Goal**: Integrate shared form into edit screen while preserving all functionality

**Independent Test**: Navigate to edit screen, modify fields, submit, verify tenant is updated

### Implementation for User Story 3

- [x] T011 [US3] Refactor popup-tenant-edit-screen to import TenantForm in components/biz-screen/popup-tenant-edit-screen/index.tsx
- [x] T012 [US3] Replace inline form with TenantForm component (mode="edit", initialData from tenant) in components/biz-screen/popup-tenant-edit-screen/index.tsx
- [x] T013 [US3] Verify form pre-populates with existing tenant data
- [x] T014 [US3] Verify form submission updates tenant and navigates back
- [x] T015 [US3] Verify "not found" state still works for invalid tenant ID

**Checkpoint**: Edit tenant screen works identically to before refactoring

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and validation

- [x] T016 Remove duplicate code from popup-tenant-create-screen/index.tsx (PROVIDER_PRESETS, form fields)
- [x] T017 Remove duplicate code from popup-tenant-edit-screen/index.tsx (form fields)
- [x] T018 Run bun run compile to verify no type errors
- [ ] T019 Manual testing: verify all acceptance scenarios from spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup - creates the shared component
- **User Story 2 (Phase 3)**: Depends on User Story 1 - integrates shared component into create screen
- **User Story 3 (Phase 4)**: Depends on User Story 1 - integrates shared component into edit screen
- **Polish (Phase 5)**: Depends on User Stories 2 and 3 being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies - creates shared component
- **User Story 2 (P1)**: Depends on US1 (needs TenantForm component)
- **User Story 3 (P1)**: Depends on US1 (needs TenantForm component), can run parallel with US2

### Parallel Opportunities

- T007-T010 (US2) and T011-T015 (US3) can run in parallel after US1 is complete
- Both screens can be refactored simultaneously by different developers

---

## Parallel Example: After User Story 1

```bash
# After TenantForm component is complete, both integrations can run in parallel:
Task: "Refactor popup-tenant-create-screen to import TenantForm"
Task: "Refactor popup-tenant-edit-screen to import TenantForm"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: User Story 1 (shared component)
3. **STOP and VALIDATE**: TenantForm component renders correctly in isolation
4. Proceed to integration

### Incremental Delivery

1. Complete Setup → Directory ready
2. Complete User Story 1 → Shared component ready
3. Complete User Story 2 → Create screen works → Test manually
4. Complete User Story 3 → Edit screen works → Test manually
5. Complete Polish → Code cleanup, type check

---

## Notes

- No automated tests required per plan.md (manual testing only)
- All user stories are P1 priority - implement in order
- US2 and US3 can be parallelized after US1 is complete
- Commit after each task or logical group
- Run `bun run compile` frequently to catch type errors early
