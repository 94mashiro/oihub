import type { Tenant } from '@/types/tenant';
import type { DomainOrchestrator } from './types';
import type { IRawPlatformService } from '@/lib/api/services/types';
import type { PlatformAdapter, Balance } from '@/lib/api/adapters/types';
import { getRawService } from '@/lib/api/services';
import { getAdapter } from '@/lib/api/adapters';
import { balanceStore } from '@/lib/state/balance-store';

export class BalanceOrchestrator implements DomainOrchestrator<Balance> {
  readonly domain = 'balance';
  private readonly service: IRawPlatformService;
  private readonly adapter: PlatformAdapter;

  constructor(private readonly tenant: Tenant) {
    this.service = getRawService(tenant);
    this.adapter = getAdapter(tenant.platformType ?? 'newapi');
  }

  async refresh(): Promise<Balance> {
    const response = await this.service.fetchBalance();
    const balance = this.adapter.normalizeBalance(response.data);
    await balanceStore.getState().setBalance(this.tenant.id, balance);
    return balance;
  }
}
