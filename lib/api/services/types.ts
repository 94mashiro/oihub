import type { Balance, Cost, Token, TokenGroup } from '@/lib/api/adapters/types';
import type { TenantInfo } from '@/types/tenant';
import type { PaginationResult, CostPeriod } from '@/types/api';

export interface IPlatformService {
  getTenantInfo(): Promise<TenantInfo>;
  getBalance(): Promise<Balance>;
  getTokens(page?: number, size?: number): Promise<PaginationResult<Token>>;
  getTokenGroups(): Promise<Record<string, TokenGroup>>;
  getCostData(period: CostPeriod): Promise<Cost[]>;
}
