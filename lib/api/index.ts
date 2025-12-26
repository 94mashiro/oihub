// Types
export { APIError, RateLimitError } from './types';
export type {
  ClientConfig,
  TenantConfig,
  RateLimitConfig,
  RetryConfig,
  APIResponse,
} from './types';

// Client
export { APIClient, apiClient } from './client/api-client';
export { defaultErrorHandler, showApiError } from './client/error-handler';

// Services
export { PlatformAPIService } from './services';
export type { IPlatformService } from './services';

// Errors
export { PlatformAPIError, AdapterTransformError, PlatformNotSupportedError } from './errors';

// Transport
export { backgroundFetch } from './transport/background-transport';
