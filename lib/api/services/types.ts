import type { Balance, Cost, Token, TokenGroup } from '@/lib/api/adapters/types';
import type { TenantInfo } from '@/types/tenant';
import type { PaginationResult, CostPeriod } from '@/types/api';
import type { RawAPIResponse } from '@/lib/api/orchestrators/types';

export interface IPlatformService {
  getTenantInfo(): Promise<TenantInfo>;
  getBalance(): Promise<Balance>;
  getTokens(page?: number, size?: number): Promise<PaginationResult<Token>>;
  getTokenGroups(): Promise<Record<string, TokenGroup>>;
  getCostData(period: CostPeriod): Promise<Cost[]>;
}

/**
 * Raw platform service interface.
 * Services ONLY fetch raw data - no transformation.
 */
export interface IRawPlatformService {
  /** Fetch raw balance data */
  fetchBalance(): Promise<RawAPIResponse>;
  /** Fetch raw cost data for a period */
  fetchCosts(period: CostPeriod): Promise<RawAPIResponse>;
  /** Fetch raw token list */
  fetchTokens(page?: number, size?: number): Promise<RawAPIResponse>;
  /** Fetch raw token groups */
  fetchTokenGroups(): Promise<RawAPIResponse>;
  /** Fetch raw tenant/platform info */
  fetchTenantInfo(): Promise<RawAPIResponse>;
}
