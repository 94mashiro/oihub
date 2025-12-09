import { useCallback } from 'react';
import { useNewAPIClient } from './use-new-api-client';
import { useTenantStore, tenantStore } from '@/lib/state/tenant-store';
import { balanceStore, type TenantBalance } from '@/lib/state/balance-store';
import { costStore, type CostData } from '@/lib/state/cost-store';
import { createNewAPIClient, defaultErrorHandler } from '@/lib/api/newapi';
import type { TenantInfo } from '@/types/tenant';
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

export function useTenantDataRefresh() {
  const client = useNewAPIClient({ showErrorToast: true });
  const selectedTenantId = useTenantStore((state) => state.selectedTenantId);
  const tenantList = useTenantStore((state) => state.tenantList);

  const refresh = useCallback(async () => {
    if (!client || !selectedTenantId) return;

    const costRequests = ALL_PERIODS.map((period) => {
      const [start, end] = getTimestampRange(period);
      return client
        .get<
          CostData[]
        >(`/api/data/self?start_timestamp=${start}&end_timestamp=${end}&default_time=hour`)
        .then((data) => ({ period, data }));
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
      await tenantStore.getState().updateTenantInfo(selectedTenantId, infoResult.value);
    }
    if (balanceResult.status === 'fulfilled') {
      await balanceStore.getState().setBalance(selectedTenantId, balanceResult.value);
    }
    if (tokenResult.status === 'fulfilled') {
      await tokenStore.getState().setTokens(selectedTenantId, tokenResult.value.items);
    }
    if (tokenGroupsResult.status === 'fulfilled') {
      await tokenStore.getState().setTokenGroups(selectedTenantId, tokenGroupsResult.value);
    }
    for (const result of costResults) {
      if (result.status === 'fulfilled') {
        const { period, data } = result.value;
        await costStore.getState().setCost(selectedTenantId, period, data);
      }
    }
  }, [client, selectedTenantId]);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled(
      tenantList.map(async (tenant) => {
        const tenantClient = createNewAPIClient({
          baseURL: tenant.url,
          token: tenant.token,
          userId: tenant.userId,
          onError: defaultErrorHandler,
        });

        const costRequests = ALL_PERIODS.map((period) => {
          const [start, end] = getTimestampRange(period);
          return tenantClient
            .get<
              CostData[]
            >(`/api/data/self?start_timestamp=${start}&end_timestamp=${end}&default_time=hour`)
            .then((data) => ({ period, data }));
        });

        const [infoResult, balanceResult, ...costResults] = await Promise.allSettled([
          tenantClient.get<TenantInfo>('/api/status'),
          tenantClient.get<TenantBalance>('/api/user/self'),
          ...costRequests,
        ]);

        if (infoResult.status === 'fulfilled') {
          await tenantStore.getState().updateTenantInfo(tenant.id, infoResult.value);
        }
        if (balanceResult.status === 'fulfilled') {
          await balanceStore.getState().setBalance(tenant.id, balanceResult.value);
        }
        for (const result of costResults) {
          if (result.status === 'fulfilled') {
            const { period, data } = result.value;
            await costStore.getState().setCost(tenant.id, period, data);
          }
        }
      }),
    );
  }, [tenantList]);

  return { refresh, refreshAll };
}
