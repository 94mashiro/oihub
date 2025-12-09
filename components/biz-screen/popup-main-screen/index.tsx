import TenantSelector from '@/components/biz/tenant-select';
import { useTenantDataRefresh } from '@/hooks/use-tenant-data-refresh';
import { useEffect } from 'react';

const PopupMainScreen = () => {
  const { refresh } = useTenantDataRefresh();

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="flex h-full flex-col gap-4">
      <TenantSelector />
    </div>
  );
};

export default PopupMainScreen;
