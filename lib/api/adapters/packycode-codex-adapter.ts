/**
 * PackyCode Codex Platform Adapter
 *
 * Normalizes PackyCode Codex-specific API responses to common types.
 */

import type { Balance, Cost, Token, TokenGroup, PlatformAdapter } from './types';
import type { TenantInfo } from '@/types/tenant';
import type {
  BalanceSources,
  CostSources,
  TokenSources,
  TenantInfoSources,
} from '@/lib/api/orchestrators/types';

// =============================================================================
// Raw PackyCode Codex Types (platform-specific)
// =============================================================================

interface PackyCodeCodexTenantBalance {
  remaining_quota?: number;
  total_quota?: number;
  consumed_quota?: number;
}

interface PackyCodeCodexCostData {
  model_id?: string;
  credit_usage?: number;
  token_count?: number;
}

interface PackyCodeCodexToken {
  api_key?: string;
  token_name?: string;
  last_access_time?: number;
  total_usage?: number;
  token_group?: string;
}

interface PackyCodeCodexTokenGroup {
  group_desc?: string;
  credit_ratio?: number;
}

// =============================================================================
// PackyCode Codex Adapter Implementation
// =============================================================================

export const packyCodeCodexAdapter: PlatformAdapter = {
  platformType: 'packycode_codex',

  normalizeBalance(sources: BalanceSources): Balance {
    const data = sources.primary as PackyCodeCodexTenantBalance;
    return {
      remainingCredit: data.remaining_quota ?? data.total_quota ?? 0,
      consumedCredit: data.consumed_quota ?? 0,
    };
  },

  normalizeCosts(sources: CostSources): Cost[] {
    return (sources.costs as PackyCodeCodexCostData[]).map((item) => ({
      modelId: item.model_id ?? 'unknown',
      creditCost: item.credit_usage ?? 0,
      tokenUsage: item.token_count ?? 0,
    }));
  },

  normalizeTokens(sources: TokenSources): Token[] {
    return (sources.tokens as PackyCodeCodexToken[]).map((item) => ({
      secretKey: item.api_key ?? '',
      label: item.token_name ?? 'Unnamed Token',
      lastUsedAt: item.last_access_time ?? 0,
      creditConsumed: item.total_usage ?? 0,
      group: item.token_group ?? 'default',
    }));
  },

  normalizeTokenGroups(sources: TokenSources): Record<string, TokenGroup> {
    if (!sources.groups) return {};
    const data = sources.groups as Record<string, PackyCodeCodexTokenGroup>;
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        {
          description: value.group_desc ?? '',
          multiplier: value.credit_ratio ?? 1.0,
        },
      ]),
    );
  },

  normalizeTenantInfo(sources: TenantInfoSources): TenantInfo {
    const raw = sources.status;
    if (!raw || typeof raw !== 'object') {
      return {};
    }

    const data = raw as Record<string, unknown>;

    return {
      creditUnit: typeof data.credit_per_unit === 'number' ? data.credit_per_unit : undefined,
      exchangeRate: typeof data.usd_rate === 'number' ? data.usd_rate : undefined,
      displayFormat: typeof data.display_type === 'string' ? data.display_type : undefined,
      endpoints: Array.isArray(data.api_endpoints) ? data.api_endpoints : undefined,
      notices: Array.isArray(data.announcements) ? data.announcements : undefined,
    };
  },
};
