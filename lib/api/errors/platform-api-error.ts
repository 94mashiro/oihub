import type { PlatformType } from '@/lib/api/adapters/types';

export class PlatformAPIError extends Error {
  constructor(
    public readonly platformType: PlatformType,
    public readonly method: string,
    public readonly cause: Error,
  ) {
    super(`[${platformType}] ${method} failed: ${cause.message}`);
    this.name = 'PlatformAPIError';
  }
}
