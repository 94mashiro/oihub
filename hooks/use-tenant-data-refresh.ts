import { useCallback } from 'react';
import { tenantStore } from '@/lib/state/tenant-store';
import { balanceStore } from '@/lib/state/balance-store';
import { costStore } from '@/lib/state/cost-store';
import { tokenStore } from '@/lib/state/token-store';
import { clientManager, TenantAPIService } from '@/lib/api';
import type { Tenant } from '@/types/tenant';
import { CostPeriod } from '@/types/api';

async function refreshTenantData(tenant: Tenant) {
  const client = clientManager.getClient(tenant);
  const api = new TenantAPIService(client);

  const [infoResult, balanceResult, tokenResult, tokenGroupsResult, costResult] =
    await Promise.allSettled([
      api.getStatus(),
      api.getSelfInfo(),
      api.getTokens(),
      api.getTokenGroups(),
      api.getCostData(CostPeriod.DAY_1),
    ]);

  if (infoResult.status === 'fulfilled') {
    await tenantStore.getState().updateTenantInfo(tenant.id, infoResult.value);
  }
  if (balanceResult.status === 'fulfilled') {
    await balanceStore.getState().setBalance(tenant.id, balanceResult.value);
  }
  if (tokenResult.status === 'fulfilled') {
    await tokenStore.getState().setTokens(tenant.id, tokenResult.value.items);
  }
  if (tokenGroupsResult.status === 'fulfilled') {
    await tokenStore.getState().setTokenGroups(tenant.id, tokenGroupsResult.value);
  }
  if (costResult.status === 'fulfilled') {
    await costStore.getState().setCost(tenant.id, CostPeriod.DAY_1, costResult.value);
  }
}

export async function ensureCostLoaded(tenant: Tenant, period: CostPeriod): Promise<void> {
  const cached = costStore.getState().getCost(tenant.id, period);
  if (cached) return;

  const client = clientManager.getClient(tenant);
  const api = new TenantAPIService(client);
  const data = await api.getCostData(period);
  await costStore.getState().setCost(tenant.id, period, data);
}

export function useTenantDataRefresh() {
  const refresh = useCallback(async () => {
    const state = tenantStore.getState();
    const selectedTenant = state.tenantList.find((t) => t.id === state.selectedTenantId);
    if (!selectedTenant) return;
    await refreshTenantData(selectedTenant);
  }, []);

  const refreshAll = useCallback(async () => {
    const { tenantList } = tenantStore.getState();
    await Promise.allSettled(tenantList.map(refreshTenantData));
  }, []);

  return { refresh, refreshAll };
}
