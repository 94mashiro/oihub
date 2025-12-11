/**
 * Background Transport - 通过 background script 绕过 CORS
 */

import { APIError } from '../types';

const HTTP_STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
};

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface FetchResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * 通过 background script 发送请求，绕过 CORS
 */
export async function backgroundFetch<T = unknown>(
  url: string,
  options?: FetchOptions,
): Promise<T> {
  const response: FetchResponse<T> = await browser.runtime.sendMessage({
    type: 'FETCH',
    payload: {
      url,
      method: options?.method || 'GET',
      headers: options?.headers || {},
      body: options?.body,
      timeout: options?.timeout,
    },
  });

  if (!response.success) {
    const status = response.status;
    const message =
      response.error || (status ? HTTP_STATUS_TEXT[status] : undefined) || 'Request failed';
    throw new APIError(message, status, response.data);
  }

  return response.data as T;
}
