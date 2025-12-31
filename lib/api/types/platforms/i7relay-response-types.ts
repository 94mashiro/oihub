/**
 * i7Relay Platform Response Type Definitions
 *
 * Type definitions for i7Relay platform service API responses.
 * These types represent the raw API response structures before
 * adapter normalization.
 */

/** Returned by `/api/user/self` endpoint */
export interface I7RelayWalletResponse {
  wallet: {
    balanceUsd: number;
    concurrentLimit: number;
    debtUsd: number;
  };
}

export interface I7RelaySummaryResponse {
  requestCount: {
    percentChange: number;
    today: number;
    total: number;
    yesterday: number;
  };
  todayTokens: {
    cacheCreation: number;
    cacheRead: number;
    input: number;
    output: number;
    total: number;
  };
  tokenPercentChange: {
    cacheCreation: number;
    cacheRead: number;
    input: number;
    output: number;
    total: number;
  };
  totalCost: number;
  totalTokens: {
    cacheCreation: number;
    cacheRead: number;
    input: number;
    output: number;
    total: number;
  };
  yesterdayTokens: {
    cacheCreation: number;
    cacheRead: number;
    input: number;
    output: number;
    total: number;
  };
}

export interface I7RelayProviderCostData {
  cacheCreationTokens: number;
  cacheReadTokens: number;
  cost: number;
  inputTokens: number;
  // model -> cost
  models: Record<string, number>;
  opusCost: number;
  outputTokens: number;
  requests: number;
  totalTokens: number;
}

/** Returned by `/api/v1/analytics/apikeys/logs` endpoint (paginated) */
export interface I7RelayCostData {
  cacheCreationTokens: number;
  cacheReadTokens: number;
  // 2025-12-30
  date: string;
  inputTokens: number;
  outputTokens: number;
  // 真实费用，单位 USD
  totalCost: number;
  totalRequests: number;
  totalTokens: number;
  providers: Record<string, I7RelayProviderCostData>;
}

export interface I7RelayCostsResponse {
  items?: I7RelayCostData[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface I7RelayModelTokenUsageResponse {
  tokenDistribution: {
    data: {
      name: string;
      percentage: number;
      value: number;
    }[];
    period: string;
  };
}

/** Returned by `/api/token/?p=1&size=100` endpoint */
export interface I7RelayToken {
  // 2025-12-30T15:33:35.95Z ISO Date String
  createdAt: string;
  description: string;
  groups: {
    code: string;
    id: string;
    isPrimary: boolean;
    multiplier: number;
    name: string;
    provider: string;
  }[];
  id: string;
  isActive: boolean;
  key: string;
  lastUsedAt: string;
  name: string;
  prefix: string;
}

export type I7RelayTokensResponse = I7RelayToken[];

/** Returned by `/api/v1/dashboard/overview` endpoint */
export interface I7RelayOverviewResponse {
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

export interface I7RelayAnnouncement {
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

export interface I7RelayAnnouncementsResponse {
  announcements: I7RelayAnnouncement[];
  total: number;
  page: number;
  page_size: number;
}

export interface I7RelayTokenGroup {
  code: string;
  description: string;
  features: string[];
  id: string;
  isDefault: boolean;
  multiplier: number;
  name: string;
  poolTypeList: string[];
  provider: string;
  visibleUserIds: string[];
}

export type I7RelayTokenGroupsResponse = I7RelayTokenGroup[];
