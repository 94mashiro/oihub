import { apiClient } from '../client/api-client';
import type { TenantConfig } from '../types';
import type { Tenant, TenantInfo } from '@/types/tenant';
import type { Balance, Cost, Token, TokenGroup } from '@/lib/api/adapters';
import { getAdapter } from '@/lib/api/adapters';
import { CostPeriod, COST_PERIOD_DAYS, type PaginationResult } from '@/types/api';
import type { IPlatformService } from './types';
import { PlatformAPIError } from '../errors';

export function getTimestampRange(period: CostPeriod): [number, number] {
  const now = new Date();
  const end = Math.floor(now.setHours(23, 59, 59, 999) / 1000);
  const days = COST_PERIOD_DAYS[period];
  const start = Math.floor(
    new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0) / 1000,
  );
  return [start, end];
}

export class NewAPIService implements IPlatformService {
  private readonly config: TenantConfig;
  private readonly adapter;

  constructor(tenant: Tenant) {
    this.config = {
      baseURL: tenant.url,
      token: tenant.token,
      userId: tenant.userId,
    };
    this.adapter = getAdapter('newapi');
  }

  async getTenantInfo(): Promise<TenantInfo> {
    try {
      const raw = await apiClient.get('/api/status', this.config);
      return this.adapter.normalizeTenantInfo(raw);
    } catch (error) {
      throw new PlatformAPIError('newapi', 'getTenantInfo', error as Error);
    }
  }

  async getBalance(): Promise<Balance> {
    try {
      const raw = await apiClient.get('/api/user/self', this.config);
      return this.adapter.normalizeBalance(raw);
    } catch (error) {
      throw new PlatformAPIError('newapi', 'getBalance', error as Error);
    }
  }

  async getTokens(page = 1, size = 100): Promise<PaginationResult<Token>> {
    try {
      const result = await apiClient.get<PaginationResult<unknown>>(
        `/api/token/?p=${page}&size=${size}`,
        this.config,
      );
      return {
        ...result,
        items: this.adapter.normalizeTokens(result.items),
      };
    } catch (error) {
      throw new PlatformAPIError('newapi', 'getTokens', error as Error);
    }
  }

  async getTokenGroups(): Promise<Record<string, TokenGroup>> {
    try {
      const raw = await apiClient.get('/api/user/self/groups', this.config);
      return this.adapter.normalizeTokenGroups(raw);
    } catch (error) {
      throw new PlatformAPIError('newapi', 'getTokenGroups', error as Error);
    }
  }

  async getCostData(period: CostPeriod): Promise<Cost[]> {
    try {
      const [start, end] = getTimestampRange(period);
      const raw = await apiClient.get<unknown[]>(
        `/api/data/self?start_timestamp=${start}&end_timestamp=${end}&default_time=hour`,
        this.config,
      );
      return this.adapter.normalizeCosts(raw);
    } catch (error) {
      throw new PlatformAPIError('newapi', 'getCostData', error as Error);
    }
  }
}
