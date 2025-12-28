import type { Tenant } from '@/types/tenant';
import { TokenOrchestrator } from './token-orchestrator';

export { TokenOrchestrator, type TokensResult } from './token-orchestrator';

/**
 * Factory function to create token orchestrator.
 */
export function createTokenOrchestrator(tenant: Tenant) {
  return new TokenOrchestrator(tenant);
}
