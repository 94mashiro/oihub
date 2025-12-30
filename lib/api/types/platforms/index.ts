/**
 * Platform Service Response Type Definitions
 *
 * Central barrel export for platform-specific API response types.
 * Provides type-safe access to platform response structures and
 * platform type mapping utilities.
 */

import type { PlatformType } from '@/lib/api/adapters/types';

// ============================================================================
// NewAPI Platform Types
// ============================================================================

export type {
  NewAPIBalanceResponse,
  NewAPICostData,
  NewAPICostsResponse,
  NewAPIToken,
  NewAPITokensResponse,
  NewAPITokenGroup,
  NewAPITokenGroupsResponse,
  NewAPITenantInfoResponse,
} from './newapi-response-types';

// ============================================================================
// Cubence Platform Types
// ============================================================================

export type {
  CubenceBalanceResponse,
  CubenceCostData,
  CubenceCostsResponse,
  CubenceToken,
  CubenceTokensResponse,
  CubenceTokenGroup,
  CubenceTokenGroupsResponse,
  CubenceAnnouncementsResponse,
  CubenceOverviewResponse,
} from './cubence-response-types';

// ============================================================================
// PackyCode Codex Platform Types
// ============================================================================

export type {
  PackyCodeCodexBalanceResponse,
  PackyCodeCodexCostData,
  PackyCodeCodexCostsResponse,
  PackyCodeCodexToken,
  PackyCodeCodexTokensResponse,
  PackyCodeCodexTokenGroup,
  PackyCodeCodexTokenGroupsResponse,
  PackyCodeCodexTenantInfoResponse,
} from './packycode-codex-response-types';

// ============================================================================
// i7Relay Platform Types
// ============================================================================

export type {
  I7RelayWalletResponse,
  I7RelayCostData,
  I7RelayCostsResponse,
  I7RelayToken,
  I7RelayTokensResponse,
  I7RelayTokenGroup,
  I7RelayTokenGroupsResponse,
  I7RelayAnnouncementsResponse,
  I7RelayOverviewResponse,
  I7RelayModelTokenUsageResponse,
} from './i7relay-response-types';

// ============================================================================
// Platform Type Mapping Utility
// ============================================================================

import type {
  NewAPIBalanceResponse,
  NewAPICostsResponse,
  NewAPITokensResponse,
  NewAPITokenGroupsResponse,
  NewAPITenantInfoResponse,
} from './newapi-response-types';

import type {
  CubenceBalanceResponse,
  CubenceCostsResponse,
  CubenceTokensResponse,
  CubenceTokenGroupsResponse,
  CubenceOverviewResponse,
} from './cubence-response-types';

import type {
  PackyCodeCodexBalanceResponse,
  PackyCodeCodexCostsResponse,
  PackyCodeCodexTokensResponse,
  PackyCodeCodexTokenGroupsResponse,
  PackyCodeCodexTenantInfoResponse,
} from './packycode-codex-response-types';

import type {
  I7RelayBalanceResponse,
  I7RelayCostsResponse,
  I7RelayTokensResponse,
  I7RelayTokenGroupsResponse,
  I7RelayOverviewResponse,
} from './i7relay-response-types';

/**
 * Platform Response Type Map
 *
 * Maps platform identifiers to their response type sets for each endpoint.
 * Enables type-safe platform + endpoint lookups.
 */
export interface PlatformResponseTypeMap {
  newapi: {
    balance: NewAPIBalanceResponse;
    costs: NewAPICostsResponse;
    tokens: NewAPITokensResponse;
    tokenGroups: NewAPITokenGroupsResponse;
    tenantInfo: NewAPITenantInfoResponse;
  };
  cubence: {
    balance: CubenceBalanceResponse;
    costs: CubenceCostsResponse;
    tokens: CubenceTokensResponse;
    tokenGroups: CubenceTokenGroupsResponse;
    tenantInfo: CubenceOverviewResponse;
  };
  packycode_codex: {
    balance: PackyCodeCodexBalanceResponse;
    costs: PackyCodeCodexCostsResponse;
    tokens: PackyCodeCodexTokensResponse;
    tokenGroups: PackyCodeCodexTokenGroupsResponse;
    tenantInfo: PackyCodeCodexTenantInfoResponse;
  };
  i7relay: {
    balance: I7RelayBalanceResponse;
    costs: I7RelayCostsResponse;
    tokens: I7RelayTokensResponse;
    tokenGroups: I7RelayTokenGroupsResponse;
    tenantInfo: I7RelayOverviewResponse;
  };
}

/**
 * Platform Response Type Utility
 *
 * Get the response type for a specific platform + endpoint combination.
 *
 * @example
 * type NewAPIBalance = PlatformResponse<'newapi', 'balance'>;
 * // Result: NewAPIBalanceResponse
 */
export type PlatformResponse<
  P extends PlatformType,
  E extends keyof PlatformResponseTypeMap[P],
> = PlatformResponseTypeMap[P][E];
