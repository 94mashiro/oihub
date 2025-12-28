/**
 * Normalized Data Types for Cross-Platform Support
 *
 * These types define the normalized data structures used across the application.
 * Platform adapters transform raw API responses into these types.
 */

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
  CubenceTenantInfoResponse,
  PackyCodeCodexBalanceResponse,
  PackyCodeCodexCostsResponse,
  PackyCodeCodexTokensResponse,
  PackyCodeCodexTokenGroupsResponse,
  PackyCodeCodexTenantInfoResponse,
} from '@/lib/api/types/platforms';

// =============================================================================
// Core Normalized Types
// =============================================================================

/** Normalized balance data representing user's credit status. */
export interface Balance {
  /** Available credit balance */
  remainingCredit: number;
  /** Historical credit consumption */
  consumedCredit: number;
}

/** Normalized cost record representing per-model credit consumption. */
export interface Cost {
  /** Model identifier */
  modelId: string;
  /** Credit consumed for this model */
  creditCost: number;
  /** Tokens consumed for this model */
  tokenUsage: number;
}

/** Normalized token data representing API key information. */
export interface Token {
  /** API key value (without prefix) */
  secretKey: string;
  /** User-defined token name */
  label: string;
  /** Unix timestamp of last access */
  lastUsedAt: number;
  /** Total credit consumed by this token */
  creditConsumed: number;
  /** Token group identifier */
  group: string;
}

/** Token group metadata for display purposes. */
export interface TokenGroup {
  /** Group description for tooltip */
  description: string;
  /** Cost multiplier for this group */
  multiplier: number;
}

// =============================================================================
// Platform Types
// =============================================================================

/** Supported platform types. */
export type PlatformType = 'newapi' | 'packycode_codex' | 'cubence';

// =============================================================================
// Platform Adapter Interface
// =============================================================================

/**
 * Platform adapter interface.
 * Adapters transform raw API responses directly into normalized types.
 *
 * Generic type parameters enable platform-specific type safety:
 * - TBalanceResponse: Platform balance response type
 * - TCostsResponse: Platform costs response type
 * - TTokensResponse: Platform tokens response type
 * - TTokenGroupsResponse: Platform token groups response type
 * - TTenantInfoResponse: Platform tenant info response type
 */
export interface PlatformAdapter<
  TBalanceResponse = unknown,
  TCostsResponse = unknown,
  TTokensResponse = unknown,
  TTokenGroupsResponse = unknown,
  TTenantInfoResponse = unknown,
> {
  readonly platformType: PlatformType;
  /** Transform raw balance response into normalized Balance */
  normalizeBalance(response: TBalanceResponse): Balance;
  /** Transform raw costs response into normalized Cost array */
  normalizeCosts(response: TCostsResponse): Cost[];
  /** Transform raw tokens response into normalized Token array */
  normalizeTokens(response: TTokensResponse): Token[];
  /** Transform raw token groups response into TokenGroup map */
  normalizeTokenGroups(response: TTokenGroupsResponse): Record<string, TokenGroup>;
  /** Transform raw tenant info response into TenantInfo */
  normalizeTenantInfo(response: TTenantInfoResponse): import('@/types/tenant').TenantInfo;
}

// =============================================================================
// Platform-Specific Adapter Interfaces
// =============================================================================

/** NewAPI adapter with typed response parameters */
export interface NewAPIPlatformAdapter extends PlatformAdapter<
  NewAPIBalanceResponse,
  NewAPICostsResponse,
  NewAPITokensResponse,
  NewAPITokenGroupsResponse,
  NewAPITenantInfoResponse
> {
  readonly platformType: 'newapi';
}

/** Cubence adapter with typed response parameters */
export interface CubencePlatformAdapter extends PlatformAdapter<
  CubenceBalanceResponse,
  CubenceCostsResponse,
  CubenceTokensResponse,
  CubenceTokenGroupsResponse,
  CubenceTenantInfoResponse
> {
  readonly platformType: 'cubence';
}

/** PackyCode Codex adapter with typed response parameters */
export interface PackyCodeCodexPlatformAdapter extends PlatformAdapter<
  PackyCodeCodexBalanceResponse,
  PackyCodeCodexCostsResponse,
  PackyCodeCodexTokensResponse,
  PackyCodeCodexTokenGroupsResponse,
  PackyCodeCodexTenantInfoResponse
> {
  readonly platformType: 'packycode_codex';
}
