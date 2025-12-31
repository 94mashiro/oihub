import type { Tenant, TenantInfo } from '@/types/tenant';
import type { DomainOrchestrator } from '../types';
import { PlatformType } from '@/lib/api/adapters/types';
import { tenantInfoStore } from '@/lib/state/tenant-info-store';
import { NewAPIRawService } from '@/lib/api/services/newapi-service';
import { CubenceRawService } from '@/lib/api/services/cubence-service';
import { PackyCodeCodexRawService } from '@/lib/api/services/packycode-codex-service';
import {
  newAPIAdapter,
  cubenceAdapter,
  packyCodeCodexAdapter,
  i7relayAdapter,
} from '@/lib/api/adapters';

/**
 * Tenant info orchestrator - handles fetch-normalize-store flow.
 * Uses switch pattern for type-safe platform-specific handling.
 * Cubence branch includes additional announcements fetching.
 */
export class TenantInfoOrchestrator implements DomainOrchestrator<TenantInfo> {
  readonly domain = 'tenant-info';

  constructor(private readonly tenant: Tenant) {}

  async refresh(): Promise<TenantInfo> {
    const tenantInfo = await this.fetchAndNormalize();
    await tenantInfoStore.getState().setTenantInfo(this.tenant.id, tenantInfo);
    return tenantInfo;
  }

  private async fetchAndNormalize(): Promise<TenantInfo> {
    const platformType = this.tenant.platformType ?? PlatformType.NewAPI;

    switch (platformType) {
      case PlatformType.Cubence: {
        const service = new CubenceRawService(this.tenant);
        const announcementsData = await service.fetchAnnouncements();
        return cubenceAdapter.normalizeTenantInfo(announcementsData);
      }
      case PlatformType.I7Relay: {
        return i7relayAdapter.normalizeTenantInfo();
      }
      case PlatformType.NewAPI: {
        const data = await new NewAPIRawService(this.tenant).fetchTenantInfo();
        return newAPIAdapter.normalizeTenantInfo(data);
      }
      case PlatformType.PackyCodeCodex: {
        return packyCodeCodexAdapter.normalizeTenantInfo();
      }
    }
  }
}
