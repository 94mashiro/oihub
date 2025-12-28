import type { Tenant } from '@/types/tenant';
import { CostOrchestrator } from './cost-orchestrator';
import { CostPeriod } from '@/types/api';

export { CostOrchestrator } from './cost-orchestrator';

/**
 * Factory function to create cost orchestrator.
 */
export function createCostOrchestrator(tenant: Tenant, period: CostPeriod) {
  return new CostOrchestrator(tenant, period);
}
