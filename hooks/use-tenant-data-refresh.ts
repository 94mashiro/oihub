import { useCallback } from 'react';
import { useNewAPIClient } from './use-new-api-client';
import { useTenantStore, tenantStore } from '@/lib/state/tenant-store';
import { balanceStore, type TenantBalance } from '@/lib/state/balance-store';
import { costStore, type CostData } from '@/lib/state/cost-store';
import { createNewAPIClient, defaultErrorHandler } from '@/lib/api/newapi';
import type { TenantInfo } from '@/types/tenant';

function getTodayTimestampRange(): [number, number] {
  return [
    Math.floor(new Date().setHours(0, 0, 0, 0) / 1000),
    Math.floor(new Date().setHours(23, 59, 59, 999) / 1000),
  ];
}

export function useTenantDataRefresh() {
  const client = useNewAPIClient({ showErrorToast: true });
  const selectedTenantId = useTenantStore((state) => state.selectedTenantId);
  const tenantList = useTenantStore((state) => state.tenantList);

  const refresh = useCallback(async () => {
    if (!client || !selectedTenantId) return;

    const [start, end] = getTodayTimestampRange();

    const [infoResult, balanceResult, costResult] = await Promise.allSettled([
      client.get<TenantInfo>('/api/status'),
      client.get<TenantBalance>('/api/user/self'),
      client.get<CostData[]>(
        `/api/data/self?start_timestamp=${start}&end_timestamp=${end}&default_time=hour`,
      ),
    ]);

    if (infoResult.status === 'fulfilled') {
      await tenantStore.getState().updateTenantInfo(selectedTenantId, infoResult.value);
    }
    if (balanceResult.status === 'fulfilled') {
      await balanceStore.getState().setBalance(selectedTenantId, balanceResult.value);
    }
    if (costResult.status === 'fulfilled') {
      await costStore.getState().setCost(selectedTenantId, costResult.value);
    }
  }, [client, selectedTenantId]);

  const refreshAll = useCallback(async () => {
    const [start, end] = getTodayTimestampRange();

    await Promise.allSettled(
      tenantList.map(async (tenant) => {
        const tenantClient = createNewAPIClient({
          baseURL: tenant.url,
          token: tenant.token,
          userId: tenant.userId,
          onError: defaultErrorHandler,
        });

        const [infoResult, balanceResult, costResult] = await Promise.allSettled([
          tenantClient.get<TenantInfo>('/api/status'),
          tenantClient.get<TenantBalance>('/api/user/self'),
          tenantClient.get<CostData[]>(
            `/api/data/self?start_timestamp=${start}&end_timestamp=${end}&default_time=hour`,
          ),
        ]);

        if (infoResult.status === 'fulfilled') {
          await tenantStore.getState().updateTenantInfo(tenant.id, infoResult.value);
        }
        if (balanceResult.status === 'fulfilled') {
          await balanceStore.getState().setBalance(tenant.id, balanceResult.value);
        }
        if (costResult.status === 'fulfilled') {
          await costStore.getState().setCost(tenant.id, costResult.value);
        }
      }),
    );
  }, [tenantList]);

  return { refresh, refreshAll };
}
