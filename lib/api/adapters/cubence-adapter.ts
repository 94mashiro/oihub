/**
 * Cubence Platform Adapter
 *
 * Normalizes Cubence-specific API responses to common types.
 */

import type { Balance, Cost, Token, TokenGroup, CubenceAdapter } from './types';
import type { TenantInfo } from '@/types/tenant';
import type {
  CubenceCostsResponse,
  CubenceTokensResponse,
  CubenceTokenGroupsResponse,
  CubenceToken,
  CubenceTokenGroup,
  CubenceCostData,
  CubenceAnnouncementsResponse,
  CubenceOverviewResponse,
} from '@/lib/api/types/platforms';

// =============================================================================
// Cubence Adapter Implementation
// =============================================================================

export const cubenceAdapter: CubenceAdapter = {
  platformType: 'cubence',

  normalizeBalance(response: CubenceOverviewResponse): Balance {
    return {
      remainingCredit: response.balance.total_balance ?? 0,
      consumedCredit: response.apikey_stats.quota_used ?? 0,
    };
  },

  normalizeCosts(response: CubenceCostsResponse): Cost[] {
    const logs: CubenceCostData[] = response.logs || [];
    return logs.map((item: CubenceCostData) => ({
      modelId: item.model ?? 'unknown',
      creditCost: item.cost ?? 0,
      tokenUsage: item.total_tokens ?? 0,
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

  normalizeTenantInfo(announcements: CubenceAnnouncementsResponse): TenantInfo {
    return {
      creditUnit: 1000000,
      exchangeRate: 1,
      displayFormat: 'USD',
      endpoints: [
        {
          id: 1,
          route: 'Cubence API',
          description: '',
          url: 'https://api.cubence.com',
        },
        {
          id: 2,
          route: 'Cubence DMIT API',
          description: '',
          url: 'https://api-dmit.cubence.com',
        },
        {
          id: 3,
          route: 'Cubence BWG API',
          description: '',
          url: 'https://api-bwg.cubence.com',
        },
        {
          id: 4,
          route: 'Cubence CF API',
          description: '',
          url: 'https://api-cf.cubence.com',
        },
      ],
      notices: announcements?.announcements?.map((it) => ({
        id: it.id,
        content: it.content,
        extra: it.title,
        publishDate: it.published_at,
        type: it.priority ?? '',
      })),
    };
  },
};
