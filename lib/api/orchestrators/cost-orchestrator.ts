import type { Tenant } from '@/types/tenant';
import type { DomainOrchestrator, CostSources } from './types';
import type { IRawPlatformService } from '@/lib/api/services/types';
import type { PlatformAdapter, Cost } from '@/lib/api/adapters/types';
import { costStore } from '@/lib/state/cost-store';
import { CostPeriod } from '@/types/api';

export class CostOrchestrator implements DomainOrchestrator<Cost[]> {
  readonly domain = 'cost';

  constructor(
    private readonly tenant: Tenant,
    private readonly service: IRawPlatformService,
    private readonly adapter: PlatformAdapter,
    private readonly period: CostPeriod,
  ) {}

  async refresh(): Promise<Cost[]> {
    const response = await this.service.fetchCosts(this.period);
    const costSources: CostSources = { costs: response.data } as CostSources;
    const costs = this.adapter.normalizeCosts(costSources);
    await costStore.getState().setCost(this.tenant.id, this.period, costs);
    return costs;
  }
}
