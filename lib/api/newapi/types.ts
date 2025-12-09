/**
 * NewAPI 配置
 */
export interface NewAPIConfig {
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
  /** 错误处理回调 */
  onError?: (error: NewAPIError) => void;
}

/**
 * NewAPI 标准业务响应格式
 */
export interface NewAPIResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * NewAPI 错误
 */
export class NewAPIError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: unknown,
  ) {
    super(message);
    this.name = 'NewAPIError';
  }
}
