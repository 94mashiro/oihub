import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { OneAPIError, type OneAPIConfig, type OneAPIResponse } from './types';

/**
 * OneAPI 客户端 - 简化版
 */
export class OneAPIClient {
  private readonly axios: AxiosInstance;

  constructor(config: OneAPIConfig) {
    const { baseURL, token, userId, timeout = 30000, enableLogging = false } = config;

    // 创建 axios 实例
    this.axios = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器：添加认证 header
    this.axios.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['New-Api-User'] = userId;

      if (enableLogging) {
        console.log('[OneAPI Request]', config.method?.toUpperCase(), config.url);
      }

      return config;
    });

    // 响应拦截器：统一处理响应和错误
    this.axios.interceptors.response.use(
      (response) => {
        if (enableLogging) {
          console.log('[OneAPI Response]', response.status, response.config.url);
        }
        return response;
      },
      (error: AxiosError) => {
        // 统一错误处理
        const status = error.response?.status;
        const data = error.response?.data;
        const message =
          (data as OneAPIResponse)?.message || error.message || 'Request failed';

        throw new OneAPIError(message, status, data);
      },
    );
  }

  /**
   * GET 请求
   */
  async get<T = unknown>(url: string): Promise<T> {
    const response = await this.axios.get<OneAPIResponse<T>>(url);
    return this.unwrap(response.data);
  }

  /**
   * POST 请求
   */
  async post<T = unknown, D = unknown>(url: string, data?: D): Promise<T> {
    const response = await this.axios.post<OneAPIResponse<T>>(url, data);
    return this.unwrap(response.data);
  }

  /**
   * PUT 请求
   */
  async put<T = unknown, D = unknown>(url: string, data?: D): Promise<T> {
    const response = await this.axios.put<OneAPIResponse<T>>(url, data);
    return this.unwrap(response.data);
  }

  /**
   * PATCH 请求
   */
  async patch<T = unknown, D = unknown>(url: string, data?: D): Promise<T> {
    const response = await this.axios.patch<OneAPIResponse<T>>(url, data);
    return this.unwrap(response.data);
  }

  /**
   * DELETE 请求
   */
  async delete<T = unknown>(url: string): Promise<T> {
    const response = await this.axios.delete<OneAPIResponse<T>>(url);
    return this.unwrap(response.data);
  }

  /**
   * 获取原始 axios 实例（用于高级场景）
   */
  getAxios(): AxiosInstance {
    return this.axios;
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
