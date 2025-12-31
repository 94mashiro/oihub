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

export interface PackyCodeCodexToken {
  // 2025/08/29
  created_at: string;
  expires_at: string | null;
  id: string;
  key_preview: string;
  // 2025/12/31 06:02
  last_used_at: string;
  name: string;
  status: string;
}

export interface PackyCodeCodexTokensResponse {
  total: number;
  api_keys: PackyCodeCodexToken[];
}

export interface PackyCodeCodexRealTokenKeyResponse {
  api_key: string;
  created_at: string;
  id: string;
  name: string;
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
  api_endpoints?: any[];

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

export interface PackyCodeCodexUserInfoResponse {
  api_key: string;
  balance_usd: number;
  created_at: string;
  daily_budget_usd: string;
  daily_spent_usd: string;
  email: string;
  monthly_budget_usd: string;
  monthly_spent_usd: string;
  plan_expires_at: string;
  plan_type: string;
  remaining_quota: number;
  total_quota: number;
  total_spent_usd: string;
  used_quota: number;
  user_id: string;
  user_type: string;
  username: string;
  weekly_budget_usd: string;
  weekly_spent_usd: string;
  weekly_window_end: string;
  weekly_window_start: string;
}
