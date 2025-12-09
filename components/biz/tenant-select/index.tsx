import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from '@/components/ui/frame';
import { getSelectedTenant, useTenantStore } from '@/lib/state/tenant-store';
import { cn } from '@/lib/utils';
import TenantSelectCard from '../tenant-select-card';

const TenantSelector = () => {
  const tenantList = useTenantStore((state) => state.tenantList);
  const selectedTenant = useTenantStore(getSelectedTenant);
  const setSelectedTenantId = useTenantStore((state) => state.setSelectedTenantId);

  return (
    <Frame>
      <FrameHeader className="p-2">
        <FrameTitle>账号列表</FrameTitle>
        <FrameDescription className="mt-0.5 text-xs">切换账号查看余额和消耗</FrameDescription>
      </FrameHeader>
      {tenantList.map((tenant) => (
        <FramePanel
          key={tenant.id}
          className={cn('w-full cursor-pointer rounded-md p-2 transition-all hover:bg-zinc-50', {
            'bg-zinc-200!': selectedTenant?.id === tenant.id,
          })}
          onClick={() => setSelectedTenantId(tenant.id)}
        >
          <TenantSelectCard tenantId={tenant.id} />
        </FramePanel>
      ))}
      <FrameFooter className="p-2">
        <p className="text-muted-foreground text-xs">共 {tenantList.length} 个账号</p>
      </FrameFooter>
    </Frame>
  );
};

export default TenantSelector;
