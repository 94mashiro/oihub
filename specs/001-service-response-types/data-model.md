# Data Model: Platform Service Response Type Definitions

**Feature**: 001-service-response-types
**Date**: 2025-12-27
**Status**: Complete

## Overview

This document defines all entity types for platform-specific API response structures. Types are derived from actual API responses captured from existing adapter implementations in the codebase.

## Type Organization

Types are organized by platform with clear module boundaries:
- `lib/api/types/platforms/newapi-response-types.ts` - NewAPI platform types
- `lib/api/types/platforms/cubence-response-types.ts` - Cubence platform types
- `lib/api/types/platforms/packycode-codex-response-types.ts` - PackyCode Codex platform types
- `lib/api/types/platforms/response-aggregates.ts` - Multi-endpoint response containers
- `lib/api/types/platforms/index.ts` - Central exports + platform type mapping utility

---

## NewAPI Platform Types

### NewAPIBalanceResponse

Returned by `/api/user/self` endpoint.

```typescript
export interface NewAPIBalanceResponse {
  /** User ID */
  id: number;

  /** Username */
  username: string;

  /** Display name */
  display_name: string;

  /** User email address */
  email: string;

  /** User role identifier */
  role: number;

  /** Account status code */
  status: number;

  /** User group identifier */
  group: string;

  /** Remaining account credits (maps to remainingCredit) */
  quota: number;

  /** Credits consumed since account creation (maps to consumedCredit) */
  used_quota: number;

  /** Total API request count */
  request_count: number;

  /** Affiliate code */
  aff_code: string;

  /** Affiliate count */
  aff_count: number;

  /** Affiliate quota */
  aff_quota: number;

  /** Affiliate history quota */
  aff_history_quota: number;

  /** Inviter user ID */
  inviter_id: number;

  /** GitHub OAuth ID */
  github_id: string;

  /** Telegram OAuth ID */
  telegram_id: string;

  /** WeChat OAuth ID */
  wechat_id: string;

  /** Linux.do OAuth ID */
  linux_do_id: string;

  /** OIDC provider ID */
  oidc_id: string;

  /** Stripe customer ID */
  stripe_customer: string;

  /** User settings JSON string */
  setting: string;

  /** Sidebar modules configuration */
  sidebar_modules: string;

  /** User permissions */
  permissions: {
    sidebar_modules: {
      admin: boolean;
    };
    sidebar_settings: boolean;
  };
}
```

### NewAPICostData

Returned by `/api/data/self?start_timestamp=X&end_timestamp=Y` endpoint (array of items).

```typescript
export interface NewAPICostData {
  /** API request count for this model */
  count: number;

  /** Unix timestamp when cost was created */
  created_at: number;

  /** Cost record ID */
  id: number;

  /** AI model identifier (maps to modelId) */
  model_name: string;

  /** Credit cost for this usage (maps to creditCost) */
  quota: number;

  /** Tokens consumed (maps to tokenUsage) */
  token_used: number;

  /** User ID who incurred the cost */
  user_id: number;

  /** Username */
  username: string;
}

export type NewAPICostsResponse = NewAPICostData[];
```

### NewAPITokensResponse

Returned by `/api/token/?p=1&size=100` endpoint (paginated).

```typescript
export interface NewAPIToken {
  /** Unix timestamp when token was last accessed (maps to lastUsedAt) */
  accessed_time: number;

  /** API key secret (maps to secretKey) */
  key: string;

  /** Token display name (maps to label) */
  name: string;

  /** Credits consumed by this token (maps to creditConsumed) */
  used_quota: number;

  /** Unix timestamp when token was created */
  created_time: number;

  /** Token group name (maps to group) */
  group: string;
}

export interface NewAPITokensResponse {
  /** Array of tokens */
  items: NewAPIToken[];

  /** Total token count (optional, for pagination) */
  total?: number;

  /** Current page number (optional, for pagination) */
  page?: number;

  /** Page size (optional, for pagination) */
  page_size?: number;
}
```

### NewAPITokenGroupsResponse

Returned by `/api/user/self/groups` endpoint (map of group names to metadata).

```typescript
export interface NewAPITokenGroup {
  /** Group description (maps to description) */
  desc: string;

  /** Credit multiplier for this group (maps to multiplier) */
  ratio: number;
}

export type NewAPITokenGroupsResponse = Record<string, NewAPITokenGroup>;
```

### NewAPITenantInfoResponse

Returned by `/api/status` endpoint.

```typescript
export interface NewAPITenantInfoResponse {
  /** Credits per unit (maps to creditUnit) */
  quota_per_unit?: number;

  /** USD exchange rate (maps to exchangeRate) */
  usd_exchange_rate?: number;

  /** Quota display format type (maps to displayFormat) */
  quota_display_type?: string;

  /** Available API endpoints (maps to endpoints) */
  api_info?: Array<{
    id: number;
    route: string;
    description: string;
    url: string;
  }>;

  /** Platform announcements (maps to notices) */
  announcements?: Array<{
    id: number;
    content: string;
    extra: string;
    publishDate: string;
    type: string;
  }>;
}
```

---

## Cubence Platform Types

### CubenceBalanceResponse

Returned by `/api/user/self` endpoint.

```typescript
export interface CubenceBalanceResponse {
  /** Available credits (preferred over total_credit for remainingCredit) */
  available_credit?: number;

  /** Total credits (fallback for remainingCredit if available_credit missing) */
  total_credit?: number;

  /** Credits consumed (maps to consumedCredit, defaults to 0 if missing) */
  used_credit?: number;
}
```

### CubenceCostData

Returned by `/api/data/self?start_timestamp=X&end_timestamp=Y` endpoint (array of items).

```typescript
export interface CubenceCostData {
  /** AI model identifier (maps to modelId, defaults to 'unknown' if missing) */
  model?: string;

  /** Credit cost for this usage (maps to creditCost, defaults to 0 if missing) */
  cost?: number;

  /** Tokens consumed (maps to tokenUsage, defaults to 0 if missing) */
  tokens?: number;
}

export type CubenceCostsResponse = CubenceCostData[];
```

### CubenceTokensResponse

Returned by `/api/token/?p=1&size=100` endpoint (paginated).

```typescript
export interface CubenceToken {
  /** API key secret (maps to secretKey, defaults to '' if missing) */
  key?: string;

  /** Token display name (maps to label, defaults to 'Unnamed Token' if missing) */
  name?: string;

  /** Unix timestamp when token was last used (maps to lastUsedAt, defaults to 0 if missing) */
  last_used?: number;

  /** Credits consumed by this token (maps to creditConsumed, defaults to 0 if missing) */
  usage?: number;

  /** Token category/group (maps to group, defaults to 'default' if missing) */
  category?: string;
}

export interface CubenceTokensResponse {
  /** Array of tokens (may be undefined) */
  items?: CubenceToken[];

  /** Total token count (optional, for pagination) */
  total?: number;

  /** Current page number (optional, for pagination) */
  page?: number;

  /** Page size (optional, for pagination) */
  page_size?: number;
}
```

### CubenceTokenGroupsResponse

Returned by `/api/user/self/groups` endpoint (map of group names to metadata).

```typescript
export interface CubenceTokenGroup {
  /** Group description (maps to description, defaults to '' if missing) */
  description?: string;

  /** Credit rate/multiplier for this group (maps to multiplier, defaults to 1.0 if missing) */
  rate?: number;
}

export type CubenceTokenGroupsResponse = Record<string, CubenceTokenGroup>;
```

### CubenceTenantInfoResponse

Returned by merging `/api/v1/dashboard/overview` and `/api/v1/announcements?page=1&page_size=10` endpoints.

```typescript
export interface CubenceTenantInfoResponse {
  /** Credits per unit (maps to creditUnit) */
  credit_unit?: number;

  /** Exchange rate (maps to exchangeRate) */
  exchange_rate?: number;

  /** Display format type (maps to displayFormat) */
  display_format?: string;

  /** Available endpoints (maps to endpoints) */
  endpoints?: any[];

  /** Nested announcements object */
  announcements?: {
    /** Platform announcements array (maps to notices) */
    announcements?: Array<{
      id: number;
      content: string;
      /** Announcement title (maps to extra in normalized type) */
      title: string;
      /** Publication timestamp (maps to publishDate) */
      published_at: string;
    }>;
  };
}
```

---

## PackyCode Codex Platform Types

### PackyCodeCodexBalanceResponse

Returned by `/api/user/self` endpoint.

```typescript
export interface PackyCodeCodexBalanceResponse {
  /** Remaining quota (preferred over total_quota for remainingCredit) */
  remaining_quota?: number;

  /** Total quota (fallback for remainingCredit if remaining_quota missing) */
  total_quota?: number;

  /** Consumed quota (maps to consumedCredit, defaults to 0 if missing) */
  consumed_quota?: number;
}
```

### PackyCodeCodexCostData

Returned by `/api/data/self?start_timestamp=X&end_timestamp=Y` endpoint (array of items).

```typescript
export interface PackyCodeCodexCostData {
  /** AI model identifier (maps to modelId, defaults to 'unknown' if missing) */
  model_id?: string;

  /** Credit usage for this request (maps to creditCost, defaults to 0 if missing) */
  credit_usage?: number;

  /** Token count consumed (maps to tokenUsage, defaults to 0 if missing) */
  token_count?: number;
}

export type PackyCodeCodexCostsResponse = PackyCodeCodexCostData[];
```

### PackyCodeCodexTokensResponse

Returned by `/api/token/?p=1&size=100` endpoint (paginated).

```typescript
export interface PackyCodeCodexToken {
  /** API key secret (maps to secretKey, defaults to '' if missing) */
  api_key?: string;

  /** Token display name (maps to label, defaults to 'Unnamed Token' if missing) */
  token_name?: string;

  /** Unix timestamp of last access (maps to lastUsedAt, defaults to 0 if missing) */
  last_access_time?: number;

  /** Total usage credits (maps to creditConsumed, defaults to 0 if missing) */
  total_usage?: number;

  /** Token group name (maps to group, defaults to 'default' if missing) */
  token_group?: string;
}

export interface PackyCodeCodexTokensResponse {
  /** Array of tokens (may be undefined) */
  items?: PackyCodeCodexToken[];

  /** Total token count (optional, for pagination) */
  total?: number;

  /** Current page number (optional, for pagination) */
  page?: number;

  /** Page size (optional, for pagination) */
  page_size?: number;
}
```

### PackyCodeCodexTokenGroupsResponse

Returned by `/api/user/self/groups` endpoint (map of group names to metadata).

```typescript
export interface PackyCodeCodexTokenGroup {
  /** Group description (maps to description, defaults to '' if missing) */
  group_desc?: string;

  /** Credit ratio/multiplier for this group (maps to multiplier, defaults to 1.0 if missing) */
  credit_ratio?: number;
}

export type PackyCodeCodexTokenGroupsResponse = Record<string, PackyCodeCodexTokenGroup>;
```

### PackyCodeCodexTenantInfoResponse

Returned by `/api/status` endpoint.

```typescript
export interface PackyCodeCodexTenantInfoResponse {
  /** Credits per unit (maps to creditUnit) */
  credit_per_unit?: number;

  /** USD rate (maps to exchangeRate) */
  usd_rate?: number;

  /** Display type format (maps to displayFormat) */
  display_type?: string;

  /** API endpoints list (maps to endpoints) */
  api_endpoints?: any[];

  /** Platform announcements (maps to notices) */
  announcements?: Array<{
    id: number;
    content: string;
    /** Announcement title (maps to extra in normalized type) */
    title: string;
    /** Publication timestamp (maps to publishDate) */
    published_at: string;
  }>;
}
```

---

## Response Aggregate Types

These types bundle multiple API responses together before adapter transformation (used in orchestrator layer).

### BalanceSources

```typescript
export interface NewAPIBalanceSources {
  primary: NewAPIBalanceResponse;
}

export interface CubenceBalanceSources {
  primary: CubenceBalanceResponse;
}

export interface PackyCodeCodexBalanceSources {
  primary: PackyCodeCodexBalanceResponse;
}

export type BalanceSources =
  | NewAPIBalanceSources
  | CubenceBalanceSources
  | PackyCodeCodexBalanceSources;
```

### CostSources

```typescript
export interface NewAPICostSources {
  costs: NewAPICostsResponse;
}

export interface CubenceCostSources {
  costs: CubenceCostsResponse;
}

export interface PackyCodeCodexCostSources {
  costs: PackyCodeCodexCostsResponse;
}

export type CostSources =
  | NewAPICostSources
  | CubenceCostSources
  | PackyCodeCodexCostSources;
```

### TokenSources

```typescript
export interface NewAPITokenSources {
  tokens: NewAPITokensResponse;
  groups?: NewAPITokenGroupsResponse;
}

export interface CubenceTokenSources {
  tokens: CubenceTokensResponse;
  groups?: CubenceTokenGroupsResponse;
}

export interface PackyCodeCodexTokenSources {
  tokens: PackyCodeCodexTokensResponse;
  groups?: PackyCodeCodexTokenGroupsResponse;
}

export type TokenSources =
  | NewAPITokenSources
  | CubenceTokenSources
  | PackyCodeCodexTokenSources;
```

### TenantInfoSources

```typescript
export interface NewAPITenantInfoSources {
  status: NewAPITenantInfoResponse;
}

export interface CubenceTenantInfoSources {
  status: CubenceTenantInfoResponse;
}

export interface PackyCodeCodexTenantInfoSources {
  status: PackyCodeCodexTenantInfoResponse;
}

export type TenantInfoSources =
  | NewAPITenantInfoSources
  | CubenceTenantInfoSources
  | PackyCodeCodexTenantInfoSources;
```

---

## Platform Type Mapping Utility

Enables type-safe platform lookups by platform identifier string.

```typescript
import type { PlatformType } from '@/types/tenant';

export interface PlatformResponseTypeMap {
  newapi: {
    balance: NewAPIBalanceResponse;
    costs: NewAPICostsResponse;
    tokens: NewAPITokensResponse;
    tokenGroups: NewAPITokenGroupsResponse;
    tenantInfo: NewAPITenantInfoResponse;
  };
  cubence: {
    balance: CubenceBalanceResponse;
    costs: CubenceCostsResponse;
    tokens: CubenceTokensResponse;
    tokenGroups: CubenceTokenGroupsResponse;
    tenantInfo: CubenceTenantInfoResponse;
  };
  packycode_codex: {
    balance: PackyCodeCodexBalanceResponse;
    costs: PackyCodeCodexCostsResponse;
    tokens: PackyCodeCodexTokensResponse;
    tokenGroups: PackyCodeCodexTokenGroupsResponse;
    tenantInfo: PackyCodeCodexTenantInfoResponse;
  };
}

/** Get response type for platform + endpoint combination */
export type PlatformResponse<
  P extends PlatformType,
  E extends keyof PlatformResponseTypeMap[P]
> = PlatformResponseTypeMap[P][E];
```

---

## Field Naming Patterns Summary

| Platform | Pattern | Examples |
|----------|---------|----------|
| NewAPI | `snake_case` abbreviated | `quota`, `used_quota`, `model_name`, `token_used` |
| Cubence | `snake_case` descriptive | `available_credit`, `used_credit`, `last_used`, `category` |
| PackyCode Codex | `snake_case` prefixed | `remaining_quota`, `credit_usage`, `api_key`, `token_group` |

---

## Type Safety Guarantees

1. **Compile-Time Validation**: All adapter transformations will have typed input parameters, catching field access errors immediately
2. **Platform Isolation**: Platform-specific types prevent accidental cross-platform field access
3. **Optional Field Handling**: Types accurately reflect which fields may be missing, forcing null-safe access patterns
4. **Generic Type Support**: `PlatformResponse<P, E>` utility enables type-safe generic functions
5. **Response Aggregate Typing**: Orchestrators work with typed multi-endpoint responses instead of `unknown`

---

## Validation Rules

### Required vs Optional Fields

- **NewAPI**: Most fields are required (non-optional). Exceptions: pagination metadata (`total?`, `page?`, `page_size?`) and some tenant info fields
- **Cubence**: Most fields are optional with defaults applied during normalization
- **PackyCode Codex**: Most fields are optional with defaults applied during normalization

### Null Handling

- **Optional fields** (`field?:` Type): Field may be absent from response object
- **Nullable fields** (`field: Type | null`): Field always present but value may be `null`
- Based on actual API behavior captured from adapters:
  - NewAPI: Fields are present or absent, not null
  - Cubence: Fields are present or absent, not null
  - PackyCode Codex: Fields are present or absent, not null

### Default Values (Applied in Adapters)

When optional fields are missing, adapters apply these defaults during normalization:

| Normalized Field | Default Value |
|------------------|---------------|
| `consumedCredit` | `0` |
| `modelId` | `'unknown'` |
| `creditCost` | `0` |
| `tokenUsage` | `0` |
| `secretKey` | `''` |
| `label` | `'Unnamed Token'` |
| `lastUsedAt` | `0` |
| `creditConsumed` | `0` |
| `group` | `'default'` |
| `description` | `''` |
| `multiplier` | `1.0` |

---

## Entity Relationships

```
PlatformType (newapi | cubence | packycode_codex)
    │
    ├──> BalanceResponse → BalanceSources → Balance (normalized)
    │
    ├──> CostsResponse → CostSources → Cost[] (normalized)
    │
    ├──> TokensResponse + TokenGroupsResponse → TokenSources → Token[] + TokenGroup map (normalized)
    │
    └──> TenantInfoResponse → TenantInfoSources → TenantInfo (normalized)
```

---

## Next Steps

1. Implement type definitions in `lib/api/types/platforms/` directory
2. Generate JSON schemas for all 15 platform × endpoint combinations
3. Update service layer interfaces to use typed return values
4. Update adapter interfaces to use typed source parameters
5. Create type-level tests to validate platform coverage
