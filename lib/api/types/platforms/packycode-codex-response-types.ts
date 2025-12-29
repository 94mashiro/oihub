/**
 * PackyCode Codex Platform Response Type Definitions
 *
 * Type definitions for PackyCode Codex platform service API responses.
 * These types represent the raw API response structures before
 * adapter normalization.
 */

/** Returned by `/api/user/self` endpoint */
export interface PackyCodeCodexBalanceResponse {
  /** Remaining quota (PREFERRED over total_quota for `remainingCredit` field) - represents the actual spendable balance */
  remaining_quota?: number;

  /** Total quota (FALLBACK for `remainingCredit` if remaining_quota missing) - may include allocated but not yet available credits */
  total_quota?: number;

  /** Consumed quota - maps to `consumedCredit` in normalized Balance type, defaults to 0 if missing */
  consumed_quota?: number;
}

/** Returned by `/api/data/self?start_timestamp=X&end_timestamp=Y` endpoint (array of items) */
export interface PackyCodeCodexCostData {
  /** AI model identifier (maps to modelId, defaults to 'unknown' if missing) */
  model_id?: string;

  /** Credit usage for this request (maps to creditCost, defaults to 0 if missing) */
  credit_usage?: number;

  /** Token count consumed (maps to tokenUsage, defaults to 0 if missing) */
  token_count?: number;
}

export type PackyCodeCodexCostsResponse = PackyCodeCodexCostData[];

/** Returned by `/api/token/?p=1&size=100` endpoint (paginated) */
export interface PackyCodeCodexToken {
  /** API key secret (maps to secretKey, defaults to '' if missing) */
  api_key?: string;

  /** Token display name (maps to label, defaults to 'Unnamed Token' if missing) */
  token_name?: string;

  /** Unix timestamp (seconds) of last access - maps to `lastUsedAt` in normalized Token type, defaults to 0 if missing */
  last_access_time?: number;

  /** Total usage credits consumed by this token - maps to `creditConsumed` in normalized Token type, defaults to 0 if missing */
  total_usage?: number;

  /** Token group name/identifier - maps to `group` in normalized Token type, defaults to 'default' if missing */
  token_group?: string;
}

export interface PackyCodeCodexTokensResponse {
  /** Array of tokens (may be undefined) */
  items?: PackyCodeCodexToken[];

  /** Total token count (optional, for pagination) */
  total?: number;

  /** Current page number (optional, for pagination) */
  page?: number;

  /** Page size (optional, for pagination) */
  page_size?: number;
}

/** Returned by `/api/user/self/groups` endpoint - maps group name to group metadata */
export interface PackyCodeCodexTokenGroup {
  /** Human-readable group description - maps to `description` in normalized TokenGroup type, defaults to '' if missing */
  group_desc?: string;

  /** Credit cost ratio/multiplier for tokens in this group - maps to `multiplier` in normalized TokenGroup type, defaults to 1.0 if missing. Example: 0.8 means 0.8x credit cost (20% discount) */
  credit_ratio?: number;
}

export type PackyCodeCodexTokenGroupsResponse = Record<string, PackyCodeCodexTokenGroup>;

/** Returned by `/api/status` endpoint */
export interface PackyCodeCodexTenantInfoResponse {
  /** Credits per unit (maps to creditUnit) */
  credit_per_unit?: number;

  /** USD rate (maps to exchangeRate) */
  usd_rate?: number;

  /** Display type format (maps to displayFormat) */
  display_type?: string;

  /** API endpoints list (maps to endpoints) */
  api_endpoints?: Array<{
    id: number;
    route: string;
    description: string;
    url: string;
  }>;

  /** Platform announcements (maps to notices) */
  announcements?: Array<{
    id: number;
    content: string;
    /** Announcement title (maps to extra in normalized type) */
    title: string;
    /** Publication timestamp (maps to publishDate) */
    published_at: string;
  }>;
}
