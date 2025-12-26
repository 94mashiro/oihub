import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { useTenantStore } from '@/lib/state/tenant-store';
import type { Tenant } from '@/types/tenant';
import { Button } from '@/components/ui/button';
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from '@/components/ui/frame';
import { TenantForm, type TenantFormData } from '@/components/biz-screen/tenant-form';

const PopupTenantCreateScreen = () => {
  const navigate = useNavigate();
  const addTenant = useTenantStore((state) => state.addTenant);
  const ready = useTenantStore((state) => state.ready);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: TenantFormData) => {
    setSubmitError(null);
    const newTenant: Tenant = {
      id: crypto.randomUUID(),
      ...data,
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
        {!ready ? (
          <div className="text-muted-foreground text-sm">加载中...</div>
        ) : (
          <TenantForm
            mode="create"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </FramePanel>

      <FrameFooter className="flex justify-end gap-2 px-0 py-3">
        <Button
          size="sm"
          type="submit"
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
