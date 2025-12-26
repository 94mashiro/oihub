# Feature Specification: Tenant Info Storage Refactoring

**Feature Branch**: `002-tenant-info-refactor`
**Created**: 2025-12-26
**Status**: Draft
**Input**: User description: "在上个spec中，对大部分 store中的冗余字段做了精简治理，另外也通过adapter层设计，让store实现了多平台接入的扩展能力，但是治理中遗漏了对 tenantInfo 的治理，目前这个字段是在 tenant.tenantList[number].info 中，由于 info 是接口下发的字段，但是tenantList[number] 又是插件db本地配置的一个配置字段，这种设计感觉有些格格不入，我希望是原始配置和接口下发的数据做隔离，另外这份info，我希望也能和其他 store 的存储设计准则一致，做通用的字段设计，删除没有用到的字段，另外实现adapter，接入目前的 newapi 接口。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Separate Configuration from Runtime Data (Priority: P1)

As a developer maintaining the extension, I want tenant configuration data (user-provided settings) to be stored separately from runtime data (API-fetched information), so that the data model is clearer and easier to reason about.

**Why this priority**: Mixing configuration with runtime data creates confusion about data ownership, makes persistence logic unclear, and violates separation of concerns. This is the foundation for proper data management.

**Independent Test**: Can be fully tested by verifying that tenant configuration (id, name, token, userId, url, platformType) persists in tenant store while runtime info is stored separately, and that both can be accessed independently without coupling.

**Acceptance Scenarios**:

1. **Given** a user adds a new tenant, **When** the tenant is saved, **Then** only configuration fields are persisted in the tenant store
2. **Given** tenant info is fetched from API, **When** the data is stored, **Then** it is saved in a separate runtime store, not mixed with tenant configuration
3. **Given** a tenant is deleted, **When** the deletion occurs, **Then** both configuration and associated runtime info are removed

---

### User Story 2 - Streamlined Tenant Info Fields (Priority: P2)

As a developer maintaining the extension, I want tenant info to only store fields that are actively used by components, so that storage is efficient and the data structure is clear.

**Why this priority**: Removing unused fields reduces storage footprint and eliminates confusion about which data is actually needed, following the same principles established in the previous store refactoring.

**Independent Test**: Can be fully tested by analyzing component usage of tenant info fields and verifying that only actively consumed fields are persisted.

**Acceptance Scenarios**:

1. **Given** the current TenantInfo has 5 platform-specific fields (quota_per_unit, usd_exchange_rate, quota_display_type, api_info, announcements), **When** normalization is applied, **Then** fields are renamed to business-centric names (creditUnit, exchangeRate, displayFormat, endpoints, notices) and only actively used fields are retained
2. **Given** components reference tenant info fields, **When** the streamlined version is implemented, **Then** all existing UI functionality continues to work without modification
3. **Given** unused fields exist in the current structure, **When** migration occurs, **Then** unused fields are silently discarded

---

### User Story 3 - Platform Adapter for Tenant Info (Priority: P3)

As a developer extending the extension to support new platforms, I want a platform adapter for tenant info that normalizes platform-specific API responses, so that new platforms can be integrated without modifying core store logic.

**Why this priority**: Enables future platform support and maintains consistency with the adapter pattern established for balance, cost, and token data.

**Independent Test**: Can be fully tested by implementing the adapter interface for the newapi platform and verifying it correctly normalizes API responses to the common tenant info structure.

**Acceptance Scenarios**:

1. **Given** a platform adapter interface is defined, **When** the newapi adapter is implemented, **Then** it normalizes the /api/status response to the common tenant info structure
2. **Given** tenant info is fetched via TenantAPIService, **When** the response is received, **Then** the adapter transforms it to the normalized structure before storage
3. **Given** a new platform needs to be supported in the future, **When** a developer implements the adapter interface, **Then** tenant info integration works without store modifications

---

### Edge Cases

- What happens when the API returns tenant info with missing fields? The system should store null/undefined for any missing fields (all fields are optional) and continue functioning with graceful degradation for features that depend on missing data.
- What happens when tenant info fetch fails but configuration exists? The system should continue functioning with configuration data, showing appropriate "data unavailable" messages for info-dependent features.
- How does the system handle tenant info for tenants that have been deleted? The runtime store should clean up orphaned tenant info when tenants are removed.
- What happens when background refresh fails? The system should retain the last successfully fetched data and retry on the next refresh cycle without disrupting the user experience.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store tenant configuration (id, name, token, userId, url, platformType) separately from runtime tenant info
- **FR-002**: System MUST create a dedicated runtime store for tenant info data fetched from APIs
- **FR-003**: System MUST persist only actively used tenant info fields in the runtime store
- **FR-004**: System MUST define a normalized TenantInfo interface with business-centric field names (creditUnit, exchangeRate, displayFormat, endpoints, notices)
- **FR-005**: System MUST extend the PlatformAdapter interface to include tenant info normalization
- **FR-006**: System MUST implement tenant info normalization in the newapi adapter to transform platform-specific field names to business-centric names
- **FR-007**: System MUST update TenantAPIService.getStatus() to use the adapter for normalization
- **FR-008**: System MUST remove the info field from the Tenant type definition
- **FR-009**: System MUST update all components that reference tenant.info to use the new runtime store
- **FR-010**: System MUST clean up orphaned tenant info when tenants are deleted
- **FR-011**: System MUST handle missing or failed tenant info fetches gracefully
- **FR-012**: System MUST treat all tenant info fields as optional and provide graceful degradation when fields are missing

### Key Entities

- **TenantConfig**: User-provided configuration data (id, name, token, userId, url, platformType) persisted in tenant store
- **TenantInfo**: Normalized runtime data fetched from platform APIs with business-centric field names (creditUnit, exchangeRate, displayFormat, endpoints, notices). All fields are optional to support graceful degradation.
- **TenantInfoStore**: Dedicated runtime store for tenant info, keyed by tenant ID, not persisted to storage
- **PlatformAdapter**: Extended interface including normalizeTenantInfo() method for transforming platform-specific responses to normalized field names

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tenant configuration and runtime info are stored in separate stores with clear data ownership
- **SC-002**: All existing UI functionality that depends on tenant info continues to work without modification
- **SC-003**: Tenant info storage only includes fields that are actively referenced by at least one component
- **SC-004**: Adding support for a new platform's tenant info requires only implementing the adapter method, with zero changes to stores or components
- **SC-005**: Extension continues to function normally when tenant info fetch fails or returns partial data

## Assumptions

- This refactoring is a development-phase change; existing tenant.info data can be cleared without migration
- The tenant info data is runtime-only and does not need to be persisted to storage
- The timing and mechanism of tenant info fetching (when to fetch, background refresh intervals, etc.) are NOT part of this refactoring and will remain unchanged
- All platforms will provide tenant info through a status endpoint similar to /api/status
- Platform-specific field names (quota_per_unit, usd_exchange_rate, quota_display_type, api_info, announcements) will be normalized to business-centric names (creditUnit, exchangeRate, displayFormat, endpoints, notices)
- All five tenant info fields are actively used by components and should be retained
- Components currently accessing tenant.info can be updated to access the new runtime store without breaking changes to their public APIs
- Tenant info is tenant-specific and should be keyed by tenant ID in the runtime store

## Clarifications

### Session 2025-12-26

- Q: What is the scope of this refactoring regarding fetch timing? → A: This refactoring ONLY covers store data structure changes and newapi adapter implementation. The timing of data fetching and background fetch design are explicitly OUT OF SCOPE and will remain unchanged.
- Q: Should tenant info fields use platform-specific names or be normalized to business-centric names? → A: Normalize to business-centric names (creditUnit, exchangeRate, displayFormat, endpoints, notices) following the pattern from 001-store-field-abstraction
- Q: Which tenant info fields are optional vs required? → A: All fields optional (graceful degradation for any missing field)
- Q: When should migration of existing tenant.info data occur? → A: No migration needed - this is a development-phase change, existing data can be cleared
