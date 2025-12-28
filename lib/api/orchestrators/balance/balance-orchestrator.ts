import type { Tenant } from '@/types/tenant';
import type { DomainOrchestrator } from '../types';
import type { Balance } from '@/lib/api/adapters/types';
import { balanceStore } from '@/lib/state/balance-store';
import { NewAPIRawService } from '@/lib/api/services/newapi-service';
import { CubenceRawService } from '@/lib/api/services/cubence-service';
import { PackyCodeCodexRawService } from '@/lib/api/services/packycode-codex-service';
import { newAPIAdapter, cubenceAdapter, packyCodeCodexAdapter } from '@/lib/api/adapters';

/**
 * Balance orchestrator - handles fetch-normalize-store flow.
 * Uses switch pattern for type-safe platform-specific handling.
 */
export class BalanceOrchestrator implements DomainOrchestrator<Balance> {
  readonly domain = 'balance';

  constructor(private readonly tenant: Tenant) {}

  async refresh(): Promise<Balance> {
    const balance = await this.fetchAndNormalize();
    await balanceStore.getState().setBalance(this.tenant.id, balance);
    return balance;
  }

  private async fetchAndNormalize(): Promise<Balance> {
    const platformType = this.tenant.platformType ?? 'newapi';

    switch (platformType) {
      case 'cubence': {
        const data = await new CubenceRawService(this.tenant).fetchOverview();
        return cubenceAdapter.normalizeBalance(data);
      }
      case 'newapi': {
        const data = await new NewAPIRawService(this.tenant).fetchBalance();
        return newAPIAdapter.normalizeBalance(data);
      }
      case 'packycode_codex': {
        const data = await new PackyCodeCodexRawService(this.tenant).fetchBalance();
        return packyCodeCodexAdapter.normalizeBalance(data);
      }
    }
  }
}
