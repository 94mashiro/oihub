import { apiClient } from '../client/api-client';
import type { TenantConfig } from '../types';
import type { Tenant, TenantInfo } from '@/types/tenant';
import type { TenantBalance } from '@/lib/state/balance-store';
import type { CostData } from '@/lib/state/cost-store';
import type { Token, TokenGroup } from '@/types/token';
import { CostPeriod, COST_PERIOD_DAYS, type PaginationResult } from '@/types/api';

function getTimestampRange(period: CostPeriod): [number, number] {
  const now = new Date();
  const end = Math.floor(now.setHours(23, 59, 59, 999) / 1000);
  const days = COST_PERIOD_DAYS[period];
  const start = Math.floor(
    new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0) / 1000,
  );
  return [start, end];
}

/**
 * 租户 API 服务 - 封装所有租户相关 API 端点
 */
export class TenantAPIService {
  private readonly config: TenantConfig;

  constructor(tenant: Tenant) {
    this.config = {
      baseURL: tenant.url,
      token: tenant.token,
      userId: tenant.userId,
    };
  }

  /** 获取租户状态信息 */
  getStatus(): Promise<TenantInfo> {
    return apiClient.get('/api/status', this.config);
  }

  /** 获取当前用户信息（余额等） */
  getSelfInfo(): Promise<TenantBalance> {
    return apiClient.get('/api/user/self', this.config);
  }

  /** 获取 Token 列表（分页） */
  getTokens(page = 1, size = 100): Promise<PaginationResult<Token>> {
    return apiClient.get(`/api/token/?p=${page}&size=${size}`, this.config);
  }

  /** 获取 Token 分组 */
  getTokenGroups(): Promise<Record<string, TokenGroup>> {
    return apiClient.get('/api/user/self/groups', this.config);
  }

  /** 获取消费数据 */
  getCostData(period: CostPeriod): Promise<CostData[]> {
    const [start, end] = getTimestampRange(period);
    return apiClient.get(
      `/api/data/self?start_timestamp=${start}&end_timestamp=${end}&default_time=hour`,
      this.config,
    );
  }
}
