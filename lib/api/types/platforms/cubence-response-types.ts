/**
 * Cubence Platform Response Type Definitions
 *
 * Type definitions for Cubence platform service API responses.
 * These types represent the raw API response structures before
 * adapter normalization.
 */

/** Returned by `/api/user/self` endpoint */
export interface CubenceBalanceResponse {
  /** Available credits (PREFERRED over total_credit for `remainingCredit` field) - represents the actual spendable balance */
  available_credit?: number;

  /** Total credits (FALLBACK for `remainingCredit` if available_credit missing) - may include reserved or locked credits */
  total_credit?: number;

  /** Credits consumed - maps to `consumedCredit` in normalized Balance type, defaults to 0 if missing */
  used_credit?: number;
}

/** Returned by `/api/data/self?start_timestamp=X&end_timestamp=Y` endpoint (array of items) */
export interface CubenceCostData {
  /** AI model identifier (maps to modelId, defaults to 'unknown' if missing) */
  model?: string;

  /** Credit cost for this usage (maps to creditCost, defaults to 0 if missing) */
  cost?: number;

  /** Tokens consumed (maps to tokenUsage, defaults to 0 if missing) */
  tokens?: number;
}

export type CubenceCostsResponse = CubenceCostData[];

/** Returned by `/api/token/?p=1&size=100` endpoint (paginated) */
export interface CubenceToken {
  /** API key secret (maps to secretKey, defaults to '' if missing) */
  key?: string;

  /** Token display name (maps to label, defaults to 'Unnamed Token' if missing) */
  name?: string;

  /** Unix timestamp (seconds) when token was last used - maps to `lastUsedAt` in normalized Token type, defaults to 0 if missing */
  last_used?: number;

  /** Credits consumed by this token - maps to `creditConsumed` in normalized Token type, defaults to 0 if missing */
  usage?: number;

  /** Token category/group identifier - maps to `group` in normalized Token type, defaults to 'default' if missing */
  category?: string;
}

export interface CubenceTokensResponse {
  /** Array of tokens (may be undefined) */
  items?: CubenceToken[];

  /** Total token count (optional, for pagination) */
  total?: number;

  /** Current page number (optional, for pagination) */
  page?: number;

  /** Page size (optional, for pagination) */
  page_size?: number;
}

/** Returned by `/api/user/self/groups` endpoint - maps group name to group metadata */
export interface CubenceTokenGroup {
  /** Human-readable group description - maps to `description` in normalized TokenGroup type, defaults to '' if missing */
  description?: string;

  /** Credit cost rate/multiplier for tokens in this group - maps to `multiplier` in normalized TokenGroup type, defaults to 1.0 if missing. Example: 2.0 means 2x credit cost */
  rate?: number;
}

export type CubenceTokenGroupsResponse = Record<string, CubenceTokenGroup>;

/** Returned by merging `/api/v1/dashboard/overview` and `/api/v1/announcements?page=1&page_size=10` endpoints */
export interface CubenceTenantInfoResponse {
  /** Credits per unit (maps to creditUnit) */
  credit_unit?: number;

  /** Exchange rate (maps to exchangeRate) */
  exchange_rate?: number;

  /** Display format type (maps to displayFormat) */
  display_format?: string;

  /** Available endpoints (maps to endpoints) */
  endpoints?: any[];

  /** Nested announcements object */
  announcements?: {
    /** Platform announcements array (maps to notices) */
    announcements?: Array<{
      id: number;
      content: string;
      /** Announcement title (maps to extra in normalized type) */
      title: string;
      /** Publication timestamp (maps to publishDate) */
      published_at: string;
    }>;
  };
}
