/**
 * 租户配置 - 用于请求时传入的认证信息
 */
export interface TenantConfig {
  /** API 基础 URL */
  baseURL: string;
  /** 认证 token */
  token: string;
  /** 用户 ID */
  userId: string;
}

/**
 * 限流配置
 */
export interface RateLimitConfig {
  /** 每秒请求数，默认 2 */
  qps?: number;
  /** 冷却时间(ms)，默认 30000 */
  cooldownMs?: number;
}

/**
 * 重试配置
 */
export interface RetryConfig {
  /** 最大重试次数，默认 3 */
  maxRetries?: number;
  /** 基础延迟(ms)，默认 1000 */
  baseDelayMs?: number;
  /** 最大延迟(ms)，默认 10000 */
  maxDelayMs?: number;
  /** 自定义重试判断 */
  retryOn?: (error: APIError) => boolean;
}

/**
 * API 客户端配置 - 仅包含通用配置，不包含租户特定信息
 */
export interface ClientConfig {
  /** 请求超时时间(ms)，默认 30000 */
  timeout?: number;
  /** 是否启用日志，默认 false */
  enableLogging?: boolean;
  /** 错误处理回调 */
  onError?: (error: APIError) => void;
  /** 限流配置，默认启用。设为 false 禁用 */
  rateLimit?: boolean | RateLimitConfig;
  /** 重试配置，默认启用 */
  retry?: RetryConfig | false;
}

/**
 * API 标准业务响应格式
 */
export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * API 错误
 */
export class APIError extends Error {
  readonly silent: boolean = false;

  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: unknown,
  ) {
    super(message);
    this.name = 'APIError';
  }

  /** 是否可重试 (5xx 或 429) */
  get isRetryable(): boolean {
    return this.status !== undefined && (this.status >= 500 || this.status === 429);
  }
}

/**
 * 限流错误 - 静默错误，不显示 toast
 */
export class RateLimitError extends APIError {
  override readonly silent = true;

  constructor(
    message: string,
    public readonly cooldownUntil: number,
  ) {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}
