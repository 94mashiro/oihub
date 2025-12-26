# Data Model: Tenant Form Reuse

**Feature**: 001-tenant-form-reuse
**Date**: 2025-12-26

## Entities

### TenantFormData

Represents the form state for tenant creation/editing.

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | Yes | Non-empty | Display name for the tenant |
| url | string | Yes | Valid URL format | API endpoint URL |
| token | string | Yes | Non-empty | Access token for authentication |
| userId | string | Yes | Non-empty | User identifier |
| platformType | PlatformType | Yes | Enum value | Platform adapter type |

### PlatformType (Enum)

| Value | Label | Description |
|-------|-------|-------------|
| newapi | NewAPI | Standard NewAPI platform |
| packycode_codex | PackyCode Codex | PackyCode Codex platform |

### ProviderPreset

Pre-configured provider settings for quick tenant creation.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique preset identifier |
| name | string | Display name |
| url | string | Default API URL |
| icon | string | Icon asset path |
| platformType | PlatformType | Default platform type |

## State Transitions

### Form Submission Flow

```
[Initial] → [Editing] → [Submitting] → [Success/Error]
     ↑                        ↓
     └────────────────────────┘ (on error, return to editing)
```

| State | isSubmitting | submitError | User Actions |
|-------|--------------|-------------|--------------|
| Initial | false | null | Fill form, select preset (create only) |
| Editing | false | null | Modify fields, submit |
| Submitting | true | null | Wait (form disabled) |
| Success | false | null | Navigate back |
| Error | false | string | View error, retry |

## Relationships

```
TenantForm
    ├── uses → TenantFormData (internal state)
    ├── receives → ProviderPreset[] (create mode only)
    └── emits → onSubmit(TenantFormData)

CreateScreen
    ├── renders → TenantForm (mode: create)
    └── handles → addTenant(Tenant)

EditScreen
    ├── renders → TenantForm (mode: edit)
    └── handles → updateTenant(id, Partial<Tenant>)
```

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| name | Required, non-empty | 请输入名称 |
| url | Required, valid URL | 请输入 API 地址 / 请输入有效的 URL |
| token | Required, non-empty | 请输入访问令牌 |
| userId | Required, non-empty | 请输入用户 ID |
| platformType | Required, valid enum | (handled by select) |
