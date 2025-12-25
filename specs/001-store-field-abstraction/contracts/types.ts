/**
 * Normalized Data Types Contract
 * Feature: 001-store-field-abstraction
 *
 * These types define the normalized data structures used across the application.
 * Platform adapters transform raw API responses into these types.
 */

// =============================================================================
// Core Normalized Types
// =============================================================================

/**
 * Normalized balance data representing user's credit status.
 */
export interface Balance {
  /** Available credit balance */
  remainingCredit: number;
  /** Historical credit consumption */
  consumedCredit: number;
}

/**
 * Normalized cost record representing per-model credit consumption.
 */
export interface Cost {
  /** Model identifier */
  modelId: string;
  /** Credit consumed for this model */
  creditCost: number;
  /** Tokens consumed for this model */
  tokenUsage: number;
}

/**
 * Normalized token data representing API key information.
 */
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

/**
 * Token group metadata for display purposes.
 */
export interface TokenGroup {
  /** Group description for tooltip */
  description: string;
  /** Cost multiplier for this group */
  multiplier: number;
}

// =============================================================================
// Platform Types
// =============================================================================

/**
 * Supported platform types.
 * Extensible via string literal union.
 */
export type PlatformType = 'newapi';

// =============================================================================
// Platform Adapter Interface
// =============================================================================

/**
 * Interface that platform implementations must fulfill.
 * Each method normalizes platform-specific API responses to common types.
 */
export interface PlatformAdapter {
  /** Platform identifier */
  readonly platformType: PlatformType;

  /**
   * Normalize raw balance response to Balance type.
   * @param raw - Raw API response (platform-specific)
   * @returns Normalized Balance
   */
  normalizeBalance(raw: unknown): Balance;

  /**
   * Normalize raw cost data to Cost array.
   * @param raw - Raw API response (platform-specific)
   * @returns Array of normalized Cost records
   */
  normalizeCosts(raw: unknown[]): Cost[];

  /**
   * Normalize raw token data to Token array.
   * @param raw - Raw API response (platform-specific)
   * @returns Array of normalized Token records
   */
  normalizeTokens(raw: unknown[]): Token[];

  /**
   * Normalize raw token groups to TokenGroup record.
   * @param raw - Raw API response (platform-specific)
   * @returns Record of group ID to TokenGroup
   */
  normalizeTokenGroups(raw: unknown): Record<string, TokenGroup>;
}

// =============================================================================
// Store State Types
// =============================================================================

/**
 * Balance store persisted state.
 */
export type BalancePersistedState = {
  balanceList: Record<string, Balance>;
};

/**
 * Cost store persisted state.
 */
export type CostPersistedState = {
  costList: Record<string, Partial<Record<string, Cost[]>>>;
};

/**
 * Token store persisted state.
 */
export type TokenPersistedState = {
  tokenList: Record<string, Token[]>;
  tokenGroups: Record<string, Record<string, TokenGroup>>;
};
