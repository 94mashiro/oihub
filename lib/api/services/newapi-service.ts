import { APIClient } from '../client/api-client';
import type { Tenant } from '@/types/tenant';
import { CostPeriod, COST_PERIOD_DAYS } from '@/types/api';
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
export class NewAPIRawService {
  private readonly client: APIClient;

  constructor(tenant: Tenant) {
    this.client = createNewAPIClient(tenant);
  }

  async fetchBalance(): Promise<NewAPIBalanceResponse> {
    return this.client.get<NewAPIBalanceResponse>('/api/user/self');
  }

  async fetchCosts(period: CostPeriod): Promise<NewAPICostsResponse> {
    const [start, end] = getTimestampRange(period);
    return this.client.get<NewAPICostsResponse>(
      `/api/data/self?start_timestamp=${start}&end_timestamp=${end}&default_time=hour`,
    );
  }

  async fetchTokens(page = 1, size = 100): Promise<NewAPITokensResponse> {
    return this.client.get<NewAPITokensResponse>(`/api/token/?p=${page}&size=${size}`);
  }

  async fetchTokenGroups(): Promise<NewAPITokenGroupsResponse> {
    return this.client.get<NewAPITokenGroupsResponse>('/api/user/self/groups');
  }

  async fetchTenantInfo(): Promise<NewAPITenantInfoResponse> {
    return this.client.get<NewAPITenantInfoResponse>('/api/status');
  }
}
