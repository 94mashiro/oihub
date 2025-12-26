import type { Tenant } from '@/types/tenant';
import type {
  DomainOrchestrator,
  OrchestratorResult,
  OrchestratorError,
  CostSources,
  CostsWithMeta,
} from './types';
import type { IRawPlatformService } from '@/lib/api/services/types';
import type { PlatformAdapterV2 } from '@/lib/api/adapters/types';
import { costStore } from '@/lib/state/cost-store';
import { CostPeriod } from '@/types/api';
import { TransformationError } from '@/lib/errors/transformation-error';

export class CostOrchestrator implements DomainOrchestrator<CostsWithMeta> {
  readonly domain = 'cost';

  constructor(
    private readonly tenant: Tenant,
    private readonly service: IRawPlatformService,
    private readonly adapter: PlatformAdapterV2,
    private readonly period: CostPeriod,
  ) {}

  async refresh(): Promise<OrchestratorResult<CostsWithMeta>> {
    const errors: OrchestratorError[] = [];
    const sources: string[] = [];
    let rawCosts: unknown[] = [];

    try {
      const response = await this.service.fetchCosts(this.period);
      rawCosts = response.data as unknown[];
      sources.push('costs');
    } catch (error) {
      errors.push({
        source: 'costs',
        type: 'api',
        message: error instanceof Error ? error.message : 'Unknown error',
        recoverable: true,
      });
      return { data: null, completeness: 'failed', errors };
    }

    try {
      const costSources: CostSources = { costs: rawCosts };
      const costs = this.adapter.normalizeCosts(costSources);

      const result: CostsWithMeta = {
        costs,
        _meta: {
          completeness: 'full',
          errors: [],
          fetchedAt: Date.now(),
          sources,
        },
      };

      await costStore.getState().setCost(this.tenant.id, this.period, costs);

      return { data: result, completeness: 'full', errors };
    } catch (error) {
      if (error instanceof TransformationError) {
        errors.push({
          source: 'costs-transform',
          type: 'transform',
          message: error.message,
          recoverable: false,
        });
      }
      return { data: null, completeness: 'failed', errors };
    }
  }
}
