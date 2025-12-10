import { backgroundFetch } from '../transport/background-transport';
import { getRateLimiter } from './rate-limiter-registry';
import { withRetry } from './retry';
import { defaultErrorHandler } from './error-handler';
import {
  APIError,
  RateLimitError,
  type ClientConfig,
  type TenantConfig,
  type APIResponse,
} from '../types';

/**
 * API 客户端 - 使用 background fetch 绕过 CORS
 * 全局单例，配置通过请求参数传入
 */
export class APIClient {
  private readonly timeout: number;
  private readonly enableLogging: boolean;
  private readonly onError?: (error: APIError) => void;
  private readonly retryConfig?: { maxRetries: number; baseDelayMs: number; maxDelayMs: number };
  private readonly rateLimitEnabled: boolean;
  private readonly rateLimitConfig?: { qps?: number; cooldownMs?: number };

  constructor(config: ClientConfig = {}) {
    this.timeout = config.timeout || 30000;
    this.enableLogging = config.enableLogging || false;
    this.onError = config.onError;

    // 默认启用 rate limit
    this.rateLimitEnabled = config.rateLimit !== false;
    if (this.rateLimitEnabled && typeof config.rateLimit === 'object') {
      this.rateLimitConfig = config.rateLimit;
    }

    // 默认启用重试
    if (config.retry !== false) {
      this.retryConfig = {
        maxRetries: config.retry?.maxRetries ?? 3,
        baseDelayMs: config.retry?.baseDelayMs ?? 1000,
        maxDelayMs: config.retry?.maxDelayMs ?? 10000,
      };
    }
  }

  async get<T = unknown>(url: string, config: TenantConfig): Promise<T> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T = unknown, D = unknown>(url: string, data: D, config: TenantConfig): Promise<T> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T = unknown, D = unknown>(url: string, data: D, config: TenantConfig): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  }

  async patch<T = unknown, D = unknown>(url: string, data: D, config: TenantConfig): Promise<T> {
    return this.request<T>('PATCH', url, data, config);
  }

  async delete<T = unknown>(url: string, config: TenantConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data: unknown | undefined,
    config: TenantConfig,
  ): Promise<T> {
    // 获取该 baseURL 对应的限流器
    const rateLimiter = this.rateLimitEnabled
      ? getRateLimiter(config.baseURL, this.rateLimitConfig)
      : undefined;

    const doRequest = () => {
      if (rateLimiter) {
        return rateLimiter.execute(() => this.doRequest<T>(method, url, data, config));
      }
      return this.doRequest<T>(method, url, data, config);
    };

    if (this.retryConfig) {
      return withRetry(doRequest, {
        ...this.retryConfig,
        retryOn: (error) => error.isRetryable && !(error instanceof RateLimitError),
      });
    }

    return doRequest();
  }

  private async doRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data: unknown | undefined,
    config: TenantConfig,
  ): Promise<T> {
    const fullURL = `${config.baseURL}${url}`;

    if (this.enableLogging) {
      console.log('[API Request]', method, fullURL);
    }

    try {
      const response = await backgroundFetch<APIResponse<T>>(fullURL, {
        method,
        headers: {
          Authorization: `Bearer ${config.token}`,
          'New-Api-User': config.userId,
        },
        body: data,
        timeout: this.timeout,
      });

      if (this.enableLogging) {
        console.log('[API Response]', fullURL, response);
      }

      return this.unwrap(response);
    } catch (error) {
      if (this.enableLogging) {
        console.error('[API Error]', fullURL, error);
      }

      // 检测 429 并触发冷却
      if (error instanceof APIError && error.status === 429) {
        const rateLimiter = this.rateLimitEnabled
          ? getRateLimiter(config.baseURL, this.rateLimitConfig)
          : undefined;
        if (rateLimiter) {
          rateLimiter.triggerCooldown();
          const rateLimitError = new RateLimitError(
            'Rate limited by server',
            rateLimiter.getCooldownUntil(),
          );
          this.onError?.(rateLimitError);
          throw rateLimitError;
        }
      }

      if (error instanceof APIError && this.onError) {
        this.onError(error);
      }

      throw error;
    }
  }

  private unwrap<T>(response: APIResponse<T>): T {
    if (!response.success) {
      throw new APIError(response.message || 'Request failed', undefined, response);
    }
    return response.data;
  }
}

/**
 * 全局 API 客户端单例
 */
export const apiClient = new APIClient({
  timeout: 30000,
  enableLogging: false,
  onError: defaultErrorHandler,
});
