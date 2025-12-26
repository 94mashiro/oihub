/**
 * PackyCode Codex Platform Adapter
 *
 * Normalizes PackyCode Codex-specific API responses to common types.
 */

import type { Balance, Cost, Token, TokenGroup, PlatformAdapter } from './types';
import type { TenantInfo } from '@/types/tenant';

// =============================================================================
// Raw PackyCode Codex Types (platform-specific)
// =============================================================================

/**
 * PackyCode Codex balance response structure
 * TODO: Update these types based on actual PackyCode Codex API documentation
 */
interface PackyCodeCodexTenantBalance {
  // Placeholder structure - adjust based on actual API
  remaining_quota?: number;
  total_quota?: number;
  consumed_quota?: number;
}

/**
 * PackyCode Codex cost record structure
 * TODO: Update based on actual PackyCode Codex API
 */
interface PackyCodeCodexCostData {
  model_id?: string;
  credit_usage?: number;
  token_count?: number;
}

/**
 * PackyCode Codex token/API key structure
 * TODO: Update based on actual PackyCode Codex API
 */
interface PackyCodeCodexToken {
  api_key?: string;
  token_name?: string;
  last_access_time?: number;
  total_usage?: number;
  token_group?: string;
}

/**
 * PackyCode Codex token group metadata
 * TODO: Update based on actual PackyCode Codex API
 */
interface PackyCodeCodexTokenGroup {
  group_desc?: string;
  credit_ratio?: number;
}

// =============================================================================
// PackyCode Codex Adapter Implementation
// =============================================================================

export const packyCodeCodexAdapter: PlatformAdapter = {
  platformType: 'packycode_codex',

  normalizeBalance(raw: unknown): Balance {
    const data = raw as PackyCodeCodexTenantBalance;

    // Default implementation - adjust based on actual API structure
    return {
      remainingCredit: data.remaining_quota ?? data.total_quota ?? 0,
      consumedCredit: data.consumed_quota ?? 0,
    };
  },

  normalizeCosts(raw: unknown[]): Cost[] {
    return (raw as PackyCodeCodexCostData[]).map((item) => ({
      modelId: item.model_id ?? 'unknown',
      creditCost: item.credit_usage ?? 0,
      tokenUsage: item.token_count ?? 0,
    }));
  },

  normalizeTokens(raw: unknown[]): Token[] {
    return (raw as PackyCodeCodexToken[]).map((item) => ({
      secretKey: item.api_key ?? '',
      label: item.token_name ?? 'Unnamed Token',
      lastUsedAt: item.last_access_time ?? 0,
      creditConsumed: item.total_usage ?? 0,
      group: item.token_group ?? 'default',
    }));
  },

  normalizeTokenGroups(raw: unknown): Record<string, TokenGroup> {
    const data = raw as Record<string, PackyCodeCodexTokenGroup>;
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

  normalizeTenantInfo(raw: unknown): TenantInfo {
    if (!raw || typeof raw !== 'object') {
      return {};
    }

    const data = raw as Record<string, unknown>;

    // Default implementation - adjust based on actual PackyCode Codex API
    return {
      creditUnit: typeof data.credit_per_unit === 'number' ? data.credit_per_unit : undefined,
      exchangeRate: typeof data.usd_rate === 'number' ? data.usd_rate : undefined,
      displayFormat: typeof data.display_type === 'string' ? data.display_type : undefined,
      endpoints: Array.isArray(data.api_endpoints) ? data.api_endpoints : undefined,
      notices: Array.isArray(data.announcements) ? data.announcements : undefined,
    };
  },
};
