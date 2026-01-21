import { useMemo } from 'react';
import { useTenantStore } from '@/lib/state/tenant-store';
import { useSettingStore } from '@/lib/state/setting-store';
import { useBalanceStore } from '@/lib/state/balance-store';
import { useCostStore } from '@/lib/state/cost-store';
import { useTenantInfoStore } from '@/lib/state/tenant-info-store';
import { sortTenants } from '@/lib/utils/sort-tenants';
import type { Tenant } from '@/types/tenant';

export function useSortedTenants(): Tenant[] {
  const tenantList = useTenantStore((state) => state.tenantList);
  const sortConfig = useSettingStore((state) => state.tenantSortConfig);
  const balanceMap = useBalanceStore((state) => state.balanceMap);
  const costMap = useCostStore((state) => state.costMap);
  const tenantInfoMap = useTenantInfoStore((state) => state.tenantInfoMap);

  return useMemo(() => {
    // 余额/消耗是“各租户各自的 quota 单位”，需要按 creditUnit 折算后再比较，
    // 否则会出现首尾不是最大/最小的情况（不同平台的 quota 精度差异很大）。
    return sortTenants(tenantList, sortConfig, balanceMap, costMap, tenantInfoMap);
  }, [tenantList, sortConfig, balanceMap, costMap, tenantInfoMap]);
}
