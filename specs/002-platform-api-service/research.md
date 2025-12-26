# Research: Platform API Service Abstraction

**Feature**: 002-platform-api-service
**Date**: 2025-12-26

## Research Tasks

### 1. Service Routing Pattern

**Decision**: Use a registry-based routing pattern with a `Map<PlatformType, PlatformService>` lookup.

**Rationale**:
- Matches existing adapter registry pattern (`getAdapter()` in `lib/api/adapters/index.ts`)
- O(1) lookup by platformType
- Easy to extend: add new platform by registering in the map
- Type-safe: TypeScript ensures all platform types have implementations

**Alternatives Considered**:
- Switch statement: Less extensible, requires code changes for new platforms
- Factory pattern with classes: Over-engineered for this use case
- Dynamic import: Unnecessary complexity for known platform set

### 2. Error Handling Strategy

**Decision**: Create dedicated error classes (`PlatformAPIError`, `AdapterTransformError`) extending `Error`.

**Rationale**:
- Enables `instanceof` checks for error handling
- Preserves original error context (cause chain)
- Follows existing JavaScript/TypeScript error patterns
- Allows business layer to distinguish error types

**Alternatives Considered**:
- Error codes with generic Error: Less type-safe, harder to handle
- Result types (Either/Result): Would require refactoring all callers
- Throwing raw errors: Loses platform context

### 3. Platform Service Interface

**Decision**: Define `IPlatformService` interface matching existing `TenantAPIService` method signatures.

**Rationale**:
- Backward compatible with existing code
- Existing unified types (`TenantInfo`, `Balance`, etc.) already defined
- Adapters already implement normalization for these types
- Minimal refactoring required

**Alternatives Considered**:
- New method signatures: Would break existing callers
- Generic methods with type parameters: Over-complicated for fixed return types

### 4. Refactoring TenantAPIService

**Decision**: Rename `TenantAPIService` to `NewAPIService` and keep internal implementation unchanged.

**Rationale**:
- Existing implementation already uses adapter pattern correctly
- Only the class name and export visibility change
- Minimizes risk of introducing bugs
- Preserves all existing functionality

**Alternatives Considered**:
- Rewrite from scratch: Unnecessary risk, no benefit
- Keep TenantAPIService and wrap: Creates confusion, duplicate code

### 5. Platform Implementation Scope

**Decision**: Implement only `NewAPIService` for the existing "newapi" platform type. No PlatformType extension needed.

**Rationale**:
- Only "newapi" platform currently exists in the codebase
- Architecture supports future platforms without code changes
- Avoids unnecessary stub implementations
- Keeps scope focused and minimal

**Alternatives Considered**:
- Add OneAPI stub: Unnecessary complexity, no immediate use case
- Extend PlatformType: Not needed until new platform is actually required

## Existing Code Analysis

### Current TenantAPIService Structure

```typescript
// lib/api/services/tenant-api-service.ts
export class TenantAPIService {
  private readonly config: TenantConfig;
  private readonly adapter: PlatformAdapter;

  constructor(tenant: Tenant) {
    this.config = extractConfig(tenant);
    this.adapter = getAdapter(tenant.platformType);
  }

  async getStatus(): Promise<TenantInfo>
  async getSelfInfo(): Promise<Balance>
  async getTokens(page, size): Promise<PaginationResult<Token>>
  async getTokenGroups(): Promise<Record<string, TokenGroup>>
  async getCostData(period): Promise<Cost[]>
}
```

### Current Adapter Registry

```typescript
// lib/api/adapters/index.ts
const adapters: Record<PlatformType, PlatformAdapter> = {
  newapi: newAPIAdapter,
};

export function getAdapter(platformType: PlatformType): PlatformAdapter
```

## Conclusions

No NEEDS CLARIFICATION items remain. All technical decisions align with:
- Existing codebase patterns
- Constitution requirements
- Feature specification constraints

Ready to proceed to Phase 1: Design & Contracts.
