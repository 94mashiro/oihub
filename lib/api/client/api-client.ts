import { backgroundFetch } from '../transport/background-transport';
import { getRateLimiter } from './rate-limiter-registry';
import { withRetry } from './retry';
import type { RateLimiter } from './rate-limiter';
import { APIError, RateLimitError, type ClientConfig, type APIResponse } from '../types';

/**
 * API 客户端 - 使用 background fetch 绕过 CORS
 */
export class APIClient {
  private readonly baseURL: string;
  private readonly token: string;
  private readonly userId: string;
  private readonly timeout: number;
  private readonly enableLogging: boolean;
  private readonly onError?: (error: APIError) => void;
  private readonly rateLimiter?: RateLimiter;
  private readonly retryConfig?: { maxRetries: number; baseDelayMs: number; maxDelayMs: number };

  constructor(config: ClientConfig) {
    this.baseURL = config.baseURL;
    this.token = config.token;
    this.userId = config.userId;
    this.timeout = config.timeout || 30000;
    this.enableLogging = config.enableLogging || false;
    this.onError = config.onError;

    // 默认启用 rate limit
    if (config.rateLimit !== false) {
      const rateLimitConfig = typeof config.rateLimit === 'object' ? config.rateLimit : undefined;
      this.rateLimiter = getRateLimiter(config.baseURL, rateLimitConfig);
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

  async get<T = unknown>(url: string): Promise<T> {
    return this.request<T>('GET', url);
  }

  async post<T = unknown, D = unknown>(url: string, data?: D): Promise<T> {
    return this.request<T>('POST', url, data);
  }

  async put<T = unknown, D = unknown>(url: string, data?: D): Promise<T> {
    return this.request<T>('PUT', url, data);
  }

  async patch<T = unknown, D = unknown>(url: string, data?: D): Promise<T> {
    return this.request<T>('PATCH', url, data);
  }

  async delete<T = unknown>(url: string): Promise<T> {
    return this.request<T>('DELETE', url);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: unknown,
  ): Promise<T> {
    const doRequest = () => {
      if (this.rateLimiter) {
        return this.rateLimiter.execute(() => this.doRequest<T>(method, url, data));
      }
      return this.doRequest<T>(method, url, data);
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
    data?: unknown,
  ): Promise<T> {
    const fullURL = `${this.baseURL}${url}`;

    if (this.enableLogging) {
      console.log('[API Request]', method, fullURL);
    }

    try {
      const response = await backgroundFetch<APIResponse<T>>(fullURL, {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          'New-Api-User': this.userId,
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
      if (error instanceof APIError && error.status === 429 && this.rateLimiter) {
        this.rateLimiter.triggerCooldown();
        const rateLimitError = new RateLimitError(
          'Rate limited by server',
          this.rateLimiter.getCooldownUntil(),
        );
        this.onError?.(rateLimitError);
        throw rateLimitError;
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
