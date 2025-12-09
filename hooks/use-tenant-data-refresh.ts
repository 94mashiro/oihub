import { useCallback } from 'react';
import { useTenantStore, tenantStore } from '@/lib/state/tenant-store';
import { balanceStore, type TenantBalance } from '@/lib/state/balance-store';
import { costStore, type CostData } from '@/lib/state/cost-store';
import { createNewAPIClient, defaultErrorHandler } from '@/lib/api/newapi';
import type { Tenant, TenantInfo } from '@/types/tenant';
import { Token, TokenGroup } from '@/types/token';
import { PaginationResult, CostPeriod, COST_PERIOD_DAYS } from '@/types/api';
import { tokenStore } from '@/lib/state/token-store';

const ALL_PERIODS = [CostPeriod.DAY_1, CostPeriod.DAY_7, CostPeriod.DAY_14, CostPeriod.DAY_30];

function getTimestampRange(period: CostPeriod): [number, number] {
  const now = new Date();
  const end = Math.floor(now.setHours(23, 59, 59, 999) / 1000);
  const days = COST_PERIOD_DAYS[period];
  const start = Math.floor(
    new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0) / 1000,
  );
  return [start, end];
}

async function refreshTenantData(tenant: Tenant) {
  const client = createNewAPIClient({
    baseURL: tenant.url,
    token: tenant.token,
    userId: tenant.userId,
    onError: defaultErrorHandler,
  });

  const costRequests = ALL_PERIODS.map(async (period) => {
    const [start, end] = getTimestampRange(period);
    const data = await client.get<CostData[]>(
      `/api/data/self?start_timestamp=${start}&end_timestamp=${end}&default_time=hour`,
    );
    return { period, data };
  });

  const [infoResult, balanceResult, tokenResult, tokenGroupsResult, ...costResults] =
    await Promise.allSettled([
      client.get<TenantInfo>('/api/status'),
      client.get<TenantBalance>('/api/user/self'),
      client.get<PaginationResult<Token>>(`/api/token/?p=1&size=100`),
      client.get<Record<string, TokenGroup>>(`/api/user/self/groups`),
      ...costRequests,
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
  for (const result of costResults) {
    if (result.status === 'fulfilled') {
      const { period, data } = result.value;
      await costStore.getState().setCost(tenant.id, period, data);
    }
  }
}

export function useTenantDataRefresh() {
  const selectedTenant = useTenantStore((state) =>
    state.tenantList.find((t) => t.id === state.selectedTenantId),
  );
  const tenantList = useTenantStore((state) => state.tenantList);

  const refresh = useCallback(async () => {
    if (!selectedTenant) return;
    await refreshTenantData(selectedTenant);
  }, [selectedTenant]);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled(tenantList.map(refreshTenantData));
  }, [tenantList]);

  return { refresh, refreshAll };
}
