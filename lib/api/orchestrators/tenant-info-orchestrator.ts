import type { Tenant, TenantInfo } from '@/types/tenant';
import type { DomainOrchestrator } from './types';
import type { IRawPlatformService } from '@/lib/api/services/types';
import type { PlatformAdapter } from '@/lib/api/adapters/types';
import { getRawService } from '@/lib/api/services';
import { getAdapter } from '@/lib/api/adapters';
import { tenantInfoStore } from '@/lib/state/tenant-info-store';

export class TenantInfoOrchestrator implements DomainOrchestrator<TenantInfo> {
  readonly domain = 'tenant-info';
  private readonly service: IRawPlatformService;
  private readonly adapter: PlatformAdapter;

  constructor(private readonly tenant: Tenant) {
    this.service = getRawService(tenant);
    this.adapter = getAdapter(tenant.platformType ?? 'newapi');
  }

  async refresh(): Promise<TenantInfo> {
    const response = await this.service.fetchTenantInfo();
    const tenantInfo = this.adapter.normalizeTenantInfo(response.data);
    await tenantInfoStore.getState().setTenantInfo(this.tenant.id, tenantInfo);
    return tenantInfo;
  }
}
