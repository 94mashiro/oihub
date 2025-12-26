export class AdapterTransformError extends Error {
  constructor(
    public readonly sourceShape: string,
    public readonly targetType: string,
    public readonly cause?: Error,
  ) {
    super(`Failed to transform ${sourceShape} to ${targetType}`);
    this.name = 'AdapterTransformError';
  }
}
