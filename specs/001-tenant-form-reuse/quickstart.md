# Quickstart: Tenant Form Reuse

**Feature**: 001-tenant-form-reuse
**Date**: 2025-12-26

## Overview

This feature extracts shared form logic from `popup-tenant-create-screen` and `popup-tenant-edit-screen` into a reusable `TenantForm` component.

## Component Usage

### Create Mode

```tsx
import { TenantForm } from '@/components/biz-screen/tenant-form';

const CreateScreen = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const addTenant = useTenantStore((state) => state.addTenant);

  const handleSubmit = async (data: TenantFormData) => {
    setIsSubmitting(true);
    try {
      await addTenant({
        id: crypto.randomUUID(),
        ...data,
      });
      navigate(-1);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '创建失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TenantForm
      mode="create"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
    />
  );
};
```

### Edit Mode

```tsx
import { TenantForm } from '@/components/biz-screen/tenant-form';

const EditScreen = () => {
  const { id } = useParams<{ id: string }>();
  const tenant = useTenantStore((state) =>
    state.tenantList.find((t) => t.id === id)
  );
  const updateTenant = useTenantStore((state) => state.updateTenant);

  const handleSubmit = async (data: TenantFormData) => {
    await updateTenant(id!, data);
    navigate(-1);
  };

  return (
    <TenantForm
      mode="edit"
      initialData={tenant}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
    />
  );
};
```

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| mode | `'create' \| 'edit'` | Yes | Controls preset visibility and labels |
| initialData | `TenantFormData` | No | Pre-populate form (required for edit) |
| onSubmit | `(data: TenantFormData) => Promise<void>` | Yes | Submit handler |
| isSubmitting | `boolean` | Yes | Disables form during submission |
| submitError | `string \| null` | Yes | Error message to display |

## File Structure

```
components/biz-screen/
├── tenant-form/
│   └── index.tsx          # Shared form component
├── popup-tenant-create-screen/
│   └── index.tsx          # Uses TenantForm mode="create"
└── popup-tenant-edit-screen/
    └── index.tsx          # Uses TenantForm mode="edit"
```

## Testing Checklist

- [ ] Create tenant with all fields filled
- [ ] Create tenant using provider preset
- [ ] Edit existing tenant
- [ ] Validation errors display correctly
- [ ] Submission errors display correctly
- [ ] Loading state during submission
- [ ] Navigate back on success
