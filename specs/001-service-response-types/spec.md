# Feature Specification: Platform Service Response Type Definitions

**Feature Branch**: `001-service-response-types`
**Created**: 2025-12-27
**Status**: Draft
**Input**: User description: "对 service 层个平台的接口调用的返回，实现一个接口定义的模块的设计，简而言之就是设计一个模块，针对每个平台的service 接口返回值，实现对应的类型定义"

## Clarifications

### Session 2025-12-27

- Q: How should the initial platform-specific type definitions be created? → A: Manual inspection of actual API responses from test environments
- Q: When a platform API changes its response structure, who is responsible for updating the type definitions? → A: Platform adapter maintainer updates types when updating adapter logic
- Q: How should drift between type definitions and actual API responses be detected (as mentioned in SC-007)? → A: TypeScript compilation errors when adapters access fields that don't match type definitions
- Q: How should "100% of platform response fields" coverage (SC-005) be measured and validated? → A: Through TypeScript compilation and IDE autocomplete verification during adapter development
- Q: What exactly are "Source Bag Types" mentioned in Key Entities? → A: Rename to "Response Aggregates" (more descriptive term for multi-endpoint response containers)
- Q: Should JSON schemas be used for additional type validation? → A: No, TypeScript type definitions + compilation are sufficient for type correctness; JSON schemas add unnecessary complexity

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Integration with Type Safety (Priority: P1)

A developer integrates a new platform into the system and needs to understand exactly what data structure each raw service API endpoint returns. They should be able to discover, navigate, and implement type-safe code without consulting external API documentation or inspecting network responses.

**Why this priority**: This is the foundational value - without clear type definitions, developers cannot safely integrate new platforms or maintain existing ones. Type safety prevents runtime errors and accelerates development.

**Independent Test**: Can be fully tested by attempting to implement a new platform adapter using only the type definitions as reference. Success means the developer can complete the implementation without runtime type errors or missing field references.

**Acceptance Scenarios**:

1. **Given** a developer needs to implement a new platform's balance endpoint, **When** they import the platform-specific response types, **Then** their IDE autocompletes all available fields with accurate types
2. **Given** a developer writes transformation logic for token data, **When** they reference fields from the raw response type, **Then** TypeScript compilation catches any typos or incorrect field access
3. **Given** multiple platforms return similar but slightly different structures, **When** the developer inspects type definitions, **Then** platform-specific differences are clearly visible through distinct type names

---

### User Story 2 - Adapter Maintainability and Refactoring (Priority: P2)

A maintainer needs to update an existing platform adapter when the platform's API response structure changes. They should be able to update the type definitions alongside adapter logic, with TypeScript immediately highlighting all affected transformation code that needs updating.

**Why this priority**: Platform APIs evolve over time. Clear type definitions make API changes explicit through TypeScript errors, preventing silent runtime failures. Synchronized type and adapter updates maintain consistency.

**Independent Test**: Simulate an API change by modifying a platform's response type and verify that all affected adapter transformations immediately show TypeScript errors, guiding the developer to exactly what needs updating.

**Acceptance Scenarios**:

1. **Given** a platform adds a new optional field to their balance response, **When** the type definition is updated, **Then** existing code continues to compile without changes
2. **Given** a platform renames a required field, **When** the type definition is updated, **Then** TypeScript immediately highlights all adapter code that needs modification
3. **Given** a developer needs to understand what fields are available from a specific platform, **When** they inspect the type definitions, **Then** they can see all fields with their exact data types without reading implementation code

---

### User Story 3 - Cross-Platform Consistency Validation (Priority: P3)

A developer needs to verify that all platforms provide sufficient data to fulfill the normalized entity requirements. They should be able to statically validate that each platform adapter can access the necessary raw fields to produce complete normalized data.

**Why this priority**: Ensures data quality across platforms and prevents incomplete integrations. While important, this is less urgent than basic type safety and maintainability.

**Independent Test**: Review type definitions for all platforms against normalized entity requirements. Success means each normalized entity field can be traced back to at least one raw field from each platform's response types.

**Acceptance Scenarios**:

1. **Given** a normalized `Balance` type requires `remainingCredit`, **When** reviewing platform response types, **Then** each platform's type definitions include field(s) that can provide this value
2. **Given** a developer implements a new normalized field, **When** they check platform response types, **Then** they can immediately identify which platforms lack the necessary raw data
3. **Given** platform responses have different field naming conventions, **When** type definitions use platform-specific names, **Then** adapters can maintain clear mapping logic between raw and normalized fields

---

### Edge Cases

- What happens when a platform returns a field with `null` vs omitting it entirely? (Type definitions should distinguish `field?: Type` from `field: Type | null`)
- How are nested object structures represented when different platforms nest data at different depths?
- What happens when a platform uses different data types for the same semantic field (e.g., numeric string vs number)?
- How are array responses typed when elements have heterogeneous structures?
- What happens when pagination metadata is embedded differently across platforms?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide platform-specific TypeScript type definitions for all raw API response structures from NewAPI, Cubence, and PackyCode Codex platforms
- **FR-002**: Type definitions MUST distinguish between required and optional fields using TypeScript's optional property syntax (`field?: Type`)
- **FR-003**: Type definitions MUST accurately represent nested object structures matching each platform's actual response format
- **FR-004**: Type definitions MUST use platform-specific naming conventions exactly as returned by each platform's API
- **FR-005**: Type definitions MUST be organized by platform, with clear module boundaries preventing cross-platform type pollution
- **FR-006**: Type definitions MUST cover all endpoints defined in `IRawPlatformService`: `fetchBalance`, `fetchCosts`, `fetchTokens`, `fetchTokenGroups`, `fetchTenantInfo`
- **FR-007**: Type definitions MUST support union types when a single endpoint can return multiple response formats
- **FR-008**: Type definitions MUST represent arrays with appropriate element types (homogeneous or union types for heterogeneous arrays)
- **FR-009**: Type definitions MUST distinguish between numeric strings and actual number types based on platform behavior
- **FR-010**: Type definitions MUST be importable by service implementations, adapters, and orchestrators
- **FR-011**: System MUST provide index types or utility types to reference platform-specific types by platform identifier string
- **FR-012**: Type definitions MUST include JSDoc comments documenting field semantics when field names are non-obvious
- **FR-013**: Initial type definitions MUST be created through manual inspection of actual API responses captured from test environments to ensure accuracy
- **FR-014**: Type definition updates MUST be the responsibility of the platform adapter maintainer, ensuring synchronization between type changes and adapter transformation logic changes
- **FR-015**: Type definition accuracy MUST be validated through compile-time TypeScript type-checking to ensure code consistency

### Key Entities *(include if feature involves data)*

- **Platform Response Type Module**: Centralized module containing all platform-specific raw API response type definitions, organized by platform (NewAPI, Cubence, PackyCode Codex)
- **Balance Response Types**: Platform-specific types representing raw balance/credit/usage data from `fetchBalance()` endpoint
- **Cost Response Types**: Platform-specific types representing raw cost breakdown data from `fetchCosts()` endpoint
- **Token Response Types**: Platform-specific types representing raw API key/token list data from `fetchTokens()` endpoint
- **Token Group Response Types**: Platform-specific types representing raw token group metadata from `fetchTokenGroups()` endpoint
- **Tenant Info Response Types**: Platform-specific types representing raw platform status/configuration from `fetchTenantInfo()` endpoint
- **Pagination Response Types**: Platform-specific types for paginated responses when applicable
- **Response Aggregates**: Container types that bundle multiple related API responses together before adapter transformation (e.g., `BalanceSources` combining quota, usage, and credits responses; `TokenSources` combining token list and group metadata)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers implementing new platform adapters complete type-safe transformations without runtime type errors in 95% of cases
- **SC-002**: When platform APIs change, TypeScript compilation catches affected adapter code locations within seconds, reducing debugging time by 80%
- **SC-003**: Code reviews for adapter changes require 50% less time due to explicit type contracts making correctness verification straightforward
- **SC-004**: New developer onboarding time for understanding platform integration patterns reduces by 60% due to self-documenting type definitions
- **SC-005**: IDE autocomplete suggestions provide accurate field access for 100% of platform response fields during adapter development
- **SC-006**: Zero runtime errors related to accessing undefined or mistyped fields from raw platform responses in production
- **SC-007**: Type definition drift is detected through TypeScript compilation errors when adapters access changed or removed fields

## Assumptions

- Platform APIs return JSON data structures (not XML, binary, or other formats)
- Response structures from each platform are stable within a major version (breaking changes are versioned)
- All platforms use HTTP-based REST or REST-like APIs
- TypeScript strict mode is enabled in the project configuration
- Developers have TypeScript language service support in their IDEs
- Existing `RawAPIResponse` wrapper structure (`{ data, status, headers }`) remains unchanged
- Platform authentication and request mechanisms are handled outside the scope of response types
- Type definitions reflect current platform API versions as of the specification date

## Dependencies

- TypeScript compiler and toolchain must support the type features used (utility types, conditional types, etc.)
- Existing service layer architecture (`IRawPlatformService`, adapters, orchestrators) must remain compatible with typed responses
- Test environment with authenticated access to all platform APIs (NewAPI, Cubence, PackyCode Codex) for capturing actual response data during initial type definition creation

## Out of Scope

- Runtime validation or schema validation of API responses (type definitions are compile-time only)
- JSON Schema generation or validation (TypeScript type definitions + compilation provide sufficient type correctness)
- Automated coverage analysis tools comparing types to API schemas (adds unnecessary complexity without meaningful benefit)
- Automatic type generation from OpenAPI/Swagger specifications
- Type definitions for request payloads or parameters (only response types)
- Versioning strategy for type definitions when platform APIs evolve
- Mock data generators based on type definitions
- Type definitions for authentication responses or session management
- Generic wrapper types for error responses (handled by existing `APIError` hierarchy)
- Type definitions for internal orchestrator or adapter types (only raw platform response types)
