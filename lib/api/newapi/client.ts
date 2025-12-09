import { apiFetch } from '@/lib/api/fetch';
import { NewAPIError, type NewAPIConfig, type NewAPIResponse } from './types';

/**
 * NewAPI 客户端 - 使用 background fetch 绕过 CORS
 */
export class NewAPIClient {
  private readonly baseURL: string;
  private readonly token: string;
  private readonly userId: string;
  private readonly timeout: number;
  private readonly enableLogging: boolean;
  private readonly onError?: (error: NewAPIError) => void;

  constructor(config: NewAPIConfig) {
    this.baseURL = config.baseURL;
    this.token = config.token;
    this.userId = config.userId;
    this.timeout = config.timeout || 30000;
    this.enableLogging = config.enableLogging || false;
    this.onError = config.onError;
  }

  /**
   * GET 请求
   */
  async get<T = unknown>(url: string): Promise<T> {
    return this.request<T>('GET', url);
  }

  /**
   * POST 请求
   */
  async post<T = unknown, D = unknown>(url: string, data?: D): Promise<T> {
    return this.request<T>('POST', url, data);
  }

  /**
   * PUT 请求
   */
  async put<T = unknown, D = unknown>(url: string, data?: D): Promise<T> {
    return this.request<T>('PUT', url, data);
  }

  /**
   * PATCH 请求
   */
  async patch<T = unknown, D = unknown>(url: string, data?: D): Promise<T> {
    return this.request<T>('PATCH', url, data);
  }

  /**
   * DELETE 请求
   */
  async delete<T = unknown>(url: string): Promise<T> {
    return this.request<T>('DELETE', url);
  }

  /**
   * 统一请求方法
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
  ): Promise<T> {
    const fullURL = `${this.baseURL}${url}`;

    if (this.enableLogging) {
      console.log('[NewAPI Request]', method, fullURL);
    }

    try {
      const response = await apiFetch<NewAPIResponse<T>>(fullURL, {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          'New-Api-User': this.userId,
        },
        body: data,
        timeout: this.timeout,
      });

      if (this.enableLogging) {
        console.log('[NewAPI Response]', fullURL, response);
      }

      return this.unwrap(response);
    } catch (error: any) {
      if (this.enableLogging) {
        console.error('[NewAPI Error]', fullURL, error);
      }
      if (error instanceof NewAPIError && this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * 解包业务响应，检查 success 字段
   */
  private unwrap<T>(response: NewAPIResponse<T>): T {
    if (!response.success) {
      throw new NewAPIError(response.message || 'Request failed', undefined, response);
    }
    return response.data;
  }
}

/**
 * 创建 NewAPI 客户端
 */
export function createNewAPIClient(config: NewAPIConfig): NewAPIClient {
  return new NewAPIClient(config);
}
