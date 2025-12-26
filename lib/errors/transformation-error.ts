/** Error thrown when adapter transformation fails. */
export class TransformationError extends Error {
  readonly name = 'TransformationError';

  constructor(
    message: string,
    /** The raw data that failed to transform */
    public readonly rawData: unknown,
    /** Specific field that caused the error */
    public readonly field?: string,
  ) {
    super(message);
  }
}
