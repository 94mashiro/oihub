/**
 * Cubence Platform Adapter
 *
 * Normalizes Cubence-specific API responses to common types.
 */

import type { Balance, Cost, Token, TokenGroup, CubencePlatformAdapter } from './types';
import type { TenantInfo } from '@/types/tenant';
import type {
  CubenceBalanceResponse,
  CubenceCostsResponse,
  CubenceTokensResponse,
  CubenceTokenGroupsResponse,
  CubenceTenantInfoResponse,
  CubenceToken,
  CubenceTokenGroup,
  CubenceCostData,
} from '@/lib/api/types/platforms';

// =============================================================================
// Cubence Adapter Implementation
// =============================================================================

export const cubenceAdapter: CubencePlatformAdapter = {
  platformType: 'cubence',

  normalizeBalance(response: CubenceBalanceResponse): Balance {
    return {
      remainingCredit: response.available_credit ?? response.total_credit ?? 0,
      consumedCredit: response.used_credit ?? 0,
    };
  },

  normalizeCosts(response: CubenceCostsResponse): Cost[] {
    return response.map((item: CubenceCostData) => ({
      modelId: item.model ?? 'unknown',
      creditCost: item.cost ?? 0,
      tokenUsage: item.tokens ?? 0,
    }));
  },

  normalizeTokens(response: CubenceTokensResponse): Token[] {
    const items: CubenceToken[] = Array.isArray(response) ? response : response.items || [];

    return items.map((item) => ({
      secretKey: item.key ?? '',
      label: item.name ?? 'Unnamed Token',
      lastUsedAt: item.last_used ?? 0,
      creditConsumed: item.usage ?? 0,
      group: item.category ?? 'default',
    }));
  },

  normalizeTokenGroups(response: CubenceTokenGroupsResponse): Record<string, TokenGroup> {
    if (!response) return {};
    const data: Record<string, CubenceTokenGroup> = response;
    return Object.fromEntries(
      Object.entries(data).map(([key, value]: [string, CubenceTokenGroup]) => [
        key,
        {
          description: value.description ?? '',
          multiplier: value.rate ?? 1.0,
        },
      ]),
    );
  },

  normalizeTenantInfo(response: CubenceTenantInfoResponse): TenantInfo {
    if (!response || typeof response !== 'object') {
      return {};
    }

    return {
      creditUnit: undefined,
      exchangeRate: undefined,
      displayFormat: undefined,
      endpoints: undefined,
      notices: Array.isArray(response.announcements)
        ? response.announcements.map((it) => ({
            id: it.id,
            content: it.content,
            extra: it.title,
            publishDate: it.published_at,
            type: it.priority ?? '',
          }))
        : undefined,
    };
  },
};
