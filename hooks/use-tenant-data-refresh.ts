import { useCallback, useState } from 'react';
import { tenantStore } from '@/lib/state/tenant-store';
import { tenantInfoStore } from '@/lib/state/tenant-info-store';
import { getRawService } from '@/lib/api/services';
import { getAdapter } from '@/lib/api/adapters';
import {
  BalanceOrchestrator,
  CostOrchestrator,
  TenantInfoOrchestrator,
} from '@/lib/api/orchestrators';
import type { Cost } from '@/lib/api/adapters';
import type { Tenant, TenantInfo } from '@/types/tenant';
import { CostPeriod } from '@/types/api';

async function refreshTenantData(tenant: Tenant) {
  const service = getRawService(tenant);
  const adapter = getAdapter(tenant.platformType ?? 'newapi');

  const infoOrchestrator = new TenantInfoOrchestrator(tenant, service, adapter);
  const balanceOrchestrator = new BalanceOrchestrator(tenant, service, adapter);
  const costOrchestrator = new CostOrchestrator(tenant, service, adapter, CostPeriod.DAY_1);

  const [infoResult, _balanceResult, costResult] = await Promise.allSettled([
    infoOrchestrator.refresh(),
    balanceOrchestrator.refresh(),
    costOrchestrator.refresh(),
  ]);

  // Trigger usage alert check if cost data was fetched
  if (costResult.status === 'fulfilled') {
    const tenantInfo =
      infoResult.status === 'fulfilled'
        ? infoResult.value
        : tenantInfoStore.getState().getTenantInfo(tenant.id);
    if (tenantInfo) {
      const todayUsage = calculateTodayUsage(costResult.value);
      triggerUsageAlertCheck(tenant.id, tenant.name, tenantInfo, todayUsage);
    }
  }
}

/**
 * Calculate total quota usage from cost data
 */
function calculateTodayUsage(costData: Cost[]): number {
  return costData.reduce((sum, item) => sum + item.creditCost, 0);
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
