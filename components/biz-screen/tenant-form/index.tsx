import { useState } from 'react';

import { PlatformType } from '@/lib/api/adapters';
import { DEFAULT_PLATFORM_TYPE } from '@/lib/constants/tenants';
import { Form } from '@/components/ui/form';
import { Field, FieldControl, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PresetButton, PresetVariant } from '@/components/biz/preset-button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from '@/components/ui/select';
import packyLogo from '@/assets/packy-logo.svg';
import cubenceLogo from '@/assets/cubence.svg';
import i7RelayLogo from '@/assets/i7relay-logo.svg';

export interface TenantFormData {
  name: string;
  url: string;
  token: string;
  userId?: string;
  platformType: PlatformType;
}

export interface TenantFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<TenantFormData>;
  onSubmit: (data: TenantFormData) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
}

const PROVIDER_PRESETS = [
  {
    id: 'packy',
    name: 'PackyAPI',
    url: 'https://www.packyapi.com',
    icon: packyLogo,
    platformType: PlatformType.NewAPI,
    variant: 'premium',
  },
  {
    id: 'cubence',
    name: 'Cubence',
    url: 'https://cubence.com',
    icon: cubenceLogo,
    platformType: PlatformType.Cubence,
    variant: 'default',
  },
  {
    id: 'packycode_codex',
    name: 'PackyCode(Codex)',
    url: 'https://codex.packycode.com',
    icon: packyLogo,
    platformType: PlatformType.PackyCodeCodex,
    variant: 'default',
  },
  {
    id: 'i7relay',
    name: 'i7Relay',
    url: 'https://i7dc.com',
    icon: i7RelayLogo,
    platformType: PlatformType.I7Relay,
    variant: 'default',
  },
];

const PLATFORM_TYPE_OPTIONS = [
  { value: PlatformType.NewAPI, label: 'NewAPI' },
  { value: PlatformType.PackyCodeCodex, label: 'PackyCode(Codex)' },
  { value: PlatformType.Cubence, label: 'Cubence' },
  { value: PlatformType.I7Relay, label: 'i7Relay' },
] as const;

export const TenantForm = ({
  mode,
  initialData,
  onSubmit,
  isSubmitting,
  submitError,
}: TenantFormProps) => {
  const [formData, setFormData] = useState<TenantFormData>({
    name: initialData?.name ?? '',
    url: initialData?.url ?? '',
    token: initialData?.token ?? '',
    userId: initialData?.userId ?? '',
    platformType: initialData?.platformType ?? DEFAULT_PLATFORM_TYPE,
  });

  const applyPreset = (preset: (typeof PROVIDER_PRESETS)[number]) => {
    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      url: preset.url,
      platformType: preset.platformType,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) return;

    await onSubmit({
      name: formData.name.trim(),
      url: formData.url.trim(),
      token: formData.token.trim(),
      userId: formData.platformType === PlatformType.NewAPI ? formData.userId?.trim() : undefined,
      platformType: formData.platformType,
    });
  };

  return (
    <>
      {submitError && (
        <div className="border-destructive/32 bg-destructive/4 text-destructive-foreground mb-3 rounded-md border p-2.5 text-xs">
          {submitError}
        </div>
      )}

      <Form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === 'create' && (
          <div className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs">快速选择</span>
            <div className="flex flex-wrap gap-1.5">
              {PROVIDER_PRESETS.map((preset) => (
                <PresetButton
                  key={preset.id}
                  type="button"
                  size="sm"
                  variant={preset.variant as PresetVariant}
                  className="h-7 px-2.5 text-xs"
                  onClick={() => applyPreset(preset)}
                  disabled={isSubmitting}
                >
                  {preset.icon && <img src={preset.icon} alt="" className="size-3.5" />}
                  {preset.name}
                </PresetButton>
              ))}
            </div>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="tenant-name" className="text-xs">
            名称
          </FieldLabel>
          <FieldControl
            render={() => (
              <Input
                id="tenant-name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
                placeholder="生产环境"
                disabled={isSubmitting}
                size="sm"
                className="text-sm"
              />
            )}
          />
          <FieldError match="valueMissing">请输入名称</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="tenant-platformType" className="text-xs">
            平台类型
          </FieldLabel>
          <Select
            value={formData.platformType}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, platformType: value as PlatformType }))
            }
            disabled={isSubmitting}
            items={PLATFORM_TYPE_OPTIONS}
          >
            <SelectTrigger id="tenant-platformType" size="sm" className="w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              {PLATFORM_TYPE_OPTIONS.map((option) => (
                <SelectItem className="text-sm" key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="tenant-url" className="text-xs">
            API 地址
          </FieldLabel>
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
                size="sm"
                className="text-sm"
              />
            )}
          />
          <FieldError match="valueMissing">请输入 API 地址</FieldError>
          <FieldError match="typeMismatch">请输入有效的 URL</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="tenant-token" className="text-xs">
            访问令牌
          </FieldLabel>
          <FieldControl
            render={() => (
              <Input
                id="tenant-token"
                name="token"
                type="password"
                value={formData.token}
                onChange={(e) => setFormData((prev) => ({ ...prev, token: e.target.value }))}
                required
                disabled={isSubmitting}
                size="sm"
                className="text-sm"
              />
            )}
          />
          <FieldError match="valueMissing">请输入访问令牌</FieldError>
        </Field>

        {formData.platformType === PlatformType.NewAPI && (
          <Field>
            <FieldLabel htmlFor="tenant-userId" className="text-xs">
              用户 ID
            </FieldLabel>
            <FieldControl
              render={() => (
                <Input
                  id="tenant-userId"
                  name="userId"
                  value={formData.userId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
                  required
                  disabled={isSubmitting}
                  size="sm"
                  className="text-sm"
                />
              )}
            />
            <FieldError match="valueMissing">请输入用户 ID</FieldError>
          </Field>
        )}
      </Form>
    </>
  );
};
