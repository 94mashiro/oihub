# Research: Tenant Form Reuse

**Feature**: 001-tenant-form-reuse
**Date**: 2025-12-26

## Overview

This research documents the analysis of existing tenant form implementations and the design decisions for the shared component.

## Existing Implementation Analysis

### Create Screen (`popup-tenant-create-screen/index.tsx`)

**Unique Features**:
- Provider presets (PackyAPI, PackyCode Codex, DuckCoding, IKunCode)
- `applyPreset()` function to auto-populate name and URL
- Generates new UUID via `crypto.randomUUID()`
- Calls `addTenant()` from tenant store

**Form Fields**:
- name (required, text)
- platformType (select: newapi, packycode_codex)
- url (required, URL type)
- token (required, password type)
- userId (required, text)

### Edit Screen (`popup-tenant-edit-screen/index.tsx`)

**Unique Features**:
- Loads existing tenant by ID from URL params
- Pre-populates form with tenant data
- Shows "not found" state for invalid tenant ID
- Calls `updateTenant()` from tenant store

**Form Fields**:
- name (required, text)
- url (required, URL type)
- token (required, password type)
- userId (required, number type - differs from create)
- platformType (select: only newapi option shown)

### Differences Identified

| Aspect | Create | Edit |
|--------|--------|------|
| Provider presets | Yes | No |
| Initial values | Empty | From existing tenant |
| Submit action | `addTenant()` | `updateTenant()` |
| userId input type | text | number |
| Platform options | newapi, packycode_codex | newapi only |
| Field order | name → platformType → url → token → userId | name → url → token → userId → platformType |

## Design Decisions

### Decision 1: Component API Design

**Decision**: Use a single `TenantForm` component with mode prop and callbacks

**Rationale**:
- Simplest approach that handles both use cases
- Mode prop (`create` | `edit`) controls preset visibility
- Callbacks for submit action allow screens to handle their specific logic

**Alternatives Considered**:
- Render props pattern - rejected as overly complex for this use case
- Compound components - rejected as unnecessary abstraction

### Decision 2: Form Field Normalization

**Decision**: Normalize field order and types across both modes

**Rationale**:
- Consistent user experience
- Simpler shared component implementation
- userId should be text type in both (current edit screen uses number incorrectly)

**Field Order** (normalized):
1. name
2. platformType
3. url
4. token
5. userId

### Decision 3: Platform Type Options

**Decision**: Show all platform options in both modes

**Rationale**:
- Edit screen currently only shows "newapi" which limits functionality
- Users should be able to change platform type when editing

### Decision 4: Presets Handling

**Decision**: Presets section rendered conditionally based on mode

**Rationale**:
- Presets only make sense for new tenant creation
- Edit mode should not show presets (existing tenant already has values)

## Component Interface

```typescript
interface TenantFormProps {
  mode: 'create' | 'edit';
  initialData?: TenantFormData;
  onSubmit: (data: TenantFormData) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
}

interface TenantFormData {
  name: string;
  url: string;
  token: string;
  userId: string;
  platformType: PlatformType;
}
```

## Conclusion

No external research required. The refactoring is straightforward with clear patterns from existing code. All NEEDS CLARIFICATION items resolved through code analysis.
