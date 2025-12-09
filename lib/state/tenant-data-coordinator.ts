import { tenantStore } from './tenant-store';
import { balanceStore, type TenantBalance } from './balance-store';
import { costStore, type CostData } from './cost-store';
import { createOneAPIClient } from '@/lib/api/oneapi/client';

import type { TenantInfo } from '@/types/tenant';

/**
 * 刷新指定租户的所有数据
 * 这是对外唯一的数据获取入口
 */
export async function refreshTenantData(tenantId: string): Promise<void> {
  const tenant = tenantStore.getState().tenantList.find((t) => t.id === tenantId);
  if (!tenant) return;

  const client = createOneAPIClient({
    baseURL: tenant.url,
    token: tenant.token,
    userId: tenant.userId,
  });

  // /api/data/self/?start_timestamp=1765209600&end_timestamp=1765250743&default_time=hour

  const todayTimestampRange = [
    new Date().setHours(0, 0, 0, 0) / 1000,
    new Date().setHours(23, 59, 59, 999) / 1000,
  ];

  const [infoResult, balanceResult, todayCostResult] = await Promise.allSettled([
    client.get<TenantInfo>('/api/status'),
    client.get<TenantBalance>('/api/user/self'),
    client.get<CostData[]>(
      `/api/data/self?start_timestamp=${Math.floor(todayTimestampRange[0])}&end_timestamp=${Math.floor(todayTimestampRange[1])}&default_time=hour`,
    ),
  ]);

  // 分发到各自的 store
  if (infoResult.status === 'fulfilled') {
    await tenantStore.getState().updateTenantInfo(tenantId, infoResult.value);
  }

  if (balanceResult.status === 'fulfilled') {
    await balanceStore.getState().setBalance(tenantId, balanceResult.value);
  }

  if (todayCostResult.status === 'fulfilled') {
    await costStore.getState().setCost(tenantId, todayCostResult.value);
  }
}
