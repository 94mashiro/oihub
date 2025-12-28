import type { Tenant } from '@/types/tenant';
import type { DomainOrchestrator, TokenSources } from './types';
import type { IRawPlatformService } from '@/lib/api/services/types';
import type { PlatformAdapter, Token, TokenGroup } from '@/lib/api/adapters/types';
import { tokenStore } from '@/lib/state/token-store';

interface PaginationResult<T> {
  items: T[];
  total?: number;
}

export interface TokensResult {
  tokens: Token[];
  groups: Record<string, TokenGroup>;
}

export class TokenOrchestrator implements DomainOrchestrator<TokensResult> {
  readonly domain = 'token';

  constructor(
    private readonly tenant: Tenant,
    private readonly service: IRawPlatformService,
    private readonly adapter: PlatformAdapter,
  ) {}

  async refresh(): Promise<TokensResult> {
    const [tokensResponse, groupsResponse] = await Promise.all([
      this.service.fetchTokens(),
      this.service.fetchTokenGroups(),
    ]);

    const rawTokens = (tokensResponse.data as PaginationResult<unknown>).items ?? [];
    const rawGroups = groupsResponse.data;

    const tokenSources: TokenSources = {
      tokens: rawTokens,
      groups: rawGroups,
    } as TokenSources;
    const tokens = this.adapter.normalizeTokens(tokenSources);
    const groups = this.adapter.normalizeTokenGroups(tokenSources);

    await tokenStore.getState().setTokens(this.tenant.id, tokens);
    await tokenStore.getState().setTokenGroups(this.tenant.id, groups);

    return { tokens, groups };
  }
}
