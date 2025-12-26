# Data Model: 平台类型字段

**Feature**: 001-platform-type
**Date**: 2025-12-26

## Entities

### Tenant (Updated)

账号实体，存储用户添加的 API 平台账号信息。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | TenantId (string) | Yes | 唯一标识符 |
| name | string | Yes | 用户定义的账号名称 |
| token | string | Yes | API 访问令牌 |
| userId | string | Yes | 平台用户 ID |
| url | string | Yes | 平台 API 基础 URL |
| platformType | PlatformType | No* | 平台类型，默认 "newapi" |

*注：为向后兼容，字段可选，但运行时始终有值（使用默认值）

**Validation Rules**:
- `id`: 非空字符串，全局唯一
- `name`: 非空字符串
- `token`: 非空字符串
- `userId`: 非空字符串
- `url`: 有效 URL 格式
- `platformType`: 必须是 `PlatformType` 枚举值之一，或为空（使用默认值）

**Uniqueness**:
- `(url, userId)` 组合唯一，防止重复添加同一平台的同一账号

### PlatformType (Existing)

平台类型枚举，标识支持的 API 平台。

| Value | Description |
|-------|-------------|
| "newapi" | NewAPI 平台（当前唯一支持的平台） |

**Extensibility**: 未来可添加新平台类型，如 "oneapi", "voapi" 等。

### PlatformAdapter (Existing)

平台适配器接口，定义数据转换方法。

| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| normalizeBalance | unknown | Balance | 转换余额数据 |
| normalizeCosts | unknown[] | Cost[] | 转换消费记录 |
| normalizeTokens | unknown[] | Token[] | 转换令牌列表 |
| normalizeTokenGroups | unknown | Record<string, TokenGroup> | 转换令牌分组 |
| normalizeTenantInfo | unknown | TenantInfo | 转换租户信息 |

## Relationships

```
Tenant --[has one]--> PlatformType
PlatformType --[maps to]--> PlatformAdapter
```

## State Transitions

Tenant 实体无复杂状态机，主要操作：
- Create: 添加新账号（必须指定或使用默认 platformType）
- Update: 编辑账号信息（可修改 platformType）
- Delete: 删除账号

## Storage Schema

```typescript
// chrome.storage.local 存储结构
interface TenantPersistedState {
  selectedTenantId: TenantId;
  tenantList: Tenant[];  // Tenant 包含 platformType 字段
}
```

## Default Values

| Field | Default | Condition |
|-------|---------|-----------|
| platformType | "newapi" | 未指定或为空时 |
