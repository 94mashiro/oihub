import type { Tenant, TenantInfo } from '@/types/tenant';
import type { DomainOrchestrator, TenantInfoSources } from './types';
import type { IRawPlatformService } from '@/lib/api/services/types';
import type { PlatformAdapter } from '@/lib/api/adapters/types';
import { tenantInfoStore } from '@/lib/state/tenant-info-store';

export class TenantInfoOrchestrator implements DomainOrchestrator<TenantInfo> {
  readonly domain = 'tenant-info';

  constructor(
    private readonly tenant: Tenant,
    private readonly service: IRawPlatformService,
    private readonly adapter: PlatformAdapter,
  ) {}

  async refresh(): Promise<TenantInfo> {
    const response = await this.service.fetchTenantInfo();
    const infoSources: TenantInfoSources = { status: response.data } as TenantInfoSources;
    const tenantInfo = this.adapter.normalizeTenantInfo(infoSources);
    await tenantInfoStore.getState().setTenantInfo(this.tenant.id, tenantInfo);
    return tenantInfo;
  }
}
