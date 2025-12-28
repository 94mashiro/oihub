import type { Tenant } from '@/types/tenant';
import type { DomainOrchestrator, BalanceSources } from './types';
import type { IRawPlatformService } from '@/lib/api/services/types';
import type { PlatformAdapter, Balance } from '@/lib/api/adapters/types';
import { balanceStore } from '@/lib/state/balance-store';

export interface BalanceOrchestratorOptions {
  /** Whether to fetch usage data (platform-specific) */
  fetchUsage?: boolean;
  /** Whether to fetch credits data (platform-specific) */
  fetchCredits?: boolean;
}

export class BalanceOrchestrator implements DomainOrchestrator<Balance> {
  readonly domain = 'balance';

  constructor(
    private readonly tenant: Tenant,
    private readonly service: IRawPlatformService,
    private readonly adapter: PlatformAdapter,
    private readonly options: BalanceOrchestratorOptions = {},
  ) {}

  async refresh(): Promise<Balance> {
    const response = await this.service.fetchBalance();
    const balanceSources: BalanceSources = { primary: response.data } as BalanceSources;
    const balance = this.adapter.normalizeBalance(balanceSources);
    await balanceStore.getState().setBalance(this.tenant.id, balance);
    return balance;
  }
}
