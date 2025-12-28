/**
 * NewAPI Platform Response Type Definitions
 *
 * Type definitions for NewAPI platform service API responses.
 * These types represent the raw API response structures before
 * adapter normalization.
 */

/** Returned by `/api/user/self` endpoint */
export interface NewAPIBalanceResponse {
  /** User ID */
  id: number;

  /** Username */
  username: string;

  /** Display name */
  display_name: string;

  /** User email address */
  email: string;

  /** User role identifier */
  role: number;

  /** Account status code */
  status: number;

  /** User group identifier */
  group: string;

  /** Remaining account credits - maps to `remainingCredit` in normalized Balance type */
  quota: number;

  /** Credits consumed since account creation - maps to `consumedCredit` in normalized Balance type */
  used_quota: number;

  /** Total API request count */
  request_count: number;

  /** Affiliate referral code used for inviting new users */
  aff_code: string;

  /** Number of users who signed up using this user's affiliate code */
  aff_count: number;

  /** Total credits earned from affiliate referrals */
  aff_quota: number;

  /** Historical affiliate quota tracking */
  aff_history_quota: number;

  /** Inviter user ID */
  inviter_id: number;

  /** GitHub OAuth ID */
  github_id: string;

  /** Telegram OAuth ID */
  telegram_id: string;

  /** WeChat OAuth ID */
  wechat_id: string;

  /** Linux.do OAuth ID */
  linux_do_id: string;

  /** OIDC provider ID */
  oidc_id: string;

  /** Stripe customer ID */
  stripe_customer: string;

  /** User settings JSON string */
  setting: string;

  /** Sidebar modules configuration */
  sidebar_modules: string;

  /** User permissions */
  permissions: {
    sidebar_modules: {
      admin: boolean;
    };
    sidebar_settings: boolean;
  };
}

/** Returned by `/api/data/self?start_timestamp=X&end_timestamp=Y` endpoint (array of items) */
export interface NewAPICostData {
  /** API request count for this model */
  count: number;

  /** Unix timestamp when cost was created */
  created_at: number;

  /** Cost record ID */
  id: number;

  /** AI model identifier (maps to modelId) */
  model_name: string;

  /** Credit cost for this usage (maps to creditCost) */
  quota: number;

  /** Tokens consumed (maps to tokenUsage) */
  token_used: number;

  /** User ID who incurred the cost */
  user_id: number;

  /** Username */
  username: string;
}

export type NewAPICostsResponse = NewAPICostData[];

/** Returned by `/api/token/?p=1&size=100` endpoint (paginated) */
export interface NewAPIToken {
  /** Unix timestamp when token was last accessed (maps to lastUsedAt) */
  accessed_time: number;

  /** API key secret (maps to secretKey) */
  key: string;

  /** Token display name (maps to label) */
  name: string;

  /** Credits consumed by this token (maps to creditConsumed) */
  used_quota: number;

  /** Unix timestamp when token was created */
  created_time: number;

  /** Token group name (maps to group) */
  group: string;
}

export interface NewAPITokensResponse {
  /** Array of tokens */
  items: NewAPIToken[];

  /** Total token count (optional, for pagination) */
  total?: number;

  /** Current page number (optional, for pagination) */
  page?: number;

  /** Page size (optional, for pagination) */
  page_size?: number;
}

/** Returned by `/api/user/self/groups` endpoint - maps group name to group metadata */
export interface NewAPITokenGroup {
  /** Human-readable group description - maps to `description` in normalized TokenGroup type */
  desc: string;

  /** Credit cost multiplier for tokens in this group - maps to `multiplier` in normalized TokenGroup type. Example: 1.5 means 1.5x credit cost */
  ratio: number;
}

export type NewAPITokenGroupsResponse = Record<string, NewAPITokenGroup>;

/** Returned by `/api/status` endpoint */
export interface NewAPITenantInfoResponse {
  /** Credits per unit (maps to creditUnit) */
  quota_per_unit?: number;

  /** USD exchange rate (maps to exchangeRate) */
  usd_exchange_rate?: number;

  /** Quota display format type (maps to displayFormat) */
  quota_display_type?: string;

  /** Available API endpoints (maps to endpoints) */
  api_info?: Array<{
    id: number;
    route: string;
    description: string;
    url: string;
  }>;

  /** Platform announcements (maps to notices) */
  announcements?: Array<{
    id: number;
    content: string;
    extra: string;
    publishDate: string;
    type: string;
  }>;
}
