# Data Model: i7Relay Platform Adapter/Service Framework

**Feature**: 001-i7relay-adapter
**Date**: 2025-12-29

## Overview

i7Relay 平台框架代码的数据模型定义。由于是框架代码，类型定义使用占位符结构。

## Response Types (Platform-Specific)

### I7RelayBalanceResponse

```typescript
/** i7Relay 平台余额响应 - 占位符类型 */
export interface I7RelayBalanceResponse {
  // TODO: 根据实际 API 文档填充字段
  [key: string]: unknown;
}
```

### I7RelayCostsResponse

```typescript
/** i7Relay 平台消费记录响应 - 占位符类型 */
export type I7RelayCostsResponse = unknown[];
```

### I7RelayTokensResponse

```typescript
/** i7Relay 平台 Token 列表响应 - 占位符类型 */
export interface I7RelayTokensResponse {
  // TODO: 根据实际 API 文档填充字段
  [key: string]: unknown;
}
```

### I7RelayTokenGroupsResponse

```typescript
/** i7Relay 平台 Token 分组响应 - 占位符类型 */
export type I7RelayTokenGroupsResponse = Record<string, unknown>;
```

### I7RelayTenantInfoResponse

```typescript
/** i7Relay 平台租户信息响应 - 占位符类型 */
export interface I7RelayTenantInfoResponse {
  // TODO: 根据实际 API 文档填充字段
  [key: string]: unknown;
}
```

## Normalized Types (Shared)

框架代码使用现有的标准化类型，无需新增：

| Type | Location | Description |
|------|----------|-------------|
| `Balance` | `lib/api/adapters/types.ts` | 余额数据 |
| `Cost` | `lib/api/adapters/types.ts` | 消费记录 |
| `Token` | `lib/api/adapters/types.ts` | API Key 信息 |
| `TokenGroup` | `lib/api/adapters/types.ts` | Token 分组元数据 |
| `TenantInfo` | `types/tenant.ts` | 租户配置信息 |

## Entity Relationships

```
I7RelayRawService
    │
    ├── fetchBalance() → I7RelayBalanceResponse
    ├── fetchCosts() → I7RelayCostsResponse
    ├── fetchTokens() → I7RelayTokensResponse
    ├── fetchTokenGroups() → I7RelayTokenGroupsResponse
    └── fetchTenantInfo() → I7RelayTenantInfoResponse
           │
           ▼
    i7relayAdapter
           │
           ├── normalizeBalance() → Balance
           ├── normalizeCosts() → Cost[]
           ├── normalizeTokens() → Token[]
           ├── normalizeTokenGroups() → Record<string, TokenGroup>
           └── normalizeTenantInfo() → TenantInfo
```

## State Transitions

N/A - 框架代码不涉及状态管理。

## Validation Rules

| Field | Rule | Error |
|-------|------|-------|
| Service methods | 未实现时抛出 NotImplementedError | "I7Relay {method} not implemented" |
| Adapter methods | 空输入返回默认值 | 无异常，返回空数组/对象 |
