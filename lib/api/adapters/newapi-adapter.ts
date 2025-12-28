/**
 * NewAPI Platform Adapter
 *
 * Normalizes newapi-specific API responses to common types.
 */

import type { Balance, Cost, Token, TokenGroup, NewAPIPlatformAdapter } from './types';
import type { TenantInfo } from '@/types/tenant';
import type {
  NewAPIBalanceSources,
  NewAPICostSources,
  NewAPITokenSources,
  NewAPITenantInfoSources,
} from '@/lib/api/types/platforms';
import type {
  NewAPIBalanceResponse,
  NewAPIToken,
  NewAPITokenGroup,
  NewAPITokensResponse,
  NewAPICostData,
} from '@/lib/api/types/platforms';

// =============================================================================
// NewAPI Adapter Implementation
// =============================================================================

export const newAPIAdapter: NewAPIPlatformAdapter = {
  platformType: 'newapi',

  normalizeBalance(sources: NewAPIBalanceSources): Balance {
    const data = sources.primary;
    return {
      remainingCredit: data.quota ?? 0,
      consumedCredit: data.used_quota ?? 0,
    };
  },

  normalizeCosts(sources: NewAPICostSources): Cost[] {
    return sources.costs.map((item: NewAPICostData) => ({
      modelId: item.model_name ?? 'unknown',
      creditCost: item.quota ?? 0,
      tokenUsage: item.token_used ?? 0,
    }));
  },

  normalizeTokens(sources: NewAPITokenSources): Token[] {
    const tokensData = sources.tokens;
    // Handle both array and NewAPITokensResponse structure
    const items: NewAPIToken[] = Array.isArray(tokensData) ? tokensData : tokensData.items || [];

    return items.map((item) => ({
      secretKey: item.key,
      label: item.name,
      lastUsedAt: item.accessed_time,
      creditConsumed: item.used_quota,
      group: item.group,
    }));
  },

  normalizeTokenGroups(sources: NewAPITokenSources): Record<string, TokenGroup> {
    if (!sources.groups) return {};
    const data: Record<string, NewAPITokenGroup> = sources.groups;
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

  normalizeTenantInfo(sources: NewAPITenantInfoSources): TenantInfo {
    const data = sources.status;

    return {
      creditUnit: data.quota_per_unit,
      exchangeRate: data.usd_exchange_rate,
      displayFormat: data.quota_display_type,
      endpoints: data.api_info,
      notices: data.announcements,
    };
  },
};
