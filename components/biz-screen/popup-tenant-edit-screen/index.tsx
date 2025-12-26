import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { useTenantStore } from '@/lib/state/tenant-store';
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

const PopupTenantEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const tenantList = useTenantStore((state) => state.tenantList);
  const updateTenant = useTenantStore((state) => state.updateTenant);
  const ready = useTenantStore((state) => state.ready);

  const tenant = tenantList.find((t) => t.id === id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: TenantFormData) => {
    if (!id) return;
    setSubmitError(null);

    setIsSubmitting(true);
    try {
      await updateTenant(id, data);
      navigate(-1);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <Frame>
        <FramePanel className="flex items-center justify-center p-3">
          <div className="text-muted-foreground text-sm">加载中...</div>
        </FramePanel>
      </Frame>
    );
  }

  if (!tenant) {
    return (
      <Frame>
        <FrameHeader className="relative p-2">
          <div className="absolute top-2.5 left-2">
            <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft />
            </Button>
          </div>
          <div className="pl-10">
            <FrameTitle>编辑账号</FrameTitle>
          </div>
        </FrameHeader>
        <FramePanel className="flex items-center justify-center p-3">
          <div className="text-destructive-foreground text-sm">账号不存在</div>
        </FramePanel>
      </Frame>
    );
  }

  return (
    <Frame>
      <FrameHeader className="relative p-2">
        <div className="absolute top-2.5 left-2">
          <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
        </div>
        <div className="pl-10">
          <FrameTitle>编辑账号</FrameTitle>
          <FrameDescription className="mt-0.5 text-xs">修改 API 访问凭证</FrameDescription>
        </div>
      </FrameHeader>

      <FramePanel className="p-3">
        <TenantForm
          mode="edit"
          initialData={tenant}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
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
          {isSubmitting ? '保存中...' : '保存'}
        </Button>
      </FrameFooter>
    </Frame>
  );
};

export default PopupTenantEditScreen;
