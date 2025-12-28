import { backgroundFetch } from '../transport/background-transport';
import { getRateLimiter } from './rate-limiter-registry';
import { withRetry } from './retry';
import {
  APIError,
  RateLimitError,
  type APIClientConfig,
  type RequestOptions,
  type APIResponse,
} from '../types';

/**
 * API 客户端 - 使用 background fetch 绕过 CORS
 * 支持实例化配置（类似 Axios.create），每个平台可创建自己的客户端实例
 */
export class APIClient {
  private readonly baseURL: string;
  private readonly headers: Record<string, string>;
  private readonly timeout: number;
  private readonly enableLogging: boolean;
  private readonly onError?: (error: APIError) => void;
  private readonly retryConfig?: { maxRetries: number; baseDelayMs: number; maxDelayMs: number };
  private readonly rateLimitEnabled: boolean;
  private readonly rateLimitConfig?: { qps?: number; cooldownMs?: number };

  constructor(config: APIClientConfig) {
    this.baseURL = config.baseURL;
    this.headers = config.headers || {};
    this.timeout = config.timeout || 30000;
    this.enableLogging = config.enableLogging || false;
    this.onError = config.onError;

    // 默认启用 rate limit；即便关闭也保留 cooldown 配置用于 429 冷却
    const rateLimitOptions = typeof config.rateLimit === 'object' ? config.rateLimit : undefined;
    this.rateLimitEnabled = config.rateLimit !== false;
    this.rateLimitConfig = rateLimitOptions;

    // 默认启用重试
    if (config.retry !== false) {
      this.retryConfig = {
        maxRetries: config.retry?.maxRetries ?? 3,
        baseDelayMs: config.retry?.baseDelayMs ?? 1000,
        maxDelayMs: config.retry?.maxDelayMs ?? 10000,
      };
    }
  }

  async get<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', url, undefined, options);
  }

  async post<T = unknown, D = unknown>(url: string, data: D, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', url, data, options);
  }

  async put<T = unknown, D = unknown>(url: string, data: D, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', url, data, options);
  }

  async patch<T = unknown, D = unknown>(
    url: string,
    data: D,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>('PATCH', url, data, options);
  }

  async delete<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data: unknown | undefined,
    options?: RequestOptions,
  ): Promise<T> {
    // 获取该 baseURL 对应的限流器（即便关闭限流也用于 429 冷却）
    const rateLimiter = getRateLimiter(this.baseURL, this.rateLimitConfig);

    const doRequest = () => {
      if (this.rateLimitEnabled) {
        return rateLimiter.execute(() => this.doRequest<T>(method, url, data, options));
      }

      if (rateLimiter.isCoolingDown()) {
        throw new RateLimitError('Rate limited - cooling down', rateLimiter.getCooldownUntil());
      }

      return this.doRequest<T>(method, url, data, options);
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
    options?: RequestOptions,
  ): Promise<T> {
    const fullURL = `${this.baseURL}${url}`;

    // 合并实例 headers 和请求特定 headers
    const headers = {
      ...this.headers,
      ...(options?.headers || {}),
    };

    const timeout = options?.timeout || this.timeout;

    if (this.enableLogging) {
      console.log('[API Request]', method, fullURL, { headers });
    }

    try {
      const response = await backgroundFetch<APIResponse<T>>(fullURL, {
        method,
        headers,
        body: data,
        timeout,
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
        const rateLimiter = getRateLimiter(this.baseURL, this.rateLimitConfig);
        rateLimiter.triggerCooldown();
        const rateLimitError = new RateLimitError(
          'Rate limited by server',
          rateLimiter.getCooldownUntil(),
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
    if (!response.success && ![0, 200].includes(response.code || 0)) {
      throw new APIError(response.message || 'Request failed', undefined, response);
    }
    return response.data;
  }
}
