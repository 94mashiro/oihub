/**
 * Cubence Platform Adapter
 *
 * Normalizes Cubence-specific API responses to common types.
 */

import type { Balance, Cost, Token, TokenGroup, PlatformAdapter } from './types';
import type { TenantInfo } from '@/types/tenant';

// =============================================================================
// Raw Cubence Types (platform-specific)
// =============================================================================

/**
 * Cubence balance response structure
 * TODO: Update these types based on actual Cubence API documentation
 */
interface CubenceTenantBalance {
  // Placeholder structure - adjust based on actual API
  available_credit?: number;
  total_credit?: number;
  used_credit?: number;
}

/**
 * Cubence cost record structure
 * TODO: Update based on actual Cubence API
 */
interface CubenceCostData {
  model?: string;
  cost?: number;
  tokens?: number;
}

/**
 * Cubence token/API key structure
 * TODO: Update based on actual Cubence API
 */
interface CubenceToken {
  key?: string;
  name?: string;
  last_used?: number;
  usage?: number;
  category?: string;
}

/**
 * Cubence token group metadata
 * TODO: Update based on actual Cubence API
 */
interface CubenceTokenGroup {
  description?: string;
  rate?: number;
}

// =============================================================================
// Cubence Adapter Implementation
// =============================================================================

export const cubenceAdapter: PlatformAdapter = {
  platformType: 'cubence',

  normalizeBalance(raw: unknown): Balance {
    const data = raw as CubenceTenantBalance;

    // Default implementation - adjust based on actual API structure
    return {
      remainingCredit: data.available_credit ?? data.total_credit ?? 0,
      consumedCredit: data.used_credit ?? 0,
    };
  },

  normalizeCosts(raw: unknown[]): Cost[] {
    return (raw as CubenceCostData[]).map((item) => ({
      modelId: item.model ?? 'unknown',
      creditCost: item.cost ?? 0,
      tokenUsage: item.tokens ?? 0,
    }));
  },

  normalizeTokens(raw: unknown[]): Token[] {
    return (raw as CubenceToken[]).map((item) => ({
      secretKey: item.key ?? '',
      label: item.name ?? 'Unnamed Token',
      lastUsedAt: item.last_used ?? 0,
      creditConsumed: item.usage ?? 0,
      group: item.category ?? 'default',
    }));
  },

  normalizeTokenGroups(raw: unknown): Record<string, TokenGroup> {
    const data = raw as Record<string, CubenceTokenGroup>;
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

  normalizeTenantInfo(raw: unknown): TenantInfo {
    if (!raw || typeof raw !== 'object') {
      return {};
    }

    const data = raw as Record<string, unknown>;

    // Default implementation - adjust based on actual Cubence API
    return {
      creditUnit: typeof data.credit_unit === 'number' ? data.credit_unit : undefined,
      exchangeRate: typeof data.exchange_rate === 'number' ? data.exchange_rate : undefined,
      displayFormat: typeof data.display_format === 'string' ? data.display_format : undefined,
      endpoints: Array.isArray(data.endpoints) ? data.endpoints : undefined,
      notices: Array.isArray(data.announcements)
        ? (data.announcements as any).map((it: any) => ({
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
