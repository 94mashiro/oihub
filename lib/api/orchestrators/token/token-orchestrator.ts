import type { Tenant } from '@/types/tenant';
import type { DomainOrchestrator } from '../types';
import type { Token, TokenGroup } from '@/lib/api/adapters/types';
import { tokenStore } from '@/lib/state/token-store';
import { NewAPIRawService } from '@/lib/api/services/newapi-service';
import { CubenceRawService } from '@/lib/api/services/cubence-service';
import { PackyCodeCodexRawService } from '@/lib/api/services/packycode-codex-service';
import { I7RelayRawService } from '@/lib/api/services/i7relay-service';
import {
  newAPIAdapter,
  cubenceAdapter,
  packyCodeCodexAdapter,
  i7relayAdapter,
} from '@/lib/api/adapters';

/** Result type for token orchestrator */
export interface TokensResult {
  tokens: Token[];
  groups: Record<string, TokenGroup>;
}

/**
 * Token orchestrator - handles fetch-normalize-store flow.
 * Uses switch pattern for type-safe platform-specific handling.
 */
export class TokenOrchestrator implements DomainOrchestrator<TokensResult> {
  readonly domain = 'token';

  constructor(private readonly tenant: Tenant) {}

  async refresh(): Promise<TokensResult> {
    const result = await this.fetchAndNormalize();
    await tokenStore.getState().setTokens(this.tenant.id, result.tokens);
    await tokenStore.getState().setTokenGroups(this.tenant.id, result.groups);
    return result;
  }

  private async fetchAndNormalize(): Promise<TokensResult> {
    const platformType = this.tenant.platformType ?? 'newapi';

    switch (platformType) {
      case 'cubence': {
        const service = new CubenceRawService(this.tenant);
        const data = await service.fetchTokens();
        return {
          tokens: cubenceAdapter.normalizeTokens(data),
          groups: cubenceAdapter.normalizeTokenGroups(data),
        };
      }
      case 'newapi': {
        const service = new NewAPIRawService(this.tenant);
        const [tokensData, groupsData] = await Promise.all([
          service.fetchTokens(),
          service.fetchTokenGroups(),
        ]);
        return {
          tokens: newAPIAdapter.normalizeTokens(tokensData),
          groups: newAPIAdapter.normalizeTokenGroups(groupsData),
        };
      }
      case 'packycode_codex': {
        const service = new PackyCodeCodexRawService(this.tenant);
        const [tokensData, groupsData] = await Promise.all([
          service.fetchTokens(),
          service.fetchTokenGroups(),
        ]);
        return {
          tokens: packyCodeCodexAdapter.normalizeTokens(tokensData),
          groups: packyCodeCodexAdapter.normalizeTokenGroups(groupsData),
        };
      }
      case 'i7relay': {
        const service = new I7RelayRawService(this.tenant);
        const [tokensData, groupsData] = await Promise.all([
          service.fetchTokens(),
          service.fetchTokenGroups(),
        ]);
        return {
          tokens: i7relayAdapter.normalizeTokens(tokensData),
          groups: i7relayAdapter.normalizeTokenGroups(groupsData),
        };
      }
    }
  }
}
