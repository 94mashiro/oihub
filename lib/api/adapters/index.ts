/**
 * Platform Adapter Registry
 *
 * Provides adapter lookup by platform type.
 */

export type { Balance, Cost, Token, TokenGroup, PlatformType, PlatformAdapter, PlatformAdapterV2 } from './types';
export { newAPIAdapter, newAPIAdapterV2 } from './newapi-adapter';
export { packyCodeCodexAdapter, packyCodeCodexAdapterV2 } from './packycode-codex-adapter';
export { cubenceAdapter, cubenceAdapterV2 } from './cubence-adapter';

import type { PlatformType, PlatformAdapter, PlatformAdapterV2 } from './types';
import { newAPIAdapter, newAPIAdapterV2 } from './newapi-adapter';
import { packyCodeCodexAdapter, packyCodeCodexAdapterV2 } from './packycode-codex-adapter';
import { cubenceAdapter, cubenceAdapterV2 } from './cubence-adapter';

const adapters: Record<PlatformType, PlatformAdapter> = {
  newapi: newAPIAdapter,
  packycode_codex: packyCodeCodexAdapter,
  cubence: cubenceAdapter,
};

const adaptersV2: Record<PlatformType, PlatformAdapterV2> = {
  newapi: newAPIAdapterV2,
  packycode_codex: packyCodeCodexAdapterV2,
  cubence: cubenceAdapterV2,
};

export function getAdapter(platformType: PlatformType): PlatformAdapter {
  const adapter = adapters[platformType];
  if (!adapter) {
    throw new Error(`不支持的平台类型: ${platformType}`);
  }
  return adapter;
}

export function getAdapterV2(platformType: PlatformType): PlatformAdapterV2 {
  const adapter = adaptersV2[platformType];
  if (!adapter) {
    throw new Error(`不支持的平台类型: ${platformType}`);
  }
  return adapter;
}
