import type { Tenant } from '@/types/tenant';
import { PlatformType } from '@/lib/api/adapters/types';
import { NewAPIRawService } from './newapi-service';
import { CubenceRawService } from './cubence-service';
import { PackyCodeCodexRawService } from './packycode-codex-service';
import { I7RelayRawService } from './i7relay-service';
import { PlatformNotSupportedError } from '../errors';

type RawService =
  | NewAPIRawService
  | CubenceRawService
  | PackyCodeCodexRawService
  | I7RelayRawService;
type RawServiceFactory = (tenant: Tenant) => RawService;

const rawServiceRegistry: Record<PlatformType, RawServiceFactory> = {
  [PlatformType.NewAPI]: (tenant) => new NewAPIRawService(tenant),
  [PlatformType.PackyCodeCodex]: (tenant) => new PackyCodeCodexRawService(tenant),
  [PlatformType.Cubence]: (tenant) => new CubenceRawService(tenant),
  [PlatformType.I7Relay]: (tenant) => new I7RelayRawService(tenant),
};

export function getRawService(tenant: Tenant): RawService {
  const platformType = tenant.platformType ?? PlatformType.NewAPI;
  const factory = rawServiceRegistry[platformType];
  if (!factory) {
    throw new PlatformNotSupportedError(platformType);
  }
  return factory(tenant);
}
