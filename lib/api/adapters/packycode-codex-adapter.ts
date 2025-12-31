/**
 * PackyCode Codex Platform Adapter
 *
 * Normalizes PackyCode Codex-specific API responses to common types.
 */

import type { Balance, Cost, Token, TokenGroup } from './types';
import type { TenantInfo } from '@/types/tenant';
import type {
  PackyCodeCodexBalanceResponse,
  PackyCodeCodexCostsResponse,
  PackyCodeCodexTokensResponse,
  PackyCodeCodexTokenGroupsResponse,
  PackyCodeCodexTenantInfoResponse,
  PackyCodeCodexToken,
  PackyCodeCodexTokenGroup,
  PackyCodeCodexCostData,
} from '@/lib/api/types/platforms';

// =============================================================================
// PackyCode Codex Adapter Implementation
// =============================================================================

export const packyCodeCodexAdapter = {
  platformType: 'packycode_codex',

  normalizeBalance(response: PackyCodeCodexBalanceResponse): Balance {
    return {
      remainingCredit: response.remaining_quota ?? response.total_quota ?? 0,
      consumedCredit: response.consumed_quota ?? 0,
    };
  },

  normalizeCosts(response: PackyCodeCodexCostsResponse): Cost[] {
    return response.map((item: PackyCodeCodexCostData) => ({
      modelId: item.model_id ?? 'unknown',
      creditCost: item.credit_usage ?? 0,
      tokenUsage: item.token_count ?? 0,
    }));
  },

  normalizeTokens(response: PackyCodeCodexTokensResponse): Token[] {
    const items: PackyCodeCodexToken[] = Array.isArray(response) ? response : response.items || [];

    return items.map((item) => ({
      secretKey: item.api_key ?? '',
      label: item.token_name ?? 'Unnamed Token',
      lastUsedAt: item.last_access_time ?? 0,
      creditConsumed: item.total_usage ?? 0,
      group: item.token_group ?? 'default',
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

  normalizeTenantInfo(response: PackyCodeCodexTenantInfoResponse): TenantInfo {
    if (!response || typeof response !== 'object') {
      return {};
    }

    return {
      creditUnit: response.credit_per_unit,
      exchangeRate: response.usd_rate,
      displayFormat: response.display_type,
      endpoints: response.api_endpoints,
      notices: response.announcements?.map((it) => ({
        id: it.id,
        content: it.content,
        extra: it.title,
        publishDate: it.published_at,
        type: '',
      })),
    };
  },
};
