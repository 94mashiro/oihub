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

/** Returned by `/api/v1/analytics/apikeys/logs` endpoint (paginated) */
export interface CubenceCostData {
  id: number;
  user_api_key_id: number;
  share_id: number;
  share_name: string;
  group_name: string;
  api_key_name: string;
  method: string;
  path: string;
  status_code: number;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  total_tokens: number;
  cost: number;
  latency: number;
  client_ip: string;
  created_at: string;
}

export interface CubenceCostsResponse {
  logs?: CubenceCostData[];
  total?: number;
  total_pages?: number;
  page?: number;
  page_size?: number;
}

/** Returned by `/api/token/?p=1&size=100` endpoint */
export interface CubenceToken {
  id: number;
  user_id: number;
  name: string;
  key: string;
  status: string;
  share_type: string;
  quota_limit: number;
  quota_used: number;
  usage_count: number;
  last_used_at: string;
  created_at: string;
  updated_at: string;
  service_groups: {
    id: number;
    apikey_id: number;
    service_type: string;
    group_id: number;
    created_at: string;
    updated_at: string;
    group: {
      id: number;
      name: string;
      service_type: string;
      description: string;
      is_active: boolean;
      priority: number;
      multiplier: number;
      created_at: string;
      updated_at: string;
    };
  }[];
}

export type CubenceTokensResponse = CubenceToken[];

/** Returned by `/api/user/self/groups` endpoint - maps group name to group metadata */
export interface CubenceTokenGroup {
  /** Human-readable group description - maps to `description` in normalized TokenGroup type, defaults to '' if missing */
  description?: string;

  /** Credit cost rate/multiplier for tokens in this group - maps to `multiplier` in normalized TokenGroup type, defaults to 1.0 if missing. Example: 2.0 means 2x credit cost */
  rate?: number;
}

export type CubenceTokenGroupsResponse = Record<string, CubenceTokenGroup>;

/** Returned by `/api/v1/dashboard/overview` endpoint */
export interface CubenceOverviewResponse {
  announcements?: Array<{
    id: number;
    priority: string;
    content: string;
    title: string;
    published_at: string;
  }>;
  apikey_stats: {
    active: number;
    quota_limit: number;
    quota_used: number;
    total: number;
  };
  balance: {
    charity_balance: number;
    charity_balance_dollar: number;
    normal_balance: number;
    normal_balance_dollar: number;
    subscription_balance: number;
    subscription_balance_dollar: number;
    total_balance: number;
    total_balance_dollar: number;
  };
  invite_stats: {
    available_amount: number;
    available_amount_yuan: number;
    invite_code: string;
    pending_amount: number;
    pending_amount_yuan: number;
    total_amount: number;
    total_amount_yuan: number;
    total_invited: number;
  };
  lottery: {
    available_times: 0;
    can_checkin: boolean;
    last_checkin: string | null;
    total_won: number;
  };
  share_stats: {
    active: number;
    opus_support: number;
    quota_used: number;
    total: number;
    total_quota: number;
  };

  subscription_limits: {
    five_hour: {
      limit: number;
      remaining: number;
      resets_at: string | null;
      used: number;
      window_start: string | null;
    };
    weekly: {
      limit: number;
      remaining: number;
      resets_at: string | null;
      used: number;
      window_start: string | null;
    };
  };
  system_stats: {
    opus_quota: number;
    opus_quota_raw: number;
    opus_used_quota: number;
    total_quota: number;
    total_quota_raw: number;
    used_quota: number;
  };
  user: {
    created_at: string;
    invite_code: string;
    role: string;
    username: string;
  };
}

export interface CubenceAnnouncement {
  id: number;
  title: string;
  content: string;
  status: string;
  priority: string;
  sort: number;
  published_at: string;
  published_by: number;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface CubenceAnnouncementsResponse {
  announcements: CubenceAnnouncement[];
  total: number;
  page: number;
  page_size: number;
}
