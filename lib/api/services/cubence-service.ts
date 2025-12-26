import { APIClient } from '../client/api-client';
import type { Tenant, TenantInfo } from '@/types/tenant';
import type { Balance, Cost, Token, TokenGroup } from '@/lib/api/adapters';
import { getAdapter } from '@/lib/api/adapters';
import { CostPeriod, COST_PERIOD_DAYS, type PaginationResult } from '@/types/api';
import type { IPlatformService } from './types';
import { PlatformAPIError } from '../errors';

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
 * Cubence Platform Service
 *
 * Implements API calls for Cubence platform.
 * TODO: Update endpoint paths based on actual Cubence API documentation.
 */
export class CubenceService implements IPlatformService {
  private readonly client: APIClient;
  private readonly adapter;

  constructor(tenant: Tenant) {
    this.client = new APIClient({
      baseURL: tenant.url,
      headers: {
        Cookie: `token=${tenant.token}`,
      },
      timeout: 30000,
      enableLogging: false,
    });

    this.adapter = getAdapter('cubence');
  }

  async getTenantInfo(): Promise<TenantInfo> {
    try {
      // TODO: Update endpoint path based on Cubence API
      const raw = await this.client.get('/api/v1/dashboard/overview');
      console.log('raw', raw, this.adapter.normalizeTenantInfo(raw));
      return this.adapter.normalizeTenantInfo(raw);
    } catch (error) {
      throw new PlatformAPIError('cubence', 'getTenantInfo', error as Error);
    }
  }

  async getBalance(): Promise<Balance> {
    try {
      // TODO: Update endpoint path based on Cubence API
      const raw = await this.client.get('/api/user/self');
      return this.adapter.normalizeBalance(raw);
    } catch (error) {
      throw new PlatformAPIError('cubence', 'getBalance', error as Error);
    }
  }

  async getTokens(page = 1, size = 100): Promise<PaginationResult<Token>> {
    try {
      // TODO: Update endpoint path based on Cubence API
      const result = await this.client.get<PaginationResult<unknown>>(
        `/api/token/?p=${page}&size=${size}`,
      );
      return {
        ...result,
        items: this.adapter.normalizeTokens(result.items),
      };
    } catch (error) {
      throw new PlatformAPIError('cubence', 'getTokens', error as Error);
    }
  }

  async getTokenGroups(): Promise<Record<string, TokenGroup>> {
    try {
      // TODO: Update endpoint path based on Cubence API
      const raw = await this.client.get('/api/user/self/groups');
      return this.adapter.normalizeTokenGroups(raw);
    } catch (error) {
      throw new PlatformAPIError('cubence', 'getTokenGroups', error as Error);
    }
  }

  async getCostData(period: CostPeriod): Promise<Cost[]> {
    try {
      // TODO: Update endpoint path based on Cubence API
      const [start, end] = getTimestampRange(period);
      const raw = await this.client.get<unknown[]>(
        `/api/data/self?start_timestamp=${start}&end_timestamp=${end}&default_time=hour`,
      );
      return this.adapter.normalizeCosts(raw);
    } catch (error) {
      throw new PlatformAPIError('cubence', 'getCostData', error as Error);
    }
  }
}
