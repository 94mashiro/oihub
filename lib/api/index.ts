// Types
export { APIError, RateLimitError } from './types';
export type {
  APIClientConfig,
  RateLimitConfig,
  RetryConfig,
  APIResponse,
  ResponseUnwrapper,
} from './types';

// Client
export { APIClient } from './client/api-client';
export { defaultErrorHandler, showApiError } from './client/error-handler';

// Services
export { getRawService } from './services';
export type { IRawPlatformService } from './services';

// Errors
export { PlatformAPIError, AdapterTransformError, PlatformNotSupportedError } from './errors';

// Transport
export { backgroundFetch } from './transport/background-transport';
