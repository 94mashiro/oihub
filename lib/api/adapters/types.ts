/**
 * Normalized Data Types for Cross-Platform Support
 *
 * These types define the normalized data structures used across the application.
 * Platform adapters transform raw API responses into these types.
 */

import type {
  BalanceSources,
  CostSources,
  TokenSources,
  TenantInfoSources,
} from '@/lib/api/orchestrators/types';
import type {
  NewAPIBalanceSources,
  CubenceBalanceSources,
  PackyCodeCodexBalanceSources,
  NewAPICostSources,
  CubenceCostSources,
  PackyCodeCodexCostSources,
  NewAPITokenSources,
  CubenceTokenSources,
  PackyCodeCodexTokenSources,
  NewAPITenantInfoSources,
  CubenceTenantInfoSources,
  PackyCodeCodexTenantInfoSources,
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
 * Adapters accept source bags for multi-API merge support.
 *
 * Generic type parameters enable platform-specific type safety:
 * - TBalanceSources: Platform balance sources type
 * - TCostSources: Platform cost sources type
 * - TTokenSources: Platform token sources type
 * - TTenantInfoSources: Platform tenant info sources type
 */
export interface PlatformAdapter<
  TBalanceSources extends BalanceSources = BalanceSources,
  TCostSources extends CostSources = CostSources,
  TTokenSources extends TokenSources = TokenSources,
  TTenantInfoSources extends TenantInfoSources = TenantInfoSources,
> {
  readonly platformType: PlatformType;
  /** Transform balance sources into normalized Balance */
  normalizeBalance(sources: TBalanceSources): Balance;
  /** Transform cost sources into normalized Cost array */
  normalizeCosts(sources: TCostSources): Cost[];
  /** Transform token sources into normalized Token array */
  normalizeTokens(sources: TTokenSources): Token[];
  /** Transform token sources into TokenGroup map */
  normalizeTokenGroups(sources: TTokenSources): Record<string, TokenGroup>;
  /** Transform tenant info sources into TenantInfo */
  normalizeTenantInfo(sources: TTenantInfoSources): import('@/types/tenant').TenantInfo;
}

// =============================================================================
// Platform-Specific Adapter Interfaces
// =============================================================================

/** NewAPI adapter with typed source parameters */
export interface NewAPIPlatformAdapter extends PlatformAdapter<
  NewAPIBalanceSources,
  NewAPICostSources,
  NewAPITokenSources,
  NewAPITenantInfoSources
> {
  readonly platformType: 'newapi';
}

/** Cubence adapter with typed source parameters */
export interface CubencePlatformAdapter extends PlatformAdapter<
  CubenceBalanceSources,
  CubenceCostSources,
  CubenceTokenSources,
  CubenceTenantInfoSources
> {
  readonly platformType: 'cubence';
}

/** PackyCode Codex adapter with typed source parameters */
export interface PackyCodeCodexPlatformAdapter extends PlatformAdapter<
  PackyCodeCodexBalanceSources,
  PackyCodeCodexCostSources,
  PackyCodeCodexTokenSources,
  PackyCodeCodexTenantInfoSources
> {
  readonly platformType: 'packycode_codex';
}
