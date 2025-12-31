/**
 * Normalized Data Types for Cross-Platform Support
 *
 * These types define the normalized data structures used across the application.
 * Platform adapters transform raw API responses into these types.
 */

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
  creditConsumed: number | null;
  /** Token group identifier */
  group: string | string[];
}

/** Token group metadata for display purposes. */
export interface TokenGroup {
  /** Group description for tooltip */
  description: string;
  /** Cost multiplier for this group */
  multiplier: number;
  /** Group name for display purposes */
  name: string;
}

// =============================================================================
// Platform Types
// =============================================================================

/** Supported platform types. */
export enum PlatformType {
  NewAPI = 'newapi',
  PackyCodeCodex = 'packycode_codex',
  Cubence = 'cubence',
  I7Relay = 'i7relay',
}
