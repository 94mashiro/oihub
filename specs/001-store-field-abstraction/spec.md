# Feature Specification: Store Field Abstraction for Cross-Platform Support

**Feature Branch**: `001-store-field-abstraction`
**Created**: 2025-12-25
**Status**: Draft
**Input**: User description: "精简 store 存储数据结构，从组件消费侧分析字段使用情况，设计跨平台通用解决方案，抽象 newapi 字段以支持平台扩展"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Streamlined Store Data (Priority: P1)

As a developer maintaining the extension, I want the store to only persist fields that are actually used by components, so that storage is efficient and the codebase is easier to understand.

**Why this priority**: Removing unused fields reduces storage footprint, improves hydration performance, and eliminates confusion about which data is actually needed.

**Independent Test**: Can be fully tested by verifying that all persisted fields are referenced in at least one component, and that removing unused fields does not break any functionality.

**Acceptance Scenarios**:

1. **Given** the current TenantBalance type has 22+ fields, **When** the streamlined version is implemented, **Then** only the 2 actively used fields (quota, used_quota) are persisted
2. **Given** the current CostData type has 8 fields, **When** the streamlined version is implemented, **Then** only the 3 actively used fields (model_name, quota, token_used) are persisted
3. **Given** the current Token type has 6 fields, **When** the streamlined version is implemented, **Then** only the 5 actively used fields are persisted (created_time removed)

---

### User Story 2 - Platform Adapter Architecture (Priority: P2)

As a developer extending the extension to support new platforms, I want a clear adapter interface that defines what data each platform must provide, so that I can implement new platform integrations without modifying core store logic.

**Why this priority**: Enables future platform support without breaking existing functionality or requiring store changes.

**Independent Test**: Can be fully tested by implementing a mock adapter for a hypothetical platform and verifying it integrates seamlessly with existing stores and components.

**Acceptance Scenarios**:

1. **Given** a new platform needs to be supported, **When** a developer implements the adapter interface, **Then** the new platform works with existing stores without any store modifications
2. **Given** the adapter interface is defined, **When** a platform returns data in its native format, **Then** the adapter normalizes it to the common store types
3. **Given** multiple platforms are configured, **When** switching between tenants of different platforms, **Then** the UI displays data consistently regardless of platform

---

### User Story 3 - Tenant Platform Configuration (Priority: P3)

As a user configuring multiple API providers, I want to specify which platform type each tenant uses, so that the extension can communicate with different API backends correctly.

**Why this priority**: User-facing configuration that enables the multi-platform capability.

**Independent Test**: Can be fully tested by adding a tenant with a platform type selector and verifying the correct adapter is used for API calls.

**Acceptance Scenarios**:

1. **Given** a user is adding a new tenant, **When** they configure the tenant, **Then** they can select the platform type from available options
2. **Given** a tenant has a platform type configured, **When** the extension makes API calls, **Then** it uses the correct adapter for that platform
3. **Given** an existing tenant without platform type, **When** the extension loads, **Then** it defaults to the current platform type (newapi-compatible)

---

### Edge Cases

- What happens when a platform adapter fails to normalize data? The system should display a user-friendly error and fall back to showing raw data where possible.
- How does the system handle platform-specific features not available on all platforms? Features should gracefully degrade, showing "not available" rather than errors.
- What happens when migrating existing stored data to the streamlined format? Migration should preserve all actively used data and silently discard unused fields.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist only fields that are actively consumed by UI components
- **FR-002**: System MUST define a common data interface for balance information (remainingCredit, consumedCredit)
- **FR-003**: System MUST define a common data interface for cost/usage data (modelId, creditCost, tokenUsage)
- **FR-004**: System MUST define a common data interface for token data (secretKey, label, lastUsedAt, creditConsumed, group)
- **FR-005**: System MUST provide an adapter interface that platform implementations can fulfill
- **FR-006**: System MUST support a default platform type for backward compatibility
- **FR-007**: System MUST normalize platform-specific API responses to common store types
- **FR-008**: System MUST migrate existing stored data to the streamlined format without data loss for used fields
- **FR-009**: System MUST allow tenants to specify their platform type
- **FR-010**: System MUST gracefully handle missing optional data from platforms that don't support all features

### Key Entities

- **Balance**: Normalized balance data with remainingCredit and consumedCredit fields, representing user's current available credit and historical consumption
- **Cost**: Normalized cost record with modelId, creditCost, and tokenUsage fields, representing per-model credit consumption
- **Token**: Normalized token data with secretKey, label, lastUsedAt, creditConsumed, and group fields
- **PlatformAdapter**: Interface defining methods each platform must implement to provide normalized data
- **PlatformType**: Enumeration of supported platform types (default: `newapi`)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Persisted store data size reduces by at least 60% compared to current implementation
- **SC-002**: All existing UI functionality continues to work without modification after store streamlining
- **SC-003**: Adding support for a new platform requires implementing only the adapter interface, with zero changes to stores or components
- **SC-004**: Data migration from old format to new format completes without user intervention
- **SC-005**: Extension startup time remains the same or improves after store optimization

## Clarifications

### Session 2025-12-25

- Q: What business-centric terminology should replace platform-specific balance fields (quota, used_quota)? → A: `remainingCredit` + `consumedCredit` (credit-based terminology)
- Q: What business-centric terminology should replace platform-specific cost fields (model_name, quota, token_used)? → A: `modelId` + `creditCost` + `tokenUsage` (aligns with credit terminology)
- Q: What business-centric terminology should replace platform-specific token fields? → A: `secretKey` + `label` + `lastUsedAt` + `creditConsumed` + `group`
- Q: What naming convention for business entities? → A: `Balance`, `Cost`, `Token` (minimal, direct naming)
- Q: What identifier for the default platform type? → A: `newapi` (current internal reference)

## Assumptions

- The `newapi` platform will remain the primary and default platform type
- All platforms will provide at minimum: balance/quota information, token management, and usage/cost data
- Platform-specific features beyond the common interface can be exposed through optional adapter methods
- Existing users' data will be migrated automatically on first load after update
