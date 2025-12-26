# Feature Specification: Tenant Form Reuse

**Feature Branch**: `001-tenant-form-reuse`
**Created**: 2025-12-26
**Status**: Draft
**Input**: User description: "目前 popup-tenant-create-screen 和 popup-tenant-edit-screen 的表单组件是独立实现的，但是存在高度可复用的部分，我希望 edit-screen 页面的表单的实现能够复用 create-screen 的实现，这样就可以单独维护一份，成本降低一半"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Maintains Tenant Form (Priority: P1)

As a developer, I want to maintain a single tenant form implementation so that changes to form fields, validation, or styling only need to be made in one place.

**Why this priority**: This is the core value proposition - reducing maintenance cost by 50% through code consolidation.

**Independent Test**: Can be fully tested by modifying a form field (e.g., adding a new validation rule) and verifying it applies to both create and edit screens.

**Acceptance Scenarios**:

1. **Given** a shared tenant form component exists, **When** a developer modifies a form field's validation, **Then** the change is reflected in both create and edit screens without additional work.
2. **Given** a shared tenant form component exists, **When** a developer adds a new form field, **Then** the field appears in both create and edit screens with appropriate behavior.

---

### User Story 2 - User Creates New Tenant (Priority: P1)

As a user, I want to create a new tenant account with all required fields so that I can access API services.

**Why this priority**: Creating tenants is a core user workflow that must continue working after refactoring.

**Independent Test**: Can be fully tested by filling out the create form and verifying a new tenant is saved.

**Acceptance Scenarios**:

1. **Given** the user is on the create tenant screen, **When** they fill in all required fields and submit, **Then** a new tenant is created and they are navigated back.
2. **Given** the user is on the create tenant screen, **When** they select a provider preset, **Then** the name and URL fields are auto-populated.
3. **Given** the user is on the create tenant screen, **When** they submit with missing required fields, **Then** appropriate validation errors are displayed.

---

### User Story 3 - User Edits Existing Tenant (Priority: P1)

As a user, I want to edit an existing tenant's configuration so that I can update credentials or settings.

**Why this priority**: Editing tenants is a core user workflow that must continue working after refactoring.

**Independent Test**: Can be fully tested by modifying a tenant's fields and verifying changes are persisted.

**Acceptance Scenarios**:

1. **Given** the user is on the edit tenant screen with a valid tenant ID, **When** they modify fields and submit, **Then** the tenant is updated and they are navigated back.
2. **Given** the user is on the edit tenant screen, **When** the tenant ID does not exist, **Then** an appropriate "not found" message is displayed.
3. **Given** the user is on the edit tenant screen, **When** they submit with invalid data, **Then** appropriate validation errors are displayed.

---

### Edge Cases

- What happens when the store is not ready? The form should show a loading state.
- What happens when submission fails? An error message should be displayed without losing form data.
- What happens when navigating to edit with an invalid tenant ID? A "not found" state should be shown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a shared form component that handles both create and edit modes.
- **FR-002**: The shared form MUST support all existing fields: name, URL, token, user ID, and platform type.
- **FR-003**: The shared form MUST support provider presets (quick selection) in create mode.
- **FR-004**: The shared form MUST pre-populate fields with existing tenant data in edit mode.
- **FR-005**: The shared form MUST display appropriate validation errors for required fields.
- **FR-006**: The shared form MUST support disabled state during submission.
- **FR-007**: The create screen MUST generate a new UUID for the tenant ID.
- **FR-008**: The edit screen MUST preserve the existing tenant ID when updating.
- **FR-009**: Both screens MUST display submission errors without losing form data.
- **FR-010**: Both screens MUST navigate back on successful submission.

### Key Entities

- **TenantFormData**: Represents the form state containing name, url, token, userId, and platformType fields.
- **TenantFormMode**: Distinguishes between "create" and "edit" modes, affecting form behavior (presets availability, initial values, submit action).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Form field changes require modification in only one location instead of two.
- **SC-002**: All existing create tenant functionality continues to work identically.
- **SC-003**: All existing edit tenant functionality continues to work identically.
- **SC-004**: Code duplication between create and edit screens is reduced by at least 70%.

## Assumptions

- The existing form field order and styling should be preserved.
- Provider presets are only relevant for create mode (not shown in edit mode).
- The platform type options are the same for both create and edit modes.
- Form validation rules are identical between create and edit modes.
- The header, footer, and frame structure remain screen-specific (only the form fields are shared).
