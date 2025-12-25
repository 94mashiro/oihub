/**
 * Platform Adapter Registry
 *
 * Provides adapter lookup by platform type.
 */

export type { Balance, Cost, Token, TokenGroup, PlatformType, PlatformAdapter } from './types';
export { newAPIAdapter } from './newapi-adapter';

import type { PlatformType, PlatformAdapter } from './types';
import { newAPIAdapter } from './newapi-adapter';

const adapters: Record<PlatformType, PlatformAdapter> = {
  newapi: newAPIAdapter,
};

export function getAdapter(platformType: PlatformType): PlatformAdapter {
  return adapters[platformType];
}
