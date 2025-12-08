import { apiFetch } from '@/lib/api/fetch';
import { OneAPIError, type OneAPIConfig, type OneAPIResponse } from './types';

/**
 * OneAPI 客户端 - 使用 background fetch 绕过 CORS
 */
export class OneAPIClient {
  private readonly baseURL: string;
  private readonly token: string;
  private readonly userId: string;
  private readonly timeout: number;
  private readonly enableLogging: boolean;

  constructor(config: OneAPIConfig) {
    this.baseURL = config.baseURL;
    this.token = config.token;
    this.userId = config.userId;
    this.timeout = config.timeout || 30000;
    this.enableLogging = config.enableLogging || false;
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
      console.log('[OneAPI Request]', method, fullURL);
    }

    try {
      const response = await apiFetch<OneAPIResponse<T>>(fullURL, {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          'New-Api-User': this.userId,
        },
        body: data,
        timeout: this.timeout,
      });

      if (this.enableLogging) {
        console.log('[OneAPI Response]', fullURL, response);
      }

      return this.unwrap(response);
    } catch (error: any) {
      if (this.enableLogging) {
        console.error('[OneAPI Error]', fullURL, error);
      }
      throw error;
    }
  }

  /**
   * 解包业务响应，检查 success 字段
   */
  private unwrap<T>(response: OneAPIResponse<T>): T {
    if (!response.success) {
      throw new OneAPIError(response.message || 'Request failed', undefined, response);
    }
    return response.data;
  }
}

/**
 * 创建 OneAPI 客户端
 */
export function createOneAPIClient(config: OneAPIConfig): OneAPIClient {
  return new OneAPIClient(config);
}
