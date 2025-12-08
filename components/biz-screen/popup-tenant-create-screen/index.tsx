import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTenantStore } from '@/lib/state/tenant-store';
import type { Tenant } from '@/types/tenant';
import { Form } from '@/components/ui/form';
import { Field, FieldControl, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PopupTenantCreateScreen = () => {
  const navigate = useNavigate();
  const addTenant = useTenantStore((state) => state.addTenant);
  const ready = useTenantStore((state) => state.ready);

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    token: '',
    userId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    // Browser validation check
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      return;
    }

    // Generate new tenant object
    const newTenant: Tenant = {
      id: crypto.randomUUID(),
      name: formData.name.trim(),
      url: formData.url.trim(),
      token: formData.token.trim(),
      userId: formData.userId.trim(),
    };

    // Submit to store
    setIsSubmitting(true);
    try {
      await addTenant(newTenant);
      // Navigate back on success
      navigate(-1);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to create tenant. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Create New Tenant</h1>
      </div>

      {submitError && (
        <div className="rounded-lg border border-destructive/36 bg-destructive/4 p-3 text-sm text-destructive-foreground">
          {submitError}
        </div>
      )}

      {!ready ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor="tenant-name">Tenant Name</FieldLabel>
            <FieldControl
              render={() => (
                <Input
                  id="tenant-name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  minLength={1}
                  placeholder="e.g., My Production Tenant"
                  disabled={isSubmitting}
                />
              )}
            />
            <FieldError match="valueMissing">Tenant name is required</FieldError>
            <FieldError match="tooShort">Tenant name is too short</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="tenant-url">API URL</FieldLabel>
            <FieldControl
              render={() => (
                <Input
                  id="tenant-url"
                  name="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                  required
                  placeholder="https://api.example.com"
                  disabled={isSubmitting}
                />
              )}
            />
            <FieldError match="valueMissing">API URL is required</FieldError>
            <FieldError match="typeMismatch">Please enter a valid URL</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="tenant-token">Access Token</FieldLabel>
            <FieldControl
              render={() => (
                <Input
                  id="tenant-token"
                  name="token"
                  type="password"
                  value={formData.token}
                  onChange={(e) => setFormData((prev) => ({ ...prev, token: e.target.value }))}
                  required
                  placeholder="Enter your access token"
                  disabled={isSubmitting}
                />
              )}
            />
            <FieldError match="valueMissing">Access token is required</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="tenant-userId">User ID</FieldLabel>
            <FieldControl
              render={() => (
                <Input
                  id="tenant-userId"
                  name="userId"
                  value={formData.userId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
                  required
                  placeholder="e.g., user123"
                  disabled={isSubmitting}
                />
              )}
            />
            <FieldError match="valueMissing">User ID is required</FieldError>
          </Field>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !ready}>
              {isSubmitting ? 'Creating...' : 'Create Tenant'}
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default PopupTenantCreateScreen;
