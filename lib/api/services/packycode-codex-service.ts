import { APIClient } from '../client/api-client';
import type { Tenant } from '@/types/tenant';
import { CostPeriod, COST_PERIOD_DAYS } from '@/types/api';
import type {
  PackyCodeCodexBalanceResponse,
  PackyCodeCodexCostsResponse,
  PackyCodeCodexTokensResponse,
  PackyCodeCodexTokenGroupsResponse,
  PackyCodeCodexTenantInfoResponse,
  PackyCodeCodexUserInfoResponse,
  PackyCodeCodexRealTokenKeyResponse,
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
    },
    // PackyCode Codex 平台返回的 body 为原始数据结构（无标准 APIResponse 包裹）
    unwrap: (body) => body,
    timeout: 30000,
    enableLogging: false,
  });
}

/**
 * Raw PackyCode Codex service - fetches raw data without transformation.
 */
export class PackyCodeCodexRawService {
  private readonly client: APIClient;

  constructor(tenant: Tenant) {
    this.client = createPackyCodeCodexClient(tenant);
  }

  async fetchUserInfo(): Promise<PackyCodeCodexUserInfoResponse> {
    return this.client.get<PackyCodeCodexUserInfoResponse>('/api/backend/users/info');
  }

  async fetchBalance(): Promise<PackyCodeCodexBalanceResponse> {
    return {};
  }

  async fetchCosts(period: CostPeriod): Promise<PackyCodeCodexCostsResponse> {
    return [];
  }

  async fetchTokens(): Promise<PackyCodeCodexTokensResponse> {
    const userId = (await this.fetchUserInfo()).user_id;
    return this.client.get<PackyCodeCodexTokensResponse>(`/api/backend/users/${userId}/api-keys`);
  }

  async fetchRealTokenKey(tokenId: string): Promise<PackyCodeCodexRealTokenKeyResponse> {
    const userId = (await this.fetchUserInfo()).user_id;
    return this.client.get<PackyCodeCodexRealTokenKeyResponse>(
      `/api/backend/users/${userId}/api-keys/${tokenId}`,
    );
  }

  async fetchTokenGroups(): Promise<PackyCodeCodexTokenGroupsResponse> {
    return this.client.get<PackyCodeCodexTokenGroupsResponse>('/api/user/self/groups');
  }

  async fetchTenantInfo(): Promise<PackyCodeCodexTenantInfoResponse> {
    return this.client.get<PackyCodeCodexTenantInfoResponse>('/api/status');
  }
}
