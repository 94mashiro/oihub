/**
 * OneAPI 配置
 */
export interface OneAPIConfig {
  /** API 基础 URL */
  baseURL: string;
  /** 认证 token */
  token: string;
  /** 用户 ID */
  userId: string;
  /** 请求超时时间(ms)，默认 30000 */
  timeout?: number;
  /** 是否启用日志，默认 false */
  enableLogging?: boolean;
}

/**
 * OneAPI 标准业务响应格式
 */
export interface OneAPIResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * OneAPI 错误
 */
export class OneAPIError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: unknown,
  ) {
    super(message);
    this.name = 'OneAPIError';
  }
}
