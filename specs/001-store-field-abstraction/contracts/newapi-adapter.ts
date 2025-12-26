/**
 * NewAPI Platform Adapter Contract
 * Feature: 001-store-field-abstraction
 *
 * Defines the raw types from the newapi platform and the adapter implementation.
 */

import type { Balance, Cost, Token, TokenGroup, PlatformAdapter } from './types';

// =============================================================================
// Raw NewAPI Types (platform-specific)
// =============================================================================

/**
 * Raw balance response from newapi /api/user/self endpoint.
 */
export interface NewAPITenantBalance {
  id: number;
  username: string;
  display_name: string;
  email: string;
  role: number;
  status: number;
  group: string;
  quota: number;
  used_quota: number;
  request_count: number;
  aff_code: string;
  aff_count: number;
  aff_quota: number;
  aff_history_quota: number;
  inviter_id: number;
  github_id: string;
  telegram_id: string;
  wechat_id: string;
  linux_do_id: string;
  oidc_id: string;
  stripe_customer: string;
  setting: string;
  sidebar_modules: string;
  permissions: {
    sidebar_modules: { admin: boolean };
    sidebar_settings: boolean;
  };
}

/**
 * Raw cost data from newapi /api/log/stat endpoint.
 */
export interface NewAPICostData {
  count: number;
  created_at: number;
  id: number;
  model_name: string;
  quota: number;
  token_used: number;
  user_id: number;
  username: string;
}

/**
 * Raw token from newapi /api/token endpoint.
 */
export interface NewAPIToken {
  accessed_time: number;
  key: string;
  name: string;
  used_quota: number;
  created_time: number;
  group: string;
}

/**
 * Raw token group from newapi /api/user/group endpoint.
 */
export interface NewAPITokenGroup {
  desc: string;
  ratio: number;
}

// =============================================================================
// NewAPI Adapter Implementation Contract
// =============================================================================

/**
 * NewAPI adapter implementation.
 * Normalizes newapi-specific responses to common types.
 */
export const newAPIAdapter: PlatformAdapter = {
  platformType: 'newapi',

  normalizeBalance(raw: unknown): Balance {
    const data = raw as NewAPITenantBalance;
    return {
      remainingCredit: data.quota ?? 0,
      consumedCredit: data.used_quota ?? 0,
    };
  },

  normalizeCosts(raw: unknown[]): Cost[] {
    return (raw as NewAPICostData[]).map((item) => ({
      modelId: item.model_name ?? 'unknown',
      creditCost: item.quota ?? 0,
      tokenUsage: item.token_used ?? 0,
    }));
  },

  normalizeTokens(raw: unknown[]): Token[] {
    return (raw as NewAPIToken[]).map((item) => ({
      secretKey: item.key,
      label: item.name,
      lastUsedAt: item.accessed_time,
      creditConsumed: item.used_quota,
      group: item.group,
    }));
  },

  normalizeTokenGroups(raw: unknown): Record<string, TokenGroup> {
    const data = raw as Record<string, NewAPITokenGroup>;
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        {
          description: value.desc,
          multiplier: value.ratio,
        },
      ]),
    );
  },
};
