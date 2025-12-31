import { APIClient } from '../client/api-client';
import { fetchAllCubenceCostsPages } from './cubence-service-utils';
import type { Tenant } from '@/types/tenant';
import { CostPeriod, COST_PERIOD_DAYS } from '@/types/api';
import type {
  CubenceCostsResponse,
  CubenceTokensResponse,
  CubenceOverviewResponse,
  CubenceAnnouncementsResponse,
} from '@/lib/api/types/platforms';

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// TODO: Cubence API 不支持当天查询,logs 接口不会返回当天内容
// 这是平台限制,预算提醒功能对 Cubence 平台不可用
// 如需启用,可考虑使用昨日数据或寻找其他 API 端点
function getDateRange(period: CostPeriod): [string, string] {
  const now = new Date();
  const end = formatLocalDate(now);
  const days = COST_PERIOD_DAYS[period];
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - (days - 1));
  const start = formatLocalDate(startDate);
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
export class CubenceRawService {
  private readonly client: APIClient;

  constructor(tenant: Tenant) {
    this.client = createCubenceClient(tenant);
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

  async fetchTokens(): Promise<CubenceTokensResponse> {
    return this.client.get<CubenceTokensResponse>('/api/v1/user/apikeys');
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
