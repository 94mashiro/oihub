import type { Balance, Cost, Token, TokenGroup } from '@/lib/api/adapters/types';
import type { TenantInfo } from '@/types/tenant';
import type { PaginationResult, CostPeriod } from '@/types/api';

// Platform-specific response types
import type {
  NewAPIBalanceResponse,
  NewAPICostsResponse,
  NewAPITokensResponse,
  NewAPITokenGroupsResponse,
  NewAPITenantInfoResponse,
  CubenceBalanceResponse,
  CubenceCostsResponse,
  CubenceTokensResponse,
  CubenceTokenGroupsResponse,
  CubenceOverviewResponse,
  PackyCodeCodexBalanceResponse,
  PackyCodeCodexCostsResponse,
  PackyCodeCodexTokensResponse,
  PackyCodeCodexTokenGroupsResponse,
  PackyCodeCodexTenantInfoResponse,
  CubenceAnnouncementsResponse,
} from '@/lib/api/types/platforms';

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
 *
 * Generic type parameters enable platform-specific type safety:
 * - TBalance: Platform balance response type
 * - TCosts: Platform costs response type (array)
 * - TTokens: Platform tokens response type
 * - TTokenGroups: Platform token groups response type
 * - TTenantInfo: Platform tenant info response type
 */
export interface IRawPlatformService<
  TBalance = unknown,
  TCosts = unknown,
  TTokens = unknown,
  TTokenGroups = unknown,
  TOverview = unknown,
  TAnnouncements = unknown,
> {
  /** Fetch raw balance data */
  fetchBalance(): Promise<TBalance>;
  /** Fetch raw cost data for a period */
  fetchCosts(period: CostPeriod): Promise<TCosts>;
  /** Fetch raw token list */
  fetchTokens(page?: number, size?: number): Promise<TTokens>;
  /** Fetch raw token groups */
  fetchTokenGroups(): Promise<TTokenGroups>;
  /** Fetch raw tenant/platform info */
  fetchOverview(): Promise<TOverview>;
  fetchAnnouncements(): Promise<TAnnouncements>;
}

// =============================================================================
// Platform-Specific Service Interfaces
// =============================================================================

/** NewAPI raw service with typed responses */
export interface INewAPIRawService extends IRawPlatformService<
  NewAPIBalanceResponse,
  NewAPICostsResponse,
  NewAPITokensResponse,
  NewAPITokenGroupsResponse,
  NewAPITenantInfoResponse
> {}

/** Cubence raw service with typed responses */
export interface ICubenceRawService extends IRawPlatformService<
  CubenceBalanceResponse,
  CubenceCostsResponse,
  CubenceTokensResponse,
  CubenceTokenGroupsResponse,
  CubenceOverviewResponse,
  CubenceAnnouncementsResponse
> {}

/** PackyCode Codex raw service with typed responses */
export interface IPackyCodeCodexRawService extends IRawPlatformService<
  PackyCodeCodexBalanceResponse,
  PackyCodeCodexCostsResponse,
  PackyCodeCodexTokensResponse,
  PackyCodeCodexTokenGroupsResponse,
  PackyCodeCodexTenantInfoResponse
> {}
