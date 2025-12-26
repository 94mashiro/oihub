/**
 * Cubence Platform Adapter
 *
 * Normalizes Cubence-specific API responses to common types.
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
// Raw Cubence Types (platform-specific)
// =============================================================================

interface CubenceTenantBalance {
  available_credit?: number;
  total_credit?: number;
  used_credit?: number;
}

interface CubenceCostData {
  model?: string;
  cost?: number;
  tokens?: number;
}

interface CubenceToken {
  key?: string;
  name?: string;
  last_used?: number;
  usage?: number;
  category?: string;
}

interface CubenceTokenGroup {
  description?: string;
  rate?: number;
}

// =============================================================================
// Cubence Adapter Implementation
// =============================================================================

export const cubenceAdapter: PlatformAdapter = {
  platformType: 'cubence',

  normalizeBalance(sources: BalanceSources): Balance {
    const data = sources.primary as CubenceTenantBalance;
    return {
      remainingCredit: data.available_credit ?? data.total_credit ?? 0,
      consumedCredit: data.used_credit ?? 0,
    };
  },

  normalizeCosts(sources: CostSources): Cost[] {
    return (sources.costs as CubenceCostData[]).map((item) => ({
      modelId: item.model ?? 'unknown',
      creditCost: item.cost ?? 0,
      tokenUsage: item.tokens ?? 0,
    }));
  },

  normalizeTokens(sources: TokenSources): Token[] {
    return (sources.tokens as CubenceToken[]).map((item) => ({
      secretKey: item.key ?? '',
      label: item.name ?? 'Unnamed Token',
      lastUsedAt: item.last_used ?? 0,
      creditConsumed: item.usage ?? 0,
      group: item.category ?? 'default',
    }));
  },

  normalizeTokenGroups(sources: TokenSources): Record<string, TokenGroup> {
    if (!sources.groups) return {};
    const data = sources.groups as Record<string, CubenceTokenGroup>;
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        {
          description: value.description ?? '',
          multiplier: value.rate ?? 1.0,
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
      creditUnit: typeof data.credit_unit === 'number' ? data.credit_unit : undefined,
      exchangeRate: typeof data.exchange_rate === 'number' ? data.exchange_rate : undefined,
      displayFormat: typeof data.display_format === 'string' ? data.display_format : undefined,
      endpoints: Array.isArray(data.endpoints) ? data.endpoints : undefined,
      notices: Array.isArray(data?.announcements?.announcements)
        ? (data?.announcements?.announcements as any).map((it: any) => ({
            id: it.id,
            content: it.content,
            extra: it.title,
            publishDate: it.published_at,
            type: undefined,
          }))
        : undefined,
    };
  },
};
