import type { Tenant, TenantInfo } from '@/types/tenant';
import type { Balance, Cost, Token, TokenGroup, PlatformType } from '@/lib/api/adapters/types';
import type { PaginationResult, CostPeriod } from '@/types/api';
import type { IPlatformService } from './types';
import { NewAPIService } from './newapi-service';
import { PlatformNotSupportedError } from '../errors';

type ServiceFactory = (tenant: Tenant) => IPlatformService;

const serviceRegistry: Record<PlatformType, ServiceFactory> = {
  newapi: (tenant) => new NewAPIService(tenant),
};

export class PlatformAPIService implements IPlatformService {
  readonly tenant: Tenant;
  readonly platformType: PlatformType;
  private readonly service: IPlatformService;

  constructor(tenant: Tenant) {
    this.tenant = tenant;
    this.platformType = this.resolvePlatformType(tenant.platformType);
    const factory = serviceRegistry[this.platformType];
    if (!factory) {
      throw new PlatformNotSupportedError(this.platformType);
    }
    this.service = factory(tenant);
  }

  private resolvePlatformType(type: PlatformType | undefined): PlatformType {
    if (type === undefined) {
      console.warn("platformType undefined, defaulting to 'newapi'");
      return 'newapi';
    }
    return type;
  }

  getTenantInfo(): Promise<TenantInfo> {
    return this.service.getTenantInfo();
  }

  getBalance(): Promise<Balance> {
    return this.service.getBalance();
  }

  getTokens(page = 1, size = 100): Promise<PaginationResult<Token>> {
    return this.service.getTokens(page, size);
  }

  getTokenGroups(): Promise<Record<string, TokenGroup>> {
    return this.service.getTokenGroups();
  }

  getCostData(period: CostPeriod): Promise<Cost[]> {
    return this.service.getCostData(period);
  }
}
