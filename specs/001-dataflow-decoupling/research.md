# Research: Dataflow Decoupling

**Feature**: 001-dataflow-decoupling
**Date**: 2025-12-26

## Research Tasks

### 1. Orchestrator Pattern for Multi-Source Data Aggregation

**Decision**: Domain-specific orchestrators with explicit data source declarations

**Rationale**:
- Each data domain (Balance, Cost, Token, TenantInfo) has different aggregation requirements
- Domain orchestrators can declare which raw data sources they need upfront
- Orchestrators coordinate: fetch raw data → pass to adapter → write to store
- This pattern allows adapters to receive multiple raw responses for merging

**Alternatives Considered**:
- Generic orchestrator with configuration: Rejected because each domain has unique merge logic that doesn't generalize well
- Event-driven pipeline: Rejected as over-engineering for 5 domains with synchronous requirements
- Middleware chain: Rejected because it obscures the data flow and makes debugging harder

**Implementation Pattern**:
```typescript
interface DomainOrchestrator<T> {
  readonly domain: string;
  refresh(tenant: Tenant): Promise<OrchestratorResult<T>>;
}

interface OrchestratorResult<T> {
  data: T | null;
  completeness: 'full' | 'partial' | 'failed';
  errors: OrchestratorError[];
}
```

---

### 2. Service Layer Simplification

**Decision**: Services return raw API responses without transformation

**Rationale**:
- Current services call adapters internally, creating tight coupling
- Services should only handle: HTTP client setup, authentication headers, endpoint URLs
- Raw responses preserve all data for flexible adapter consumption
- Multiple service methods can be called before any transformation occurs

**Alternatives Considered**:
- Keep services calling adapters but add multi-response support: Rejected because it doesn't solve the fundamental coupling issue
- Remove services entirely and have orchestrators call HTTP directly: Rejected because authentication/header logic would be duplicated

**Implementation Pattern**:
```typescript
interface IRawPlatformService {
  fetchBalance(): Promise<RawAPIResponse>;
  fetchCosts(period: CostPeriod): Promise<RawAPIResponse>;
  fetchTokens(): Promise<RawAPIResponse>;
  fetchTokenGroups(): Promise<RawAPIResponse>;
  fetchTenantInfo(): Promise<RawAPIResponse>;
}

interface RawAPIResponse {
  data: unknown;
  status: number;
  headers?: Record<string, string>;
}
```

---

### 3. Adapter Multi-Source Support

**Decision**: Adapter methods accept a data bag with named sources

**Rationale**:
- Current adapters accept single `unknown` parameter
- Multi-API merge requires passing multiple raw responses
- Named sources make the merge logic explicit and debuggable
- Adapters remain pure functions (no side effects, no service calls)

**Alternatives Considered**:
- Variadic parameters: Rejected because order-dependent and error-prone
- Separate merge methods: Rejected because it fragments the transformation logic

**Implementation Pattern**:
```typescript
interface PlatformAdapter {
  normalizeBalance(sources: BalanceSources): Balance;
  normalizeCosts(sources: CostSources): Cost[];
  // ...
}

interface BalanceSources {
  primary: unknown;        // Required: main balance endpoint
  usage?: unknown;         // Optional: usage data for merge
  credits?: unknown;       // Optional: credits data for merge
}
```

---

### 4. Error Handling Strategy

**Decision**: Typed errors per layer with propagation to orchestrator

**Rationale**:
- Services throw `APIError` for HTTP/network failures
- Adapters throw `TransformationError` for data parsing/validation failures
- Orchestrators catch both, aggregate into `OrchestratorError[]`, and decide recovery
- Partial data is returned when some sources succeed

**Alternatives Considered**:
- Single error type: Rejected because it loses context about failure location
- Error codes enum: Rejected because TypeScript discriminated unions are more type-safe

**Implementation Pattern**:
```typescript
class TransformationError extends Error {
  constructor(
    message: string,
    public readonly rawData: unknown,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'TransformationError';
  }
}

interface OrchestratorError {
  source: string;          // Which API/transformation failed
  type: 'api' | 'transform';
  message: string;
  recoverable: boolean;
}
```

---

### 5. Metadata for Data Quality Tracking

**Decision**: Add `_meta` field to normalized entities

**Rationale**:
- Spec requires `_completeness` and `_errors` metadata
- Underscore prefix indicates internal/system field
- Metadata travels with data through stores to UI
- UI can display warnings for partial data

**Alternatives Considered**:
- Separate metadata store: Rejected because it decouples data from its quality indicator
- Wrapper type: Rejected because it changes all store signatures

**Implementation Pattern**:
```typescript
interface EntityMeta {
  completeness: 'full' | 'partial';
  errors: string[];
  fetchedAt: number;
  sources: string[];
}

interface Balance {
  remainingCredit: number;
  consumedCredit: number;
  _meta?: EntityMeta;
}
```

---

### 6. Hook Migration Strategy

**Decision**: Hooks call orchestrators instead of services directly

**Rationale**:
- Current hooks: `new PlatformAPIService(tenant).getBalance()` → store
- New hooks: `new BalanceOrchestrator(tenant).refresh()` → returns result with metadata
- Orchestrators handle the full flow internally
- Hooks become simpler: just call orchestrator and handle result

**Alternatives Considered**:
- Keep hooks calling services, add separate orchestrator calls: Rejected because it duplicates the fetch-transform-store pattern
- Global orchestrator singleton: Rejected because it complicates tenant context management

**Implementation Pattern**:
```typescript
// Before
const api = new PlatformAPIService(tenant);
const balance = await api.getBalance();
await balanceStore.setBalance(tenantId, balance);

// After
const orchestrator = new BalanceOrchestrator(tenant);
const result = await orchestrator.refresh();
// Store update happens inside orchestrator
// Hook only handles UI state based on result.completeness
```

---

## Summary

All NEEDS CLARIFICATION items from Technical Context have been resolved:

| Item | Resolution |
|------|------------|
| Orchestrator pattern | Domain-specific orchestrators with explicit source declarations |
| Service simplification | Return raw responses, no adapter calls |
| Adapter multi-source | Named source bags instead of single unknown |
| Error handling | Typed errors per layer, aggregated by orchestrator |
| Data quality metadata | `_meta` field on normalized entities |
| Hook migration | Hooks call orchestrators, not services |

**Ready for Phase 1: Design & Contracts**
