import type { Tenant } from '@/types/tenant';
import type { DomainOrchestrator } from '../types';
import type { Cost } from '@/lib/api/adapters/types';
import { PlatformType } from '@/lib/api/adapters/types';
import { costStore } from '@/lib/state/cost-store';
import { CostPeriod } from '@/types/api';
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

/**
 * Cost orchestrator - handles fetch-normalize-store flow.
 * Uses switch pattern for type-safe platform-specific handling.
 */
export class CostOrchestrator implements DomainOrchestrator<Cost[]> {
  readonly domain = 'cost';

  constructor(
    private readonly tenant: Tenant,
    private readonly period: CostPeriod,
  ) {}

  async refresh(): Promise<Cost[]> {
    const costs = await this.fetchAndNormalize();
    await costStore.getState().setCost(this.tenant.id, this.period, costs);
    return costs;
  }

  private async fetchAndNormalize(): Promise<Cost[]> {
    const platformType = this.tenant.platformType ?? PlatformType.NewAPI;

    switch (platformType) {
      case PlatformType.Cubence: {
        const data = await new CubenceRawService(this.tenant).fetchCosts(this.period);
        return cubenceAdapter.normalizeCosts(data);
      }
      case PlatformType.I7Relay: {
        const costData = await new I7RelayRawService(this.tenant).fetchCosts(this.period);
        const tokenData = await new I7RelayRawService(this.tenant).fetchModelTokenUsage(
          this.period,
        );
        return i7relayAdapter.normalizeCosts(costData, tokenData);
      }
      case PlatformType.NewAPI: {
        const data = await new NewAPIRawService(this.tenant).fetchCosts(this.period);
        return newAPIAdapter.normalizeCosts(data);
      }
      case PlatformType.PackyCodeCodex: {
        const data = await new PackyCodeCodexRawService(this.tenant).fetchCosts(this.period);
        return packyCodeCodexAdapter.normalizeCosts(data);
      }
    }
  }
}
