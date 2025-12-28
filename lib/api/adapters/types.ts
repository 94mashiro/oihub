/**
 * Normalized Data Types for Cross-Platform Support
 *
 * These types define the normalized data structures used across the application.
 * Platform adapters transform raw API responses into these types.
 */

import type { TenantInfo } from '@/types/tenant';
import type {
  NewAPIBalanceResponse,
  NewAPICostsResponse,
  NewAPITokensResponse,
  NewAPITokenGroupsResponse,
  NewAPITenantInfoResponse,
  CubenceCostsResponse,
  CubenceTokensResponse,
  CubenceTokenGroupsResponse,
  CubenceAnnouncementsResponse,
  PackyCodeCodexBalanceResponse,
  PackyCodeCodexCostsResponse,
  PackyCodeCodexTokensResponse,
  PackyCodeCodexTokenGroupsResponse,
  PackyCodeCodexTenantInfoResponse,
  CubenceOverviewResponse,
} from '@/lib/api/types/platforms';

// =============================================================================
// Core Normalized Types (Store Data Structures)
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
// Platform-Specific Adapter Interfaces
// =============================================================================

/** NewAPI adapter - standard normalize methods */
export interface NewAPIAdapter {
  readonly platformType: 'newapi';
  normalizeBalance(response: NewAPIBalanceResponse): Balance;
  normalizeCosts(response: NewAPICostsResponse): Cost[];
  normalizeTokens(response: NewAPITokensResponse): Token[];
  normalizeTokenGroups(response: NewAPITokenGroupsResponse): Record<string, TokenGroup>;
  normalizeTenantInfo(response: NewAPITenantInfoResponse): TenantInfo;
}

/** Cubence adapter - normalizeTenantInfo requires announcements */
export interface CubenceAdapter {
  readonly platformType: 'cubence';
  normalizeBalance(response: CubenceOverviewResponse): Balance;
  normalizeCosts(response: CubenceCostsResponse): Cost[];
  normalizeTokens(response: CubenceTokensResponse): Token[];
  normalizeTokenGroups(response: CubenceTokenGroupsResponse): Record<string, TokenGroup>;
  /** Cubence requires both tenant info and announcements */
  normalizeTenantInfo(announcements: CubenceAnnouncementsResponse): TenantInfo;
}

/** PackyCode Codex adapter - standard normalize methods */
export interface PackyCodeCodexAdapter {
  readonly platformType: 'packycode_codex';
  normalizeBalance(response: PackyCodeCodexBalanceResponse): Balance;
  normalizeCosts(response: PackyCodeCodexCostsResponse): Cost[];
  normalizeTokens(response: PackyCodeCodexTokensResponse): Token[];
  normalizeTokenGroups(response: PackyCodeCodexTokenGroupsResponse): Record<string, TokenGroup>;
  normalizeTenantInfo(response: PackyCodeCodexTenantInfoResponse): TenantInfo;
}
