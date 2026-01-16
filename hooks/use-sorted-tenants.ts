import { useMemo } from 'react';
import { useTenantStore } from '@/lib/state/tenant-store';
import { useSettingStore } from '@/lib/state/setting-store';
import { useBalanceStore } from '@/lib/state/balance-store';
import { useCostStore } from '@/lib/state/cost-store';
import { SortField, SortDirection } from '@/types/sort';
import { CostPeriod } from '@/types/api';
import type { Tenant } from '@/types/tenant';

export function useSortedTenants(): Tenant[] {
  const tenantList = useTenantStore((state) => state.tenantList);
  const sortConfig = useSettingStore((state) => state.tenantSortConfig);
  const balanceMap = useBalanceStore((state) => state.balanceMap);
  const costMap = useCostStore((state) => state.costMap);

  return useMemo(() => {
    const { field, direction } = sortConfig;

    // 手动排序：直接返回 tenantList 原始顺序
    if (field === SortField.MANUAL) {
      return tenantList;
    }

    const tenants = [...tenantList];
    const multiplier = direction === SortDirection.ASC ? 1 : -1;

    switch (field) {
      case SortField.NAME:
        return tenants.sort(
          (a, b) => multiplier * a.name.localeCompare(b.name, 'zh-CN'),
        );

      case SortField.BALANCE:
        return tenants.sort((a, b) => {
          const aBalance = balanceMap[a.id]?.remainingCredit ?? 0;
          const bBalance = balanceMap[b.id]?.remainingCredit ?? 0;
          return multiplier * (aBalance - bBalance);
        });

      case SortField.TODAY_COST:
        return tenants.sort((a, b) => {
          const aCosts = costMap[a.id]?.[CostPeriod.DAY_1] ?? [];
          const bCosts = costMap[b.id]?.[CostPeriod.DAY_1] ?? [];
          const aCost = aCosts.reduce((sum, c) => sum + c.creditCost, 0);
          const bCost = bCosts.reduce((sum, c) => sum + c.creditCost, 0);
          return multiplier * (aCost - bCost);
        });

      default:
        return tenants;
    }
  }, [tenantList, sortConfig, balanceMap, costMap]);
}
