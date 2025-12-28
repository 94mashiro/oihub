import type { Tenant } from '@/types/tenant';
import type { PlatformType } from '@/lib/api/adapters/types';
import { NewAPIRawService } from './newapi-service';
import { CubenceRawService } from './cubence-service';
import { PackyCodeCodexRawService } from './packycode-codex-service';
import { PlatformNotSupportedError } from '../errors';

type RawService = NewAPIRawService | CubenceRawService | PackyCodeCodexRawService;
type RawServiceFactory = (tenant: Tenant) => RawService;

const rawServiceRegistry: Record<PlatformType, RawServiceFactory> = {
  newapi: (tenant) => new NewAPIRawService(tenant),
  packycode_codex: (tenant) => new PackyCodeCodexRawService(tenant),
  cubence: (tenant) => new CubenceRawService(tenant),
};

export function getRawService(tenant: Tenant): RawService {
  const platformType = tenant.platformType ?? 'newapi';
  const factory = rawServiceRegistry[platformType];
  if (!factory) {
    throw new PlatformNotSupportedError(platformType);
  }
  return factory(tenant);
}
