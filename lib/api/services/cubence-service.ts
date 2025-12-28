import { APIClient } from '../client/api-client';
import { fetchAllCubenceCostsPages } from './cubence-service-utils';
import type { Tenant } from '@/types/tenant';
import { CostPeriod, COST_PERIOD_DAYS } from '@/types/api';
import type { ICubenceRawService } from './types';
import type {
  CubenceBalanceResponse,
  CubenceCostsResponse,
  CubenceTokensResponse,
  CubenceTokenGroupsResponse,
  CubenceOverviewResponse,
  CubenceAnnouncementsResponse,
} from '@/lib/api/types/platforms';

function getDateRange(period: CostPeriod): [string, string] {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  const end = now.toISOString().split('T')[0];
  const days = COST_PERIOD_DAYS[period];
  const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
  startDate.setHours(0, 0, 0, 0);
  const start = startDate.toISOString().split('T')[0];
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

  async fetchBalance(): Promise<CubenceBalanceResponse> {
    return this.client.get<CubenceBalanceResponse>('/api/user/self');
  }

  async fetchCosts(period: CostPeriod): Promise<CubenceCostsResponse> {
    const [start, end] = getDateRange(period);
    const pageSize = 100;
    return fetchAllCubenceCostsPages<NonNullable<CubenceCostsResponse['logs']>[number]>(
      async (page, size) =>
        this.client.get<CubenceCostsResponse>(
          `/api/v1/analytics/apikeys/logs?start_date=${start}&end_date=${end}&page_size=${size}&page=${page}`,
        ),
      pageSize,
    );
  }

  async fetchTokens(page = 1, size = 100): Promise<CubenceTokensResponse> {
    return this.client.get<CubenceTokensResponse>(`/api/token/?p=${page}&size=${size}`);
  }

  async fetchTokenGroups(): Promise<CubenceTokenGroupsResponse> {
    return this.client.get<CubenceTokenGroupsResponse>('/api/user/self/groups');
  }

  async fetchOverview(): Promise<CubenceOverviewResponse> {
    return this.client.get<CubenceOverviewResponse>('/api/v1/dashboard/overview');
  }

  async fetchAnnouncements(): Promise<CubenceAnnouncementsResponse> {
    return this.client.get<CubenceAnnouncementsResponse>(
      '/api/v1/announcements?page=1&page_size=100',
    );
  }
}
