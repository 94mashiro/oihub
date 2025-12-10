import { useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, RouteIcon } from 'lucide-react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Group, GroupSeparator } from '@/components/ui/group';
import { useNavigate } from 'react-router-dom';
import { useTenantDataRefresh } from '@/hooks/use-tenant-data-refresh';

const TenantSelector = () => {
  const ready = useTenantStore((state) => state.ready);
  const tenantList = useTenantStore((state) => state.tenantList);
  const selectedTenant = useTenantStore(getSelectedTenant);
  const setSelectedTenantId = useTenantStore((state) => state.setSelectedTenantId);
  const navigate = useNavigate();
  const { refreshAll } = useTenantDataRefresh();

  useEffect(() => {
    if (ready) {
      refreshAll();
    }
  }, [ready, refreshAll]);

  // Guard: don't render persisted data until store is ready
  if (!ready) {
    return (
      <Frame>
        <FramePanel className="flex items-center justify-center p-8">
          <div className="text-muted-foreground text-sm">加载中...</div>
        </FramePanel>
      </Frame>
    );
  }

  return (
    <Frame>
      <FrameHeader className="relative p-2">
        <FrameTitle>账号列表</FrameTitle>
        <FrameDescription className="mt-0.5 text-xs">切换账号查看余额和消耗</FrameDescription>
        <div className="absolute top-2 right-2">
          <Group>
            <Button size="sm" variant="outline" onClick={() => refreshAll()}>
              <RefreshCw />
            </Button>
            <GroupSeparator />
            <Button size="sm" variant="outline" onClick={() => navigate('/tenant/create')}>
              <Plus />
            </Button>
          </Group>
        </div>
      </FrameHeader>
      {tenantList.length === 0 ? (
        <FramePanel>
          <Empty className="gap-3 py-4">
            <EmptyMedia variant="icon" className="mb-0">
              <RouteIcon />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle className="text-sm">暂无账号</EmptyTitle>
              <EmptyDescription className="text-xs">
                添加 API 账号，实时监控余额、消耗和模型用量
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" onClick={() => navigate('/tenant/create')}>
                <Plus className="mr-1 h-4 w-4" />
                添加账号
              </Button>
            </EmptyContent>
          </Empty>
        </FramePanel>
      ) : (
        <>
          {tenantList.map((tenant) => (
            <FramePanel
              key={tenant.id}
              className={cn('w-full rounded-md p-2 transition-all hover:bg-zinc-50', {
                'bg-zinc-100!': selectedTenant?.id === tenant.id,
              })}
              onClick={() => setSelectedTenantId(tenant.id)}
            >
              <TenantSelectCard
                tenantId={tenant.id}
                isSelected={selectedTenant?.id === tenant.id}
              />
            </FramePanel>
          ))}
          <FrameFooter className="p-2">
            <p className="text-muted-foreground text-xs">共 {tenantList.length} 个账号</p>
          </FrameFooter>
        </>
      )}
    </Frame>
  );
};

export default TenantSelector;
