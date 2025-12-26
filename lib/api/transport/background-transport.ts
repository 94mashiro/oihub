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
  method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
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
 * Check if running in service worker (background script) context
 */
function isBackgroundContext(): boolean {
  // TS 环境未必包含 ServiceWorkerGlobalScope 的类型声明（取决于 tsconfig lib），
  // 这里用运行时检测避免类型依赖；行为保持不变。
  const SWGS = (globalThis as unknown as { ServiceWorkerGlobalScope?: unknown })
    .ServiceWorkerGlobalScope;
  return typeof SWGS !== 'undefined' && self instanceof (SWGS as any);
}

/**
 * Direct fetch for use in background context
 */
async function directFetch<T>(url: string, options?: FetchOptions): Promise<FetchResponse<T>> {
  const { method = 'GET', headers = {}, body, timeout = 30000 } = options || {};

  let filteredHeaders = headers;

  // 从 headers 中提取 Cookie 并使用 chrome.cookies API 设置
  const cookieHeader = headers.Cookie || headers.cookie;
  if (cookieHeader) {
    const parsedUrl = new URL(url);
    const cookiePairs = cookieHeader.split(';').map((pair) => pair.trim());

    for (const pair of cookiePairs) {
      const [name, value] = pair.split('=');
      if (name && value) {
        // 使用 chrome.cookies API 设置 cookie
        await browser.cookies.set({
          url: parsedUrl.origin,
          name: name.trim(),
          value: value.trim(),
          path: '/',
          sameSite: 'no_restriction',
          secure: parsedUrl.protocol === 'https:',
        });
      }
    }

    // 从 headers 中移除 Cookie,因为已经通过 cookies API 设置
    filteredHeaders = { ...headers };
    delete filteredHeaders.Cookie;
    delete filteredHeaders.cookie;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json', ...filteredHeaders },
      signal: controller.signal,
      credentials: 'include',
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return {
        success: false,
        error: (data as { message?: string })?.message || `HTTP ${response.status}`,
        status: response.status,
        data,
      };
    }

    return { success: true, data, status: response.status };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Request timeout' };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * 通过 background script 发送请求，绕过 CORS
 * 在 background 上下文中直接使用 fetch，在其他上下文中通过 message passing
 */
export async function backgroundFetch<T = unknown>(
  url: string,
  options?: FetchOptions,
): Promise<T> {
  const response: FetchResponse<T> = isBackgroundContext()
    ? await directFetch<T>(url, options)
    : await browser.runtime.sendMessage({
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
