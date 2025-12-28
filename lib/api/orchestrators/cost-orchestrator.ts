import type { Tenant } from '@/types/tenant';
import type { DomainOrchestrator } from './types';
import type { IRawPlatformService } from '@/lib/api/services/types';
import type { PlatformAdapter, Cost } from '@/lib/api/adapters/types';
import { getRawService } from '@/lib/api/services';
import { getAdapter } from '@/lib/api/adapters';
import { costStore } from '@/lib/state/cost-store';
import { CostPeriod } from '@/types/api';

export class CostOrchestrator implements DomainOrchestrator<Cost[]> {
  readonly domain = 'cost';
  private readonly service: IRawPlatformService;
  private readonly adapter: PlatformAdapter;

  constructor(
    private readonly tenant: Tenant,
    private readonly period: CostPeriod,
  ) {
    this.service = getRawService(tenant);
    this.adapter = getAdapter(tenant.platformType ?? 'newapi');
  }

  async refresh(): Promise<Cost[]> {
    const response = await this.service.fetchCosts(this.period);
    const costs = this.adapter.normalizeCosts(response.data);
    await costStore.getState().setCost(this.tenant.id, this.period, costs);
    return costs;
  }
}
