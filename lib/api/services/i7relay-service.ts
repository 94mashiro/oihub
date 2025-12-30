import { APIClient } from '../client/api-client';
import type { Tenant } from '@/types/tenant';
import { CostPeriod, COST_PERIOD_DAYS } from '@/types/api';
import type {
  I7RelayCostsResponse,
  I7RelayModelTokenUsageResponse,
  I7RelayTokensResponse,
  I7RelayWalletResponse,
} from '@/lib/api/types/platforms';

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateRange(period: CostPeriod): [string, string] {
  const now = new Date();
  const end = formatLocalDate(now);
  const days = COST_PERIOD_DAYS[period];
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - (days - 1));
  const start = formatLocalDate(startDate);
  return [start, end];
}

function createI7RelayClient(tenant: Tenant): APIClient {
  return new APIClient({
    baseURL: tenant.url,
    headers: {
      Cookie: `i7token=${tenant.token}`,
    },
    timeout: 30000,
    enableLogging: false,
  });
}

/**
 * Raw i7Relay service - fetches raw data without transformation.
 */
export class I7RelayRawService {
  private readonly client: APIClient;

  constructor(tenant: Tenant) {
    this.client = createI7RelayClient(tenant);
  }

  async fetchWallet(): Promise<I7RelayWalletResponse> {
    return this.client.get<I7RelayWalletResponse>('/api/user/stats/wallet');
  }

  async fetchCosts(period: CostPeriod): Promise<I7RelayCostsResponse> {
    const [start, end] = getDateRange(period);
    return this.client.get<I7RelayCostsResponse>(
      `/api/user/usage/daily-grouped?dateFrom=${start}&dateTo=${end}&pageSize=${30}&page=${1}`,
    );
  }

  async fetchModelTokenUsage(period: CostPeriod): Promise<I7RelayModelTokenUsageResponse> {
    const periodMap = {
      [CostPeriod.DAY_1]: 'today',
      [CostPeriod.DAY_7]: '7days',
      [CostPeriod.DAY_14]: '14days',
      [CostPeriod.DAY_30]: '30days',
    };
    const periodKey = periodMap[period];
    return this.client.get<I7RelayModelTokenUsageResponse>(
      `/api/user/stats/distribution?period=${periodKey}`,
    );
  }

  async fetchTokens(): Promise<I7RelayTokensResponse> {
    return this.client.get<I7RelayTokensResponse>('/api/v1/user/apikeys');
  }
}
