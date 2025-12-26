import type { Tenant } from '@/types/tenant';
import type {
  DomainOrchestrator,
  OrchestratorResult,
  OrchestratorError,
  BalanceSources,
  BalanceWithMeta,
} from './types';
import type { IRawPlatformService } from '@/lib/api/services/types';
import type { PlatformAdapterV2 } from '@/lib/api/adapters/types';
import { balanceStore } from '@/lib/state/balance-store';
import { TransformationError } from '@/lib/errors/transformation-error';

export interface BalanceOrchestratorOptions {
  /** Whether to fetch usage data (platform-specific) */
  fetchUsage?: boolean;
  /** Whether to fetch credits data (platform-specific) */
  fetchCredits?: boolean;
}

export class BalanceOrchestrator implements DomainOrchestrator<BalanceWithMeta> {
  readonly domain = 'balance';

  constructor(
    private readonly tenant: Tenant,
    private readonly service: IRawPlatformService,
    private readonly adapter: PlatformAdapterV2,
    private readonly options: BalanceOrchestratorOptions = {},
  ) {}

  async refresh(): Promise<OrchestratorResult<BalanceWithMeta>> {
    const errors: OrchestratorError[] = [];
    const sources: string[] = [];
    const balanceSources: BalanceSources = { primary: null };

    // Fetch all sources in parallel using Promise.allSettled
    const fetchPromises: Promise<{ key: keyof BalanceSources; data: unknown }>[] = [
      this.service.fetchBalance().then((r) => ({ key: 'primary' as const, data: r.data })),
    ];

    const results = await Promise.allSettled(fetchPromises);

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { key, data } = result.value;
        balanceSources[key] = data;
        sources.push(key);
      } else {
        errors.push({
          source: 'balance',
          type: 'api',
          message: result.reason instanceof Error ? result.reason.message : 'Unknown error',
          recoverable: true,
        });
      }
    }

    // If no primary data, return failed
    if (balanceSources.primary === null) {
      return { data: null, completeness: 'failed', errors };
    }

    try {
      const balance = this.adapter.normalizeBalance(balanceSources);

      const result: BalanceWithMeta = {
        ...balance,
        _meta: {
          completeness: errors.length === 0 ? 'full' : 'partial',
          errors: errors.map((e) => e.message),
          fetchedAt: Date.now(),
          sources,
        },
      };

      await balanceStore.getState().setBalance(this.tenant.id, result);

      return {
        data: result,
        completeness: errors.length === 0 ? 'full' : 'partial',
        errors,
      };
    } catch (error) {
      if (error instanceof TransformationError) {
        errors.push({
          source: 'balance-transform',
          type: 'transform',
          message: error.message,
          recoverable: false,
        });
      }
      return { data: null, completeness: 'failed', errors };
    }
  }
}
