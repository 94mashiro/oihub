import { useCallback, useState } from 'react';
import { tenantStore } from '@/lib/state/tenant-store';
import { balanceStore } from '@/lib/state/balance-store';
import { costStore, type CostData } from '@/lib/state/cost-store';
import { TenantAPIService } from '@/lib/api';
import type { Tenant, TenantInfo } from '@/types/tenant';
import { CostPeriod } from '@/types/api';

async function refreshTenantData(tenant: Tenant) {
  const api = new TenantAPIService(tenant);

  const [infoResult, balanceResult, costResult] = await Promise.allSettled([
    api.getStatus(),
    api.getSelfInfo(),
    api.getCostData(CostPeriod.DAY_1),
  ]);

  if (infoResult.status === 'fulfilled') {
    await tenantStore.getState().updateTenantInfo(tenant.id, infoResult.value);
  }
  if (balanceResult.status === 'fulfilled') {
    await balanceStore.getState().setBalance(tenant.id, balanceResult.value);
  }
  if (costResult.status === 'fulfilled') {
    await costStore.getState().setCost(tenant.id, CostPeriod.DAY_1, costResult.value);

    // Trigger usage alert check in background
    const tenantInfo = infoResult.status === 'fulfilled' ? infoResult.value : tenant.info;
    if (tenantInfo) {
      const todayUsage = calculateTodayUsage(costResult.value);
      triggerUsageAlertCheck(tenant.id, tenant.name, tenantInfo, todayUsage);
    }
  }
}

/**
 * Calculate total quota usage from cost data
 */
function calculateTodayUsage(costData: CostData[]): number {
  return costData.reduce((sum, item) => sum + item.quota, 0);
}

/**
 * Send message to background to check usage alert
 */
function triggerUsageAlertCheck(
  tenantId: string,
  tenantName: string,
  tenantInfo: TenantInfo,
  todayUsage: number,
): void {
  browser.runtime
    .sendMessage({
      type: 'CHECK_USAGE_ALERT',
      payload: { tenantId, tenantName, tenantInfo, todayUsage },
    })
    .catch((error) => {
      console.error('Failed to send usage alert check message:', error);
    });
}

export function useTenantDataRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    const state = tenantStore.getState();
    const selectedTenant = state.tenantList.find((t) => t.id === state.selectedTenantId);
    if (!selectedTenant) return;
    await refreshTenantData(selectedTenant);
  }, []);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { tenantList } = tenantStore.getState();
      await Promise.allSettled(tenantList.map(refreshTenantData));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return { refresh, refreshAll, isRefreshing };
}
