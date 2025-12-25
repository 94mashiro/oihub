import { apiClient } from '../client/api-client';
import type { TenantConfig } from '../types';
import type { Tenant, TenantInfo } from '@/types/tenant';
import type { Balance, Cost, Token, TokenGroup, PlatformType } from '@/lib/api/adapters';
import { getAdapter } from '@/lib/api/adapters';
import { CostPeriod, COST_PERIOD_DAYS, type PaginationResult } from '@/types/api';

export function getTimestampRange(period: CostPeriod): [number, number] {
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
  private readonly adapter;

  constructor(tenant: Tenant, platformType: PlatformType = 'newapi') {
    this.config = {
      baseURL: tenant.url,
      token: tenant.token,
      userId: tenant.userId,
    };
    this.adapter = getAdapter(platformType);
  }

  /** 获取租户状态信息 */
  getStatus(): Promise<TenantInfo> {
    return apiClient.get('/api/status', this.config);
  }

  /** 获取当前用户信息（余额等） */
  async getSelfInfo(): Promise<Balance> {
    const raw = await apiClient.get('/api/user/self', this.config);
    return this.adapter.normalizeBalance(raw);
  }

  /** 获取 Token 列表（分页） */
  async getTokens(page = 1, size = 100): Promise<PaginationResult<Token>> {
    const result = await apiClient.get<PaginationResult<unknown>>(
      `/api/token/?p=${page}&size=${size}`,
      this.config,
    );
    return {
      ...result,
      items: this.adapter.normalizeTokens(result.items),
    };
  }

  /** 获取 Token 分组 */
  async getTokenGroups(): Promise<Record<string, TokenGroup>> {
    const raw = await apiClient.get('/api/user/self/groups', this.config);
    return this.adapter.normalizeTokenGroups(raw);
  }

  /** 获取消费数据 */
  async getCostData(period: CostPeriod): Promise<Cost[]> {
    const [start, end] = getTimestampRange(period);
    const raw = await apiClient.get<unknown[]>(
      `/api/data/self?start_timestamp=${start}&end_timestamp=${end}&default_time=hour`,
      this.config,
    );
    return this.adapter.normalizeCosts(raw);
  }
}
