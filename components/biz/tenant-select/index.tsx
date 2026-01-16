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
import { useSettingStore } from '@/lib/state/setting-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, RouteIcon, Settings } from 'lucide-react';
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
import { useSortedTenants } from '@/hooks/use-sorted-tenants';
import { SortableTenantList } from './sortable-tenant-list';

const TenantSelector = () => {
  const ready = useTenantStore((state) => state.ready);
  const tenantList = useTenantStore((state) => state.tenantList);
  const selectedTenant = useTenantStore(getSelectedTenant);
  const setSelectedTenantId = useTenantStore((state) => state.setSelectedTenantId);
  const settingReady = useSettingStore((state) => state.ready);
  const navigate = useNavigate();
  const { refreshAll, refreshAllFull, isRefreshing } = useTenantDataRefresh();
  const sortedTenants = useSortedTenants();

  useEffect(() => {
    if (ready) {
      refreshAll();
    }
  }, [ready, refreshAll]);

  // Guard: don't render persisted data until store is ready
  if (!ready || !settingReady) {
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
            <Button size="sm" variant="outline" onClick={() => navigate('/tenant/create')}>
              <Plus className="size-3" />
            </Button>
            <GroupSeparator />
            <Button
              size="sm"
              variant="outline"
              onClick={() => refreshAllFull()}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn(isRefreshing && 'animate-spin', 'size-3')} />
            </Button>
            <GroupSeparator />
            <Button size="sm" variant="outline" onClick={() => navigate('/settings')}>
              <Settings className="size-3" />
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
          <SortableTenantList
            tenants={sortedTenants}
            selectedTenantId={selectedTenant?.id ?? null}
            onSelectTenant={setSelectedTenantId}
          />
          <FrameFooter className="p-2">
            <p className="text-muted-foreground text-xs">共 {tenantList.length} 个账号</p>
          </FrameFooter>
        </>
      )}
    </Frame>
  );
};

export default TenantSelector;
