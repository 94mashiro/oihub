import type { Tenant } from '@/types/tenant';
import { BalanceOrchestrator } from './balance-orchestrator';

export { BalanceOrchestrator } from './balance-orchestrator';

/**
 * Factory function to create balance orchestrator.
 */
export function createBalanceOrchestrator(tenant: Tenant) {
  return new BalanceOrchestrator(tenant);
}
