import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { useTenantStore } from '@/lib/state/tenant-store';
import type { Tenant } from '@/types/tenant';
import type { PlatformType } from '@/lib/api/adapters';
import { DEFAULT_PLATFORM_TYPE } from '@/lib/constants/tenants';
import { Form } from '@/components/ui/form';
import { Field, FieldControl, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from '@/components/ui/select';
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from '@/components/ui/frame';
import packyLogo from '@/assets/packy-logo.svg';
import duckcodingLogo from '@/assets/duckcoding-logo.gif';
import ikuncodeLogo from '@/assets/ikuncode-logo.jpeg';

const PROVIDER_PRESETS = [
  {
    id: 'packy',
    name: 'PackyAPI',
    url: 'https://www.packyapi.com',
    icon: packyLogo,
  },
  {
    id: 'duckcoding',
    name: 'DuckCoding',
    url: 'https://duckcoding.com',
    icon: duckcodingLogo,
  },
  {
    id: 'ikuncode',
    name: 'IKunCode',
    url: 'https://api.ikuncode.cc',
    icon: ikuncodeLogo,
  },
] as const;

const PopupTenantCreateScreen = () => {
  const navigate = useNavigate();
  const addTenant = useTenantStore((state) => state.addTenant);
  const ready = useTenantStore((state) => state.ready);

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    token: '',
    userId: '',
    platformType: DEFAULT_PLATFORM_TYPE as PlatformType,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyPreset = (preset: (typeof PROVIDER_PRESETS)[number]) => {
    setFormData((prev) => ({ ...prev, name: preset.name, url: preset.url }));
  };
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const form = e.currentTarget;
    if (!form.checkValidity()) return;

    const newTenant: Tenant = {
      id: crypto.randomUUID(),
      name: formData.name.trim(),
      url: formData.url.trim(),
      token: formData.token.trim(),
      userId: formData.userId.trim(),
      platformType: formData.platformType,
    };

    setIsSubmitting(true);
    try {
      await addTenant(newTenant);
      navigate(-1);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '创建失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Frame>
      <FrameHeader className="relative p-2">
        <div className="absolute top-2.5 left-2">
          <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
        </div>
        <div className="pl-10">
          <FrameTitle>添加账号</FrameTitle>
          <FrameDescription className="mt-0.5 text-xs">配置 API 访问凭证</FrameDescription>
        </div>
      </FrameHeader>

      <FramePanel className="p-3">
        {submitError && (
          <div className="border-destructive/32 bg-destructive/4 text-destructive-foreground mb-3 rounded-md border p-2.5 text-xs">
            {submitError}
          </div>
        )}

        {!ready ? (
          <div className="text-muted-foreground text-sm">加载中...</div>
        ) : (
          <Form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs">快速选择</span>
              <div className="flex flex-wrap gap-1.5">
                {PROVIDER_PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => applyPreset(preset)}
                    disabled={isSubmitting}
                  >
                    {preset.icon && <img src={preset.icon} alt="" className="size-3.5" />}
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

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
              >
                <SelectTrigger id="tenant-platformType" size="sm" className="w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  <SelectItem value="newapi">NewAPI</SelectItem>
                </SelectPopup>
              </Select>
            </Field>
          </Form>
        )}
      </FramePanel>

      <FrameFooter className="flex justify-end gap-2 px-0 py-3">
        <Button
          size="sm"
          type="submit"
          form="tenant-create-form"
          disabled={isSubmitting || !ready}
          onClick={() => {
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
          }}
        >
          {isSubmitting ? '创建中...' : '创建'}
        </Button>
      </FrameFooter>
    </Frame>
  );
};

export default PopupTenantCreateScreen;
