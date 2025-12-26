# Feature Specification: Dataflow Decoupling

**Feature Branch**: `001-dataflow-decoupling`
**Created**: 2025-12-26
**Status**: Draft
**Input**: User description: "对数据流进行改造,每个 tenant 对应一个平台,每个平台类型的数据流都是独立实现的,从接口的定义,数据接口的转换,但是最终写入 store 的数据格式都是相同的,但是会有一个问题,现在的 adapter 是在 service 中调用的,而 service 的方法又是某个接口的调用,这就会出现 adapter 和单个接口进行强耦合,这个设计模式是错误的,因为可能会出现某个平台中,一个 store 的数据,是由多个接口的字段 merge 而成的,现在的设计就会限制这种情况,所以我希望的是service 的指责独立,仅作为数据的获取,将 adapter 数据转换脱离 service 进行调用,完成数据流中各个环节的解耦"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Adds New Platform Support (Priority: P1)

A developer needs to add support for a new platform (e.g., a new API provider). With the decoupled architecture, they can implement each layer independently: define raw API endpoints in the service layer, create transformation logic in the adapter layer, and the store layer remains unchanged.

**Why this priority**: This is the core value proposition - enabling independent platform implementations without modifying shared infrastructure.

**Independent Test**: Can be tested by adding a mock platform implementation and verifying that only platform-specific files need to be created, with no changes to stores or hooks.

**Acceptance Scenarios**:

1. **Given** a new platform type needs to be supported, **When** a developer implements the platform service, **Then** they only need to define raw API fetch methods without any data transformation logic
2. **Given** a new platform adapter is created, **When** the adapter transforms raw data, **Then** it can combine data from multiple API responses into a single normalized entity
3. **Given** a new platform is fully implemented, **When** the system fetches data for a tenant on that platform, **Then** the data flows through service → adapter → store without any layer knowing implementation details of other layers

---

### User Story 2 - Platform Requires Multi-API Data Merge (Priority: P1)

A platform's balance information is split across two different API endpoints. The adapter layer needs to fetch data from both endpoints and merge them into a single normalized Balance entity before writing to the store.

**Why this priority**: This is the primary problem the current architecture cannot solve - the tight coupling between service methods and adapters prevents multi-source data aggregation.

**Independent Test**: Can be tested by creating a platform where balance data comes from two mock endpoints, and verifying the adapter correctly merges both responses.

**Acceptance Scenarios**:

1. **Given** a platform where balance data comes from `/api/credits` and `/api/usage`, **When** the data orchestration layer requests balance data, **Then** both endpoints are called and their responses are merged into a single Balance entity
2. **Given** one of the two required API calls fails, **When** the orchestration layer handles the error, **Then** appropriate error handling occurs without corrupting partial data in the store
3. **Given** the two API responses have overlapping fields, **When** the adapter merges them, **Then** a deterministic merge strategy is applied (e.g., prefer primary source)

---

### User Story 3 - Developer Modifies API Response Format (Priority: P2)

A platform updates their API response format. The developer needs to update only the adapter layer without touching the service layer or store layer.

**Why this priority**: Demonstrates the maintainability benefit of decoupling - changes are isolated to the appropriate layer.

**Independent Test**: Can be tested by changing a mock API response format and verifying only the adapter file needs modification.

**Acceptance Scenarios**:

1. **Given** a platform changes their API response structure, **When** a developer updates the adapter, **Then** no changes are required in the service layer
2. **Given** the adapter transformation logic is updated, **When** the system processes data, **Then** the store receives correctly normalized data in the expected format

---

### User Story 4 - System Handles Platform-Specific Error Responses (Priority: P2)

Different platforms return errors in different formats. The error handling should be decoupled so each platform can define its own error parsing without affecting the core data flow.

**Why this priority**: Error handling is a cross-cutting concern that benefits from the same decoupling principles.

**Independent Test**: Can be tested by simulating platform-specific error responses and verifying correct error type identification.

**Acceptance Scenarios**:

1. **Given** Platform A returns errors as `{ error: { code, message } }` and Platform B returns `{ status, error_description }`, **When** an error occurs, **Then** each platform's error parser correctly extracts the error information
2. **Given** an API call fails, **When** the error is propagated, **Then** the calling code receives a normalized error type regardless of the source platform

---

### Edge Cases

- **Partial API data**: Adapter accepts partial data with null/undefined for missing fields; normalized entities include a `_completeness` metadata flag indicating data quality
- **Multi-API merge failure**: Return partial result from successful API calls; include `_errors` metadata array indicating which sources failed and why
- **Adapter transformation exception**: Wrap in typed `TransformationError` with raw data context for debugging, propagate to orchestration layer which decides recovery strategy
- **Platform deprecation**: Hard removal - delete platform files entirely; provide migration script that moves affected tenants to a specified fallback platform before removal

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Service layer MUST only be responsible for raw data fetching from APIs, returning unprocessed response data
- **FR-002**: Service layer MUST NOT call adapters or perform any data transformation
- **FR-003**: Adapter layer MUST be callable independently from the service layer
- **FR-004**: Adapter layer MUST support receiving data from multiple API responses for a single transformation
- **FR-005**: System MUST provide an orchestration mechanism that coordinates service calls, adapter transformations, and store updates
- **FR-006**: Each platform MUST have its own isolated implementation of services and adapters
- **FR-007**: Store layer MUST remain unchanged - it receives normalized data regardless of source platform
- **FR-008**: System MUST support adding new platforms without modifying existing platform implementations
- **FR-009**: Error handling MUST be decoupled per layer - services handle HTTP errors, adapters handle transformation errors, orchestration handles coordination errors
- **FR-010**: System MUST maintain backward compatibility with existing data in stores during migration

### Key Entities

- **RawAPIResponse**: Unprocessed response data from a platform API, platform-specific structure
- **NormalizedEntity**: Standardized data format (Balance, Cost, Token, etc.) that stores accept; includes `_completeness` and `_errors` metadata
- **PlatformService**: Responsible for HTTP communication with a specific platform's APIs
- **PlatformAdapter**: Responsible for transforming raw API responses into normalized entities
- **DomainOrchestrator**: One per data domain (e.g., `BalanceOrchestrator`, `CostOrchestrator`); coordinates service calls, adapter transformations, and store updates for that domain across all platforms

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Adding a new platform requires creating only platform-specific files (service + adapter) with zero modifications to stores, hooks, or other platforms
- **SC-002**: A single store entity can be populated from multiple API calls without service layer changes
- **SC-003**: Changing an API response format requires modifications only in the corresponding adapter file
- **SC-004**: All existing functionality continues to work after the refactoring (no regression)
- **SC-005**: Each layer (service, adapter, orchestration, store) can be unit tested in isolation without mocking other layers

## Clarifications

### Session 2025-12-26

- Q: When a platform API returns partial data (some expected fields missing), how should the adapter handle it? → A: Accept partial data with null/undefined for missing fields, track completeness via metadata
- Q: When one API in a multi-API merge scenario times out or fails, what should happen? → A: Return partial result from successful calls with error metadata indicating which sources failed
- Q: When an adapter's transformation logic throws an exception, how should it be handled? → A: Wrap in typed TransformationError with raw data context, propagate to orchestration layer
- Q: How should the DataOrchestrator be structured? → A: One orchestrator per data domain (BalanceOrchestrator, CostOrchestrator, etc.) - domain-focused
- Q: When a platform is deprecated, what should the removal strategy be? → A: Hard removal - delete platform files, migration script moves affected tenants to a fallback platform

## Assumptions

- The current normalized data types (Balance, Cost, Token, TokenGroup, TenantInfo) are sufficient and do not need to change
- Platform-specific authentication and header configuration will remain in the service layer
- The WXT storage persistence mechanism will not be affected by this refactoring
- Existing hooks will be updated to use the new orchestration layer instead of directly calling services
