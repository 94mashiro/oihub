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
  I7RelayWalletResponse,
  I7RelayTokenGroupsResponse,
  I7RelaySummaryResponse,
} from '@/lib/api/types/platforms';
import { I7RelayModelTokenUsageResponse } from '../types/platforms/i7relay-response-types';

// =============================================================================
// i7Relay Adapter Implementation
// =============================================================================

export const i7relayAdapter = {
  platformType: 'i7relay',

  normalizeBalance(
    walletData: I7RelayWalletResponse,
    summaryData: I7RelaySummaryResponse,
  ): Balance {
    return {
      remainingCredit: walletData.wallet.balanceUsd ?? 0,
      consumedCredit: summaryData.totalCost ?? 0,
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
      lastUsedAt: new Date(item.lastUsedAt).getTime() / 1000,
      // TODO: 接口暂不支持这个数据
      creditConsumed: null,
      group: item.groups.map((it) => it.code),
    }));
  },

  normalizeTokenGroups(response: I7RelayTokenGroupsResponse): Record<string, TokenGroup> {
    const output: Record<string, TokenGroup> = {};
    response.forEach((it) => {
      output[it.code] = {
        name: it.name,
        description: it.description,
        multiplier: it.multiplier,
      };
    });
    return output;
  },

  normalizeTenantInfo(): TenantInfo {
    return {
      creditUnit: 1,
      exchangeRate: 1,
      displayFormat: 'USD',
      endpoints: [
        {
          id: 1,
          route: 'i7Relay API',
          description: '',
          url: 'https://i7dc.com/api',
        },
      ],
      notices: [],
    };
  },
};
