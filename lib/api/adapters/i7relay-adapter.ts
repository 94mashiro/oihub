/**
 * i7Relay Platform Adapter
 *
 * Normalizes i7relay-specific API responses to common types.
 * Framework implementation - all methods return default empty values.
 */

import type { Balance, Cost, Token, TokenGroup } from './types';
import type { TenantInfo } from '@/types/tenant';
import type {
  I7RelayBalanceResponse,
  I7RelayCostsResponse,
  I7RelayTokensResponse,
  I7RelayTokenGroupsResponse,
  I7RelayTenantInfoResponse,
} from '@/lib/api/types/platforms';

// =============================================================================
// i7Relay Adapter Implementation
// =============================================================================

export const i7relayAdapter = {
  platformType: 'i7relay',

  normalizeBalance(_response: I7RelayBalanceResponse): Balance {
    return {
      remainingCredit: 0,
      consumedCredit: 0,
    };
  },

  normalizeCosts(_response: I7RelayCostsResponse): Cost[] {
    return [];
  },

  normalizeTokens(_response: I7RelayTokensResponse): Token[] {
    return [];
  },

  normalizeTokenGroups(_response: I7RelayTokenGroupsResponse): Record<string, TokenGroup> {
    return {};
  },

  normalizeTenantInfo(_response: I7RelayTenantInfoResponse): TenantInfo {
    return {
      creditUnit: 0,
      exchangeRate: 0,
      displayFormat: 'quota',
      endpoints: [],
      notices: [],
    };
  },
};
