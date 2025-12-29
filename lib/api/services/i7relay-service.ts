import type { Tenant } from '@/types/tenant';
import type { CostPeriod } from '@/types/api';
import type {
  I7RelayBalanceResponse,
  I7RelayCostsResponse,
  I7RelayTokensResponse,
  I7RelayTokenGroupsResponse,
  I7RelayTenantInfoResponse,
} from '@/lib/api/types/platforms';

/**
 * Raw i7Relay service - fetches raw data without transformation.
 * Framework implementation - all methods throw NotImplementedError.
 */
export class I7RelayRawService {
  constructor(_tenant: Tenant) {
    // Framework code - no client initialization needed
  }

  async fetchBalance(): Promise<I7RelayBalanceResponse> {
    throw new Error('I7Relay fetchBalance not implemented');
  }

  async fetchCosts(_period: CostPeriod): Promise<I7RelayCostsResponse> {
    throw new Error('I7Relay fetchCosts not implemented');
  }

  async fetchTokens(_page = 1, _size = 100): Promise<I7RelayTokensResponse> {
    throw new Error('I7Relay fetchTokens not implemented');
  }

  async fetchTokenGroups(): Promise<I7RelayTokenGroupsResponse> {
    throw new Error('I7Relay fetchTokenGroups not implemented');
  }

  async fetchTenantInfo(): Promise<I7RelayTenantInfoResponse> {
    throw new Error('I7Relay fetchTenantInfo not implemented');
  }
}
