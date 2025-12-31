import type { Tenant } from '@/types/tenant';
import type { DomainOrchestrator } from '../types';
import type { Balance } from '@/lib/api/adapters/types';
import { PlatformType } from '@/lib/api/adapters/types';
import { balanceStore } from '@/lib/state/balance-store';
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
    const platformType = this.tenant.platformType ?? PlatformType.NewAPI;

    switch (platformType) {
      case PlatformType.Cubence: {
        const data = await new CubenceRawService(this.tenant).fetchOverview();
        return cubenceAdapter.normalizeBalance(data);
      }
      case PlatformType.I7Relay: {
        const walletData = await new I7RelayRawService(this.tenant).fetchWallet();
        const summaryData = await new I7RelayRawService(this.tenant).fetchSummary();
        return i7relayAdapter.normalizeBalance(walletData, summaryData);
      }
      case PlatformType.NewAPI: {
        const data = await new NewAPIRawService(this.tenant).fetchBalance();
        return newAPIAdapter.normalizeBalance(data);
      }
      case PlatformType.PackyCodeCodex: {
        const data = await new PackyCodeCodexRawService(this.tenant).fetchUserInfo();
        return packyCodeCodexAdapter.normalizeBalance(data);
      }
    }
  }
}
