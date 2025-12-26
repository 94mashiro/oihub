/**
 * NewAPI Platform Adapter
 *
 * Normalizes newapi-specific API responses to common types.
 */

import type { Balance, Cost, Token, TokenGroup, PlatformAdapter } from './types';
import type { TenantInfo } from '@/types/tenant';

// =============================================================================
// Raw NewAPI Types (platform-specific)
// =============================================================================

interface NewAPITenantBalance {
  quota: number;
  used_quota: number;
}

interface NewAPICostData {
  model_name: string;
  quota: number;
  token_used: number;
}

interface NewAPIToken {
  accessed_time: number;
  key: string;
  name: string;
  used_quota: number;
  group: string;
}

interface NewAPITokenGroup {
  desc: string;
  ratio: number;
}

// =============================================================================
// NewAPI Adapter Implementation
// =============================================================================

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

  normalizeTenantInfo(raw: unknown): TenantInfo {
    if (!raw || typeof raw !== 'object') {
      return {};
    }

    const data = raw as Record<string, unknown>;

    return {
      creditUnit: typeof data.quota_per_unit === 'number' ? data.quota_per_unit : undefined,
      exchangeRate: typeof data.usd_exchange_rate === 'number' ? data.usd_exchange_rate : undefined,
      displayFormat:
        typeof data.quota_display_type === 'string' ? data.quota_display_type : undefined,
      endpoints: Array.isArray(data.api_info) ? data.api_info : undefined,
      notices: Array.isArray(data.announcements) ? data.announcements : undefined,
    };
  },
};
