# Data Model: Dataflow Decoupling

**Feature**: 001-dataflow-decoupling
**Date**: 2025-12-26

## Entity Overview

This refactoring introduces new entities for the orchestration layer while preserving existing normalized types.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEW ENTITIES                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  RawAPIResponse      - Unprocessed API response wrapper                     │
│  EntityMeta          - Data quality metadata                                │
│  OrchestratorResult  - Orchestrator output with completeness                │
│  OrchestratorError   - Typed error from orchestration                       │
│  TransformationError - Error during adapter transformation                  │
│  *Sources            - Named source bags for adapters                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                        EXISTING ENTITIES (unchanged)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Balance, Cost, Token, TokenGroup, TenantInfo                               │
│  Tenant, TenantId, PlatformType                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## New Entities

### RawAPIResponse

Wrapper for unprocessed API responses from services.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| data | `unknown` | Yes | Raw response body |
| status | `number` | Yes | HTTP status code |
| headers | `Record<string, string>` | No | Response headers if needed |

**Validation Rules**:
- `status` must be a valid HTTP status code (100-599)
- `data` can be any JSON-serializable value

---

### EntityMeta

Metadata attached to normalized entities for data quality tracking.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| completeness | `'full' \| 'partial'` | Yes | Whether all sources succeeded |
| errors | `string[]` | Yes | Error messages from failed sources |
| fetchedAt | `number` | Yes | Unix timestamp of fetch |
| sources | `string[]` | Yes | Names of sources that contributed |

**Validation Rules**:
- `completeness` is `'full'` only when `errors` is empty
- `fetchedAt` must be a valid Unix timestamp (> 0)
- `sources` must have at least one entry

---

### OrchestratorResult<T>

Generic result type returned by orchestrators.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| data | `T \| null` | Yes | Normalized entity or null on total failure |
| completeness | `'full' \| 'partial' \| 'failed'` | Yes | Overall result status |
| errors | `OrchestratorError[]` | Yes | All errors encountered |

**State Transitions**:
- `'full'`: All sources fetched and transformed successfully
- `'partial'`: Some sources failed but usable data was produced
- `'failed'`: No usable data could be produced

---

### OrchestratorError

Structured error from orchestration process.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| source | `string` | Yes | Which API endpoint or transformation failed |
| type | `'api' \| 'transform'` | Yes | Error category |
| message | `string` | Yes | Human-readable error description |
| recoverable | `boolean` | Yes | Whether retry might succeed |

**Validation Rules**:
- `source` should match the endpoint name or adapter method
- `recoverable` is `true` for network timeouts, `false` for 4xx errors

---

### TransformationError

Error class for adapter transformation failures.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | `string` | Yes | Error description |
| rawData | `unknown` | Yes | The raw data that failed to transform |
| field | `string` | No | Specific field that caused the error |

**Usage**: Thrown by adapters, caught by orchestrators.

---

## Source Bags (Adapter Input Types)

### BalanceSources

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| primary | `unknown` | Yes | Main balance endpoint response |
| usage | `unknown` | No | Usage data for merge (platform-specific) |
| credits | `unknown` | No | Credits data for merge (platform-specific) |

### CostSources

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| costs | `unknown[]` | Yes | Cost records from API |

### TokenSources

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tokens | `unknown[]` | Yes | Token list from API |
| groups | `unknown` | No | Token group metadata |

### TenantInfoSources

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | `unknown` | Yes | Platform status endpoint response |

---

## Existing Entities (Reference)

These entities remain unchanged. Included for completeness.

### Balance

| Field | Type | Description |
|-------|------|-------------|
| remainingCredit | `number` | Available credit balance |
| consumedCredit | `number` | Historical credit consumption |
| _meta | `EntityMeta?` | NEW: Optional metadata |

### Cost

| Field | Type | Description |
|-------|------|-------------|
| modelId | `string` | Model identifier |
| creditCost | `number` | Credit consumed |
| tokenUsage | `number` | Tokens consumed |

### Token

| Field | Type | Description |
|-------|------|-------------|
| secretKey | `string` | API key value |
| label | `string` | User-defined name |
| lastUsedAt | `number` | Unix timestamp |
| creditConsumed | `number` | Total credit used |
| group | `string` | Group identifier |

### TokenGroup

| Field | Type | Description |
|-------|------|-------------|
| description | `string` | Group description |
| multiplier | `number` | Cost multiplier |

### TenantInfo

| Field | Type | Description |
|-------|------|-------------|
| creditUnit | `number?` | Credit unit value |
| exchangeRate | `number?` | Exchange rate |
| displayFormat | `string?` | Display format string |
| endpoints | `ApiEndpoint[]?` | Available endpoints |
| notices | `Notice[]?` | Platform notices |

---

## Entity Relationships

```
Tenant (1) ──────────────────────────────────────────────────────────────┐
    │                                                                     │
    │ has platformType                                                    │
    ▼                                                                     │
PlatformType ──► determines ──► IRawPlatformService                      │
                                      │                                   │
                                      │ fetches                           │
                                      ▼                                   │
                              RawAPIResponse (*)                          │
                                      │                                   │
                                      │ grouped into                      │
                                      ▼                                   │
                              *Sources (BalanceSources, etc.)             │
                                      │                                   │
                                      │ transformed by                    │
                                      ▼                                   │
                              PlatformAdapter                             │
                                      │                                   │
                                      │ produces                          │
                                      ▼                                   │
                              Normalized Entity + EntityMeta              │
                                      │                                   │
                                      │ wrapped in                        │
                                      ▼                                   │
                              OrchestratorResult<T>                       │
                                      │                                   │
                                      │ stored by                         │
                                      ▼                                   │
                              Store (keyed by TenantId) ◄─────────────────┘
```

---

## Migration Notes

1. **EntityMeta is optional**: Existing stores continue to work without `_meta`
2. **Backward compatible**: All existing normalized types unchanged
3. **Gradual adoption**: Orchestrators can be introduced per-domain without breaking existing code
