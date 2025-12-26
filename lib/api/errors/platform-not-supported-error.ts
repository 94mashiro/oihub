export class PlatformNotSupportedError extends Error {
  constructor(public readonly platformType: string) {
    super(`Platform not supported: ${platformType}`);
    this.name = 'PlatformNotSupportedError';
  }
}
