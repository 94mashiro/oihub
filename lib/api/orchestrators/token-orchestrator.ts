import type { Tenant } from '@/types/tenant';
import type { DomainOrchestrator } from './types';
import type { IRawPlatformService } from '@/lib/api/services/types';
import type { PlatformAdapter, Token, TokenGroup } from '@/lib/api/adapters/types';
import { getRawService } from '@/lib/api/services';
import { getAdapter } from '@/lib/api/adapters';
import { tokenStore } from '@/lib/state/token-store';

export interface TokensResult {
  tokens: Token[];
  groups: Record<string, TokenGroup>;
}

export class TokenOrchestrator implements DomainOrchestrator<TokensResult> {
  readonly domain = 'token';
  private readonly service: IRawPlatformService;
  private readonly adapter: PlatformAdapter;

  constructor(private readonly tenant: Tenant) {
    this.service = getRawService(tenant);
    this.adapter = getAdapter(tenant.platformType ?? 'newapi');
  }

  async refresh(): Promise<TokensResult> {
    const [tokensResponse, groupsResponse] = await Promise.all([
      this.service.fetchTokens(),
      this.service.fetchTokenGroups(),
    ]);

    const tokens = this.adapter.normalizeTokens(tokensResponse.data);
    const groups = this.adapter.normalizeTokenGroups(groupsResponse.data);

    await tokenStore.getState().setTokens(this.tenant.id, tokens);
    await tokenStore.getState().setTokenGroups(this.tenant.id, groups);

    return { tokens, groups };
  }
}
