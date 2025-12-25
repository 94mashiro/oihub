# Data Model: Store Field Abstraction

**Feature**: 001-store-field-abstraction
**Date**: 2025-12-25

## Entities

### Balance

Normalized balance data representing user's credit status.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| remainingCredit | number | ✅ | Available credit balance |
| consumedCredit | number | ✅ | Historical credit consumption |

**Validation Rules**:
- `remainingCredit` >= 0
- `consumedCredit` >= 0

**Source Mapping** (newapi):
- `remainingCredit` ← `quota`
- `consumedCredit` ← `used_quota`

---

### Cost

Normalized cost record representing per-model credit consumption.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| modelId | string | ✅ | Model identifier |
| creditCost | number | ✅ | Credit consumed for this model |
| tokenUsage | number | ✅ | Tokens consumed for this model |

**Validation Rules**:
- `modelId` non-empty string
- `creditCost` >= 0
- `tokenUsage` >= 0

**Source Mapping** (newapi):
- `modelId` ← `model_name`
- `creditCost` ← `quota`
- `tokenUsage` ← `token_used`

---

### Token

Normalized token data representing API key information.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| secretKey | string | ✅ | API key value (without prefix) |
| label | string | ✅ | User-defined token name |
| lastUsedAt | number | ✅ | Unix timestamp of last access |
| creditConsumed | number | ✅ | Total credit consumed by this token |
| group | string | ✅ | Token group identifier |

**Validation Rules**:
- `secretKey` non-empty string
- `label` non-empty string
- `lastUsedAt` >= 0
- `creditConsumed` >= 0

**Source Mapping** (newapi):
- `secretKey` ← `key`
- `label` ← `name`
- `lastUsedAt` ← `accessed_time`
- `creditConsumed` ← `used_quota`
- `group` ← `group`

---

### TokenGroup

Token group metadata for display purposes.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| description | string | ✅ | Group description for tooltip |
| multiplier | number | ✅ | Cost multiplier for this group |

**Source Mapping** (newapi):
- `description` ← `desc`
- `multiplier` ← `ratio`

---

### PlatformType

Enumeration of supported platform types.

| Value | Description |
|-------|-------------|
| `newapi` | Default platform (current implementation) |

**Extensibility**: New platform types added as string literals.

---

### Tenant (modified)

Extended tenant entity with platform type.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ... | ... | ... | (existing fields unchanged) |
| platformType | PlatformType | ✅ | Platform adapter to use (default: `newapi`) |

---

## Relationships

```
Tenant (1) ──── (1) Balance
Tenant (1) ──── (*) Cost
Tenant (1) ──── (*) Token
Tenant (1) ──── (*) TokenGroup
Tenant (*) ──── (1) PlatformType
```

---

## State Transitions

### Balance

No state transitions - pure data entity.

### Cost

No state transitions - immutable records from API.

### Token

No state transitions - pure data entity.

---

## Migration Schema

### v1 → v2: Balance Store

```typescript
// Before (v1)
type BalanceListV1 = Record<TenantId, TenantBalance>; // 22+ fields

// After (v2)
type BalanceListV2 = Record<TenantId, Balance>; // 2 fields

// Migration
(v1Data) => Object.fromEntries(
  Object.entries(v1Data).map(([id, b]) => [id, {
    remainingCredit: b.quota,
    consumedCredit: b.used_quota,
  }])
)
```

### v1 → v2: Cost Store

```typescript
// Before (v1)
type CostListV1 = Record<TenantId, Partial<Record<CostPeriod, CostData[]>>>; // 8 fields per item

// After (v2)
type CostListV2 = Record<TenantId, Partial<Record<CostPeriod, Cost[]>>>; // 3 fields per item

// Migration
(v1Data) => Object.fromEntries(
  Object.entries(v1Data).map(([tenantId, periods]) => [
    tenantId,
    Object.fromEntries(
      Object.entries(periods).map(([period, costs]) => [
        period,
        costs.map(c => ({
          modelId: c.model_name,
          creditCost: c.quota,
          tokenUsage: c.token_used,
        }))
      ])
    )
  ])
)
```

### v1 → v2: Token Store

```typescript
// Before (v1)
type TokenListV1 = Record<TenantId, Token[]>; // 6 fields per item

// After (v2)
type TokenListV2 = Record<TenantId, Token[]>; // 5 fields per item (created_time removed)

// Migration
(v1Data) => Object.fromEntries(
  Object.entries(v1Data).map(([tenantId, tokens]) => [
    tenantId,
    tokens.map(t => ({
      secretKey: t.key,
      label: t.name,
      lastUsedAt: t.accessed_time,
      creditConsumed: t.used_quota,
      group: t.group,
    }))
  ])
)
```

### Tenant Store: Add platformType

```typescript
// Migration adds default platformType to existing tenants
(v1Data) => v1Data.map(tenant => ({
  ...tenant,
  platformType: 'newapi', // default for backward compatibility
}))
```
