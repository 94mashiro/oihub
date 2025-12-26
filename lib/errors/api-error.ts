/** Error thrown when API call fails. */
export class APIError extends Error {
  readonly name = 'APIError';

  constructor(
    message: string,
    /** HTTP status code */
    public readonly status: number,
    /** Endpoint that failed */
    public readonly endpoint: string,
    /** Whether retry might succeed */
    public readonly recoverable: boolean,
  ) {
    super(message);
  }
}
