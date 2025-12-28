/**
 * NewAPI Platform Adapter
 *
 * Normalizes newapi-specific API responses to common types.
 */

import type { Balance, Cost, Token, TokenGroup, NewAPIAdapter } from './types';
import type { TenantInfo } from '@/types/tenant';
import type {
  NewAPIBalanceResponse,
  NewAPICostsResponse,
  NewAPITokensResponse,
  NewAPITokenGroupsResponse,
  NewAPITenantInfoResponse,
  NewAPIToken,
  NewAPITokenGroup,
  NewAPICostData,
} from '@/lib/api/types/platforms';

// =============================================================================
// NewAPI Adapter Implementation
// =============================================================================

export const newAPIAdapter: NewAPIAdapter = {
  platformType: 'newapi',

  normalizeBalance(response: NewAPIBalanceResponse): Balance {
    return {
      remainingCredit: response.quota ?? 0,
      consumedCredit: response.used_quota ?? 0,
    };
  },

  normalizeCosts(response: NewAPICostsResponse): Cost[] {
    return response.map((item: NewAPICostData) => ({
      modelId: item.model_name ?? 'unknown',
      creditCost: item.quota ?? 0,
      tokenUsage: item.token_used ?? 0,
    }));
  },

  normalizeTokens(response: NewAPITokensResponse): Token[] {
    // Handle both array and NewAPITokensResponse structure
    const items: NewAPIToken[] = Array.isArray(response) ? response : response.items || [];

    return items.map((item) => ({
      secretKey: item.key,
      label: item.name,
      lastUsedAt: item.accessed_time,
      creditConsumed: item.used_quota,
      group: item.group,
    }));
  },

  normalizeTokenGroups(response: NewAPITokenGroupsResponse): Record<string, TokenGroup> {
    if (!response) return {};
    const data: Record<string, NewAPITokenGroup> = response;
    return Object.fromEntries(
      Object.entries(data).map(([key, value]: [string, NewAPITokenGroup]) => [
        key,
        {
          description: value.desc,
          multiplier: value.ratio,
        },
      ]),
    );
  },

  normalizeTenantInfo(response: NewAPITenantInfoResponse): TenantInfo {
    return {
      creditUnit: response.quota_per_unit,
      exchangeRate: response.usd_exchange_rate,
      displayFormat: response.quota_display_type,
      endpoints: response.api_info,
      notices: response.announcements,
    };
  },
};
