import { APIClient } from '../client/api-client';
import type { Tenant } from '@/types/tenant';
import { CostPeriod, COST_PERIOD_DAYS } from '@/types/api';
import type { ICubenceRawService } from './types';
import type { RawAPIResponse } from '@/lib/api/orchestrators/types';
import type {
  CubenceBalanceResponse,
  CubenceCostsResponse,
  CubenceTokensResponse,
  CubenceTokenGroupsResponse,
  CubenceTenantInfoResponse,
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

function createCubenceClient(tenant: Tenant): APIClient {
  return new APIClient({
    baseURL: tenant.url,
    headers: {
      Cookie: `token=${tenant.token}`,
    },
    timeout: 30000,
    enableLogging: false,
  });
}

/**
 * Raw Cubence service - fetches raw data without transformation.
 */
export class CubenceRawService implements ICubenceRawService {
  private readonly client: APIClient;

  constructor(tenant: Tenant) {
    this.client = createCubenceClient(tenant);
  }

  async fetchBalance(): Promise<RawAPIResponse<CubenceBalanceResponse>> {
    const data = await this.client.get<CubenceBalanceResponse>('/api/user/self');
    return { data, status: 200 };
  }

  async fetchCosts(period: CostPeriod): Promise<RawAPIResponse<CubenceCostsResponse>> {
    const [start, end] = getTimestampRange(period);
    const data = await this.client.get<CubenceCostsResponse>(
      `/api/data/self?start_timestamp=${start}&end_timestamp=${end}&default_time=hour`,
    );
    return { data, status: 200 };
  }

  async fetchTokens(page = 1, size = 100): Promise<RawAPIResponse<CubenceTokensResponse>> {
    const data = await this.client.get<CubenceTokensResponse>(`/api/token/?p=${page}&size=${size}`);
    return { data, status: 200 };
  }

  async fetchTokenGroups(): Promise<RawAPIResponse<CubenceTokenGroupsResponse>> {
    const data = await this.client.get<CubenceTokenGroupsResponse>('/api/user/self/groups');
    return { data, status: 200 };
  }

  async fetchTenantInfo(): Promise<RawAPIResponse<CubenceTenantInfoResponse>> {
    const [overviewData, announcementsData] = await Promise.all([
      this.client.get('/api/v1/dashboard/overview'),
      this.client.get('/api/v1/announcements?page=1&page_size=10'),
    ]);
    return {
      data: {
        ...overviewData,
        announcements: announcementsData,
      } as CubenceTenantInfoResponse,
      status: 200,
    };
  }
}
