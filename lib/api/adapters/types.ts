/**
 * Normalized Data Types for Cross-Platform Support
 *
 * These types define the normalized data structures used across the application.
 * Platform adapters transform raw API responses into these types.
 */

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
export type PlatformType = 'newapi' | 'packycode_codex';

// =============================================================================
// Platform Adapter Interface
// =============================================================================

/** Interface that platform implementations must fulfill. */
export interface PlatformAdapter {
  readonly platformType: PlatformType;
  normalizeBalance(raw: unknown): Balance;
  normalizeCosts(raw: unknown[]): Cost[];
  normalizeTokens(raw: unknown[]): Token[];
  normalizeTokenGroups(raw: unknown): Record<string, TokenGroup>;
  normalizeTenantInfo(raw: unknown): import('@/types/tenant').TenantInfo;
}
