import { APIClient } from '../client/api-client';
import type { Tenant } from '@/types/tenant';
import { CostPeriod, COST_PERIOD_DAYS } from '@/types/api';
import type { IPackyCodeCodexRawService } from './types';
import type {
  PackyCodeCodexBalanceResponse,
  PackyCodeCodexCostsResponse,
  PackyCodeCodexTokensResponse,
  PackyCodeCodexTokenGroupsResponse,
  PackyCodeCodexTenantInfoResponse,
} from '@/lib/api/types/platforms';

function getTimestampRange(period: CostPeriod): [number, number] {
  const now = new Date();
  const end = Math.floor(now.setHours(23, 59, 59, 999) / 1000);
  const days = COST_PERIOD_DAYS[period];
  const start = Math.floor(
    new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0) / 1000,
  );
  return [start, end];
}

function createPackyCodeCodexClient(tenant: Tenant): APIClient {
  return new APIClient({
    baseURL: tenant.url,
    headers: {
      Authorization: `Bearer ${tenant.token}`,
      'New-Api-User': tenant.userId || '',
    },
    timeout: 30000,
    enableLogging: false,
  });
}

/**
 * Raw PackyCode Codex service - fetches raw data without transformation.
 */
export class PackyCodeCodexRawService implements IPackyCodeCodexRawService {
  private readonly client: APIClient;

  constructor(tenant: Tenant) {
    this.client = createPackyCodeCodexClient(tenant);
  }

  async fetchBalance(): Promise<PackyCodeCodexBalanceResponse> {
    return this.client.get<PackyCodeCodexBalanceResponse>('/api/user/self');
  }

  async fetchCosts(period: CostPeriod): Promise<PackyCodeCodexCostsResponse> {
    const [start, end] = getTimestampRange(period);
    return this.client.get<PackyCodeCodexCostsResponse>(
      `/api/data/self?start_timestamp=${start}&end_timestamp=${end}&default_time=hour`,
    );
  }

  async fetchTokens(page = 1, size = 100): Promise<PackyCodeCodexTokensResponse> {
    return this.client.get<PackyCodeCodexTokensResponse>(
      `/api/token/?p=${page}&size=${size}`,
    );
  }

  async fetchTokenGroups(): Promise<PackyCodeCodexTokenGroupsResponse> {
    return this.client.get<PackyCodeCodexTokenGroupsResponse>('/api/user/self/groups');
  }

  async fetchTenantInfo(): Promise<PackyCodeCodexTenantInfoResponse> {
    return this.client.get<PackyCodeCodexTenantInfoResponse>('/api/status');
  }
}
