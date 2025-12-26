import type { Tenant } from '@/types/tenant';
import type {
  DomainOrchestrator,
  OrchestratorResult,
  OrchestratorError,
  TokenSources,
  TokensWithMeta,
} from './types';
import type { IRawPlatformService } from '@/lib/api/services/types';
import type { PlatformAdapter } from '@/lib/api/adapters/types';
import { tokenStore } from '@/lib/state/token-store';
import { TransformationError } from '@/lib/errors/transformation-error';

interface PaginationResult<T> {
  items: T[];
  total?: number;
}

export class TokenOrchestrator implements DomainOrchestrator<TokensWithMeta> {
  readonly domain = 'token';

  constructor(
    private readonly tenant: Tenant,
    private readonly service: IRawPlatformService,
    private readonly adapter: PlatformAdapter,
  ) {}

  async refresh(): Promise<OrchestratorResult<TokensWithMeta>> {
    const errors: OrchestratorError[] = [];
    const sources: string[] = [];
    let rawTokens: unknown[] = [];
    let rawGroups: unknown = null;

    const [tokensResult, groupsResult] = await Promise.allSettled([
      this.service.fetchTokens(),
      this.service.fetchTokenGroups(),
    ]);

    if (tokensResult.status === 'fulfilled') {
      const data = tokensResult.value.data as PaginationResult<unknown>;
      rawTokens = data.items ?? [];
      sources.push('tokens');
    } else {
      errors.push({
        source: 'tokens',
        type: 'api',
        message:
          tokensResult.reason instanceof Error ? tokensResult.reason.message : 'Unknown error',
        recoverable: true,
      });
    }

    if (groupsResult.status === 'fulfilled') {
      rawGroups = groupsResult.value.data;
      sources.push('groups');
    } else {
      errors.push({
        source: 'groups',
        type: 'api',
        message:
          groupsResult.reason instanceof Error ? groupsResult.reason.message : 'Unknown error',
        recoverable: true,
      });
    }

    if (rawTokens.length === 0 && errors.length > 0) {
      return { data: null, completeness: 'failed', errors };
    }

    try {
      const tokenSources: TokenSources = { tokens: rawTokens, groups: rawGroups };
      const tokens = this.adapter.normalizeTokens(tokenSources);
      const groups = this.adapter.normalizeTokenGroups(tokenSources);

      const result: TokensWithMeta = {
        tokens,
        groups,
        _meta: {
          completeness: errors.length === 0 ? 'full' : 'partial',
          errors: errors.map((e) => e.message),
          fetchedAt: Date.now(),
          sources,
        },
      };

      await tokenStore.getState().setTokens(this.tenant.id, tokens);
      await tokenStore.getState().setTokenGroups(this.tenant.id, groups);

      return {
        data: result,
        completeness: errors.length === 0 ? 'full' : 'partial',
        errors,
      };
    } catch (error) {
      if (error instanceof TransformationError) {
        errors.push({
          source: 'tokens-transform',
          type: 'transform',
          message: error.message,
          recoverable: false,
        });
      }
      return { data: null, completeness: 'failed', errors };
    }
  }
}
