/**
 * PackyCode Codex Platform Adapter
 *
 * Normalizes PackyCode Codex-specific API responses to common types.
 */

import type { Balance, Cost, Token, TokenGroup } from './types';
import { PlatformType } from './types';
import type { TenantInfo } from '@/types/tenant';
import type {
  PackyCodeCodexCostsResponse,
  PackyCodeCodexTokensResponse,
  PackyCodeCodexTokenGroupsResponse,
  PackyCodeCodexTokenGroup,
  PackyCodeCodexCostData,
  PackyCodeCodexUserInfoResponse,
  PackyCodeCodexRealTokenKeyResponse,
} from '@/lib/api/types/platforms';
import { parse } from 'date-fns';

// =============================================================================
// PackyCode Codex Adapter Implementation
// =============================================================================

export const packyCodeCodexAdapter = {
  platformType: PlatformType.PackyCodeCodex,

  normalizeBalance(response: PackyCodeCodexUserInfoResponse): Balance {
    return {
      remainingCredit: Number(response.daily_budget_usd) - Number(response.daily_spent_usd) || 0,
      consumedCredit: Number(response.total_spent_usd) || 0,
    };
  },

  normalizeCosts(response: PackyCodeCodexCostsResponse): Cost[] {
    return response.map((item: PackyCodeCodexCostData) => ({
      modelId: item.model_id ?? 'unknown',
      creditCost: item.credit_usage ?? 0,
      tokenUsage: item.token_count ?? 0,
    }));
  },

  normalizeTokens(
    tokenData: PackyCodeCodexTokensResponse,
    realTokenKeys: PackyCodeCodexRealTokenKeyResponse[],
  ): Token[] {
    return tokenData.api_keys.map((token) => ({
      secretKey: realTokenKeys.find((key) => key.id === token.id)?.api_key ?? '',
      label: token.name,
      lastUsedAt: parse(token.last_used_at, 'yyyy/MM/dd HH:mm', new Date()).getTime() / 1000,
      creditConsumed: null,
      group: null,
    }));
  },

  normalizeTokenGroups(response: PackyCodeCodexTokenGroupsResponse): Record<string, TokenGroup> {
    if (!response) return {};
    const data: Record<string, PackyCodeCodexTokenGroup> = response;
    return Object.fromEntries(
      Object.entries(data).map(([key, value]: [string, PackyCodeCodexTokenGroup]) => [
        key,
        {
          name: '',
          description: value.group_desc ?? '',
          multiplier: value.credit_ratio ?? 1.0,
        },
      ]),
    );
  },

  normalizeTenantInfo(): TenantInfo {
    return {
      creditUnit: 1,
      exchangeRate: 1,
      displayFormat: 'USD',
      endpoints: [
        {
          id: 1,
          route: 'Standard Route (Default)',
          description:
            '✓ DDoS protection and security defense mechanisms \n ✓ Stable and reliable for production \n ✓ Recommended for most users',
          url: 'https://codex-api.packycode.com/v1',
        },
        {
          id: 2,
          route: 'Optimized Route',
          description:
            '✓ Network optimized with lower latency \n ✗ No defense mechanisms \n ⚠️ Suitable for latency-sensitive scenarios',
          url: 'https://codex-api-slb.packycode.com/v1',
        },
      ],
      notices: [],
    };
  },
};
