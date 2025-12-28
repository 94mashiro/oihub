import { APIClient } from '../client/api-client';
import type { Tenant } from '@/types/tenant';
import { CostPeriod, COST_PERIOD_DAYS } from '@/types/api';
import type { INewAPIRawService } from './types';
import type { RawAPIResponse } from '@/lib/api/orchestrators/types';
import type {
  NewAPIBalanceResponse,
  NewAPICostsResponse,
  NewAPITokensResponse,
  NewAPITokenGroupsResponse,
  NewAPITenantInfoResponse,
} from '@/lib/api/types/platforms';

export function getTimestampRange(period: CostPeriod): [number, number] {
  const now = new Date();
  const end = Math.floor(now.setHours(23, 59, 59, 999) / 1000);
  const days = COST_PERIOD_DAYS[period];
  const start = Math.floor(
    new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0) / 1000,
  );
  return [start, end];
}

function createNewAPIClient(tenant: Tenant): APIClient {
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
 * Raw NewAPI service - fetches raw data without transformation.
 */
export class NewAPIRawService implements INewAPIRawService {
  private readonly client: APIClient;

  constructor(tenant: Tenant) {
    this.client = createNewAPIClient(tenant);
  }

  async fetchBalance(): Promise<RawAPIResponse<NewAPIBalanceResponse>> {
    const data = await this.client.get<NewAPIBalanceResponse>('/api/user/self');
    return { data, status: 200 };
  }

  async fetchCosts(period: CostPeriod): Promise<RawAPIResponse<NewAPICostsResponse>> {
    const [start, end] = getTimestampRange(period);
    const data = await this.client.get<NewAPICostsResponse>(
      `/api/data/self?start_timestamp=${start}&end_timestamp=${end}&default_time=hour`,
    );
    return { data, status: 200 };
  }

  async fetchTokens(page = 1, size = 100): Promise<RawAPIResponse<NewAPITokensResponse>> {
    const data = await this.client.get<NewAPITokensResponse>(`/api/token/?p=${page}&size=${size}`);
    return { data, status: 200 };
  }

  async fetchTokenGroups(): Promise<RawAPIResponse<NewAPITokenGroupsResponse>> {
    const data = await this.client.get<NewAPITokenGroupsResponse>('/api/user/self/groups');
    return { data, status: 200 };
  }

  async fetchTenantInfo(): Promise<RawAPIResponse<NewAPITenantInfoResponse>> {
    const data = await this.client.get<NewAPITenantInfoResponse>('/api/status');
    return { data, status: 200 };
  }
}
