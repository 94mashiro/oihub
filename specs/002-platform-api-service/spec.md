# Feature Specification: Platform API Service Abstraction

**Feature Branch**: `002-platform-api-service`
**Created**: 2025-12-26
**Status**: Draft
**Input**: User description: "数据流是业务方传入 platformType 到通用的 API Service 层，API Service层根据 type 调用各个平台的 api service，然后通过使用各个业务的 data adapter，生成统一的数据结构进行返回，数据流应当严格遵守这个设定"

## Data Flow Architecture *(mandatory)*

The system MUST strictly follow this data flow pattern:

```
┌─────────────────┐     platformType      ┌─────────────────────┐
│  Business Layer │ ───────────────────→  │  Generic API Service │
│  (UI/Components)│                       │  (PlatformAPIService)│
└─────────────────┘                       └──────────┬──────────┘
                                                     │
                                          routes by platformType
                                                     │
                    ┌────────────────────────────────┼────────────────────────────────┐
                    ▼                                                                 ▼
          ┌─────────────────┐                                               ┌─────────────────┐
          │  NewAPI Service │                                               │  Future Platform│
          │  (platform impl)│                                               │  (extensible)   │
          └────────┬────────┘                                               └────────┬────────┘
                   │                                                                  │
                   ▼                                                                  ▼
          ┌─────────────────┐                                               ┌─────────────────┐
          │ NewAPI Adapter  │                                               │ Future Adapter  │
          │ (data transform)│                                               │ (extensible)    │
          └────────┬────────┘                                               └────────┬────────┘
                   │                                                                  │
                   └──────────────────────────┬───────────────────────────────────────┘
                                              ▼
                                    ┌─────────────────────┐
                                    │  Unified Data Types │
                                    │  (TenantInfo, etc.) │
                                    └─────────────────────┘
```

### Data Flow Rules (STRICT)

1. **Business Layer → Generic Service**: Business code MUST only interact with the generic `PlatformAPIService`, passing `platformType` as context.
2. **Generic Service → Platform Service**: The generic layer MUST route calls to the correct platform-specific service based on `platformType`.
3. **Platform Service → Adapter**: Each platform service MUST use its corresponding data adapter to transform platform-specific responses.
4. **Adapter → Unified Types**: All adapters MUST return the same unified data types regardless of source platform.
5. **No Direct Platform Access**: Business layer MUST NOT directly call platform-specific services or adapters.

### Out of Scope

- Write/mutation operations (create, update, delete) - this feature covers read-only data retrieval only.
- Authentication/authorization logic - handled by existing tenant configuration.
- Platform-specific UI components - business layer remains platform-agnostic.
- New platform types - only existing "newapi" platform is supported; no PlatformType extension.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Business Layer Calls Generic API Service (Priority: P1)

As a developer working on the extension UI, I want to pass `platformType` to a generic API service layer and receive unified data structures, so that my business code remains platform-agnostic and follows the strict data flow pattern.

**Why this priority**: This is the entry point of the data flow. Business layer must only interact with the generic service, never with platform-specific implementations.

**Independent Test**: Can be fully tested by calling the generic service with platformType "newapi" and verifying that unified data types are returned.

**Acceptance Scenarios**:

1. **Given** a tenant with platformType "newapi", **When** business code calls `platformAPIService.getTenantInfo(tenant)`, **Then** the generic service routes to NewAPI service, which uses NewAPI adapter, and returns a unified `TenantInfo` type.
2. **Given** business code attempts to import or call a platform-specific service directly, **Then** the code review/architecture should flag this as a violation of the data flow rules.
3. **Given** a tenant with an unsupported platformType, **When** business code calls the generic service, **Then** a `PlatformNotSupportedError` is thrown with the unsupported platformType.

---

### User Story 2 - Platform Service Uses Data Adapter (Priority: P2)

As a platform service implementer, I want each platform service to use its dedicated data adapter to transform platform-specific API responses into unified data types, so that the data flow pattern is strictly enforced at the platform layer.

**Why this priority**: This ensures the adapter layer is properly integrated into the data flow. Platform services must not return raw API responses.

**Independent Test**: Can be tested by verifying that each platform service method calls its adapter before returning data, and that raw API response types never leak to callers.

**Acceptance Scenarios**:

1. **Given** the NewAPI platform service receives a raw API response, **When** it processes the response, **Then** it MUST pass the response through the NewAPI adapter before returning.
2. **Given** any platform service method, **When** examining its return type, **Then** it MUST be a unified type (e.g., `TenantInfo`, `BalanceInfo`), never a platform-specific type.
3. **Given** a new platform is added in the future, **When** implementing its service, **Then** a corresponding adapter MUST be created and used by the service.

---

### User Story 3 - Unified Data Types Returned (Priority: P3)

As a business layer developer, I want all API calls to return the same unified data types regardless of which platform the tenant uses, so that my UI code can work with consistent data structures.

**Why this priority**: This is the output guarantee of the data flow. Without unified types, the business layer would need platform-specific handling.

**Independent Test**: Can be tested by calling the same method and verifying the returned data structure conforms to the unified type schema.

**Acceptance Scenarios**:

1. **Given** a tenant on "newapi" platform, **When** calling `getTenantInfo()`, **Then** it returns `TenantInfo` with the expected property names and types.
2. **Given** a tenant on "newapi" platform, **When** calling `getBalanceInfo()`, **Then** it returns `BalanceInfo` with the expected property names and types.
3. **Given** a unified type definition, **When** any adapter transforms platform data, **Then** the output MUST conform to the unified type schema.

---

### Edge Cases

- What happens when a tenant has no platformType defined? The system MUST use the default platform type ("newapi") and log a warning.
- What happens if a platform service method fails? The service MUST wrap the error in a `PlatformAPIError` containing: platformType, method name, and original error. The adapter is NOT called on failure.
- What happens if an adapter cannot transform the data? The adapter MUST throw an `AdapterTransformError` with the source data shape and expected unified type.
- What happens if business code tries to bypass the generic service? This is an architectural violation that should be caught in code review; the platform services should not be exported from the public API.
- What happens when upstream API returns rate limit (HTTP 429)? Propagate as `PlatformAPIError` - business layer decides how to handle (show message, retry later, etc.).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a generic `PlatformAPIService` that accepts `platformType` and routes to the correct platform-specific service.
- **FR-002**: Business layer MUST only interact with `PlatformAPIService`; direct access to platform services is prohibited.
- **FR-003**: Each platform service MUST use its dedicated data adapter to transform responses before returning.
- **FR-004**: All platform services MUST return unified data types (`TenantInfo`, `BalanceInfo`, `TokenInfo`, `TokenGroupInfo`, `CostData`).
- **FR-005**: System MUST maintain a registry mapping platformType to platform service implementations.
- **FR-006**: System MUST use the default platform type ("newapi") when a tenant's platformType is undefined.
- **FR-007**: System MUST throw `PlatformNotSupportedError` when an unsupported platformType is requested.
- **FR-008**: Platform services MUST wrap API errors in `PlatformAPIError` with platformType, method name, and original error.
- **FR-009**: Adapters MUST throw `AdapterTransformError` when data transformation fails.
- **FR-010**: The current `TenantAPIService` MUST be refactored to `NewAPIService` as a platform-specific implementation.

### Non-Functional Requirements

- **NFR-001**: Observability MUST be minimal - errors and warnings only via `console.error`/`console.warn`. No debug logging or metrics required.

### Key Entities

- **PlatformAPIService (Generic Layer)**: The single entry point for business layer. Accepts `platformType` and routes to appropriate platform service. Business code MUST only use this interface.
- **Platform Service Interface**: Contract that all platform-specific services must implement. Methods: `getTenantInfo()`, `getBalanceInfo()`, `getTokens()`, `getTokenGroups()`, `getCostData()`.
- **NewAPIService**: Platform-specific implementation for "newapi". Uses NewAPIAdapter internally.
- **Data Adapters**: Transform platform-specific API responses to unified types. Currently only NewAPIAdapter exists.
- **Unified Data Types**: `TenantInfo`, `BalanceInfo`, `TokenInfo`, `TokenGroupInfo`, `CostData` - existing types in the codebase that all adapters produce (no schema changes required).
- **Platform Service Registry**: Maps platformType strings to their corresponding service implementations.
- **PlatformAPIError**: Error type thrown by platform services on API failure.
- **AdapterTransformError**: Error type thrown by adapters when data transformation fails.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Business layer code contains zero direct imports of platform-specific services (NewAPIService, etc.).
- **SC-002**: All API calls from business layer go through `PlatformAPIService` only.
- **SC-003**: Adding a new platform requires only: (1) new platform service, (2) new adapter, (3) registry entry - zero changes to generic layer or existing platforms.
- **SC-004**: All platform service methods return unified types; no platform-specific types leak to callers.
- **SC-005**: Data flow diagram in spec matches actual implementation architecture.

## Clarifications

### Session 2025-12-26

- Q: How should platform services handle API call failures? → A: Wrap in `PlatformAPIError` with platform, method, and original error. Adapter is not called on failure.
- Q: What should PlatformAPIService interface methods return? → A: Unified types only (adapters run inside platform services).
- Q: Can business layer access platform services directly? → A: No. Business layer MUST only use the generic `PlatformAPIService`. Platform services are internal implementation details.
- Q: Should unified data types reuse existing definitions or be newly designed? → A: Reuse existing unified types from current codebase (no schema changes).
- Q: Should this feature include write/mutation operations? → A: Read-only operations only (current scope).
- Q: What level of observability should the platform service layer provide? → A: Minimal - errors and warnings only (console.error/warn).
- Q: How should platform services handle rate limit responses (HTTP 429)? → A: Propagate as `PlatformAPIError` - let business layer handle.
- Q: Should PlatformType be extended with new types? → A: No. Only existing "newapi" type is supported. No PlatformType extension needed.

## Assumptions

- The existing adapter pattern for response normalization will continue to be used within platform services.
- The `apiClient` utility will remain the underlying HTTP client for all platform services.
- The current method signatures (return types, parameters) will be preserved to maintain backward compatibility.
- Only "newapi" platform is implemented; the architecture supports future platforms but no new types are added now.
- The data flow pattern is non-negotiable and must be strictly enforced in code review.
- The existing `PlatformType = 'newapi'` type definition remains unchanged.
