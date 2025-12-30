/**
 * i7Relay Platform Adapter
 *
 * Normalizes i7Relay-specific API responses to common types.
 */

import type { Balance, Cost, Token, TokenGroup } from './types';
import type { TenantInfo } from '@/types/tenant';
import type {
  I7RelayCostsResponse,
  I7RelayTokensResponse,
  I7RelayCostData,
  I7RelayAnnouncementsResponse,
  I7RelayOverviewResponse,
  I7RelayWalletResponse,
} from '@/lib/api/types/platforms';
import { I7RelayModelTokenUsageResponse } from '../types/platforms/i7relay-response-types';

// =============================================================================
// i7Relay Adapter Implementation
// =============================================================================

export const i7relayAdapter = {
  platformType: 'i7relay',

  normalizeBalance(response: I7RelayWalletResponse): Balance {
    return {
      remainingCredit: response.wallet.balanceUsd ?? 0,
      consumedCredit: 0,
    };
  },

  normalizeCosts(
    costData: I7RelayCostsResponse,
    tokenData: I7RelayModelTokenUsageResponse,
  ): Cost[] {
    const logs: I7RelayCostData[] = costData.items || [];
    const tokenDistribution = tokenData.tokenDistribution.data || [];

    // Aggregate costs by model across all items and providers
    const modelAggregates = new Map<string, { cost: number; tokens: number }>();

    logs.forEach((item) => {
      Object.values(item.providers).forEach((provider) => {
        Object.entries(provider.models).forEach(([modelName, modelCost]) => {
          const existing = modelAggregates.get(modelName);
          if (existing) {
            existing.cost += modelCost;
            existing.tokens += provider.totalTokens;
          } else {
            modelAggregates.set(modelName, {
              cost: modelCost,
              tokens: provider.totalTokens,
            });
          }
        });
      });
    });

    console.log({
      modelAggregates,
      tokenDistribution,
    });

    // Convert aggregated map to Cost array
    return Array.from(modelAggregates.entries()).map(([modelId, data]) => ({
      modelId,
      creditCost: data.cost,
      tokenUsage: tokenDistribution.find((it) => it.name === modelId)?.value ?? 0,
    }));
  },

  normalizeTokens(response: I7RelayTokensResponse): Token[] {
    return response.map((item) => ({
      secretKey: item.key ?? '',
      label: item.name ?? 'Unnamed Token',
      lastUsedAt: new Date(item.last_used_at).getTime() / 1000,
      creditConsumed: item.quota_used ?? 0,
      group: item.service_groups.map((it) => it.group.id.toString()),
    }));
  },

  normalizeTokenGroups(response: I7RelayTokensResponse): Record<string, TokenGroup> {
    const groups = response.flatMap((it) => it.service_groups.map((it) => it.group));
    console.log(groups);
    return groups.reduce(
      (acc, group) => {
        acc[group.id] = {
          name: group.name ?? '',
          description: group.description ?? '',
          multiplier: group.multiplier ?? 1.0,
        };
        return acc;
      },
      {} as Record<string, TokenGroup>,
    );
  },

  normalizeTenantInfo(announcements: I7RelayAnnouncementsResponse): TenantInfo {
    return {
      creditUnit: 1000000,
      exchangeRate: 1,
      displayFormat: 'USD',
      endpoints: [
        {
          id: 1,
          route: 'i7Relay API',
          description: '',
          url: 'https://i7dc.com',
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
