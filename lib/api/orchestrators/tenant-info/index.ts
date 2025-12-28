import type { Tenant } from '@/types/tenant';
import { TenantInfoOrchestrator } from './tenant-info-orchestrator';

export { TenantInfoOrchestrator } from './tenant-info-orchestrator';

/**
 * Factory function to create tenant info orchestrator.
 */
export function createTenantInfoOrchestrator(tenant: Tenant) {
  return new TenantInfoOrchestrator(tenant);
}
