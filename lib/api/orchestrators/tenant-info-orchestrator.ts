import type { Tenant } from '@/types/tenant';
import type {
  DomainOrchestrator,
  OrchestratorResult,
  OrchestratorError,
  TenantInfoSources,
  TenantInfoWithMeta,
} from './types';
import type { IRawPlatformService } from '@/lib/api/services/types';
import type { PlatformAdapterV2 } from '@/lib/api/adapters/types';
import { tenantInfoStore } from '@/lib/state/tenant-info-store';
import { TransformationError } from '@/lib/errors/transformation-error';

export class TenantInfoOrchestrator implements DomainOrchestrator<TenantInfoWithMeta> {
  readonly domain = 'tenant-info';

  constructor(
    private readonly tenant: Tenant,
    private readonly service: IRawPlatformService,
    private readonly adapter: PlatformAdapterV2,
  ) {}

  async refresh(): Promise<OrchestratorResult<TenantInfoWithMeta>> {
    const errors: OrchestratorError[] = [];
    const sources: string[] = [];
    let rawStatus: unknown = null;

    try {
      const response = await this.service.fetchTenantInfo();
      rawStatus = response.data;
      sources.push('status');
    } catch (error) {
      errors.push({
        source: 'status',
        type: 'api',
        message: error instanceof Error ? error.message : 'Unknown error',
        recoverable: true,
      });
      return { data: null, completeness: 'failed', errors };
    }

    try {
      const infoSources: TenantInfoSources = { status: rawStatus };
      const tenantInfo = this.adapter.normalizeTenantInfo(infoSources);

      const result: TenantInfoWithMeta = {
        ...tenantInfo,
        _meta: {
          completeness: 'full',
          errors: [],
          fetchedAt: Date.now(),
          sources,
        },
      };

      await tenantInfoStore.getState().setTenantInfo(this.tenant.id, result);

      return { data: result, completeness: 'full', errors };
    } catch (error) {
      if (error instanceof TransformationError) {
        errors.push({
          source: 'tenant-info-transform',
          type: 'transform',
          message: error.message,
          recoverable: false,
        });
      }
      return { data: null, completeness: 'failed', errors };
    }
  }
}
