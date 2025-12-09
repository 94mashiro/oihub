/**
 * Universal API client that uses background script to bypass CORS
 */

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface FetchResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * Fetch API through background script to bypass CORS
 */
export async function apiFetch<T = any>(url: string, options?: FetchOptions): Promise<T> {
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
    throw new Error(response.error || 'Request failed');
  }

  return response.data as T;
}

/**
 * Create a simple HTTP client with common methods
 */
export function createFetchClient(defaultHeaders?: Record<string, string>) {
  return {
    get: <T = any>(url: string, headers?: Record<string, string>) =>
      apiFetch<T>(url, {
        method: 'GET',
        headers: { ...defaultHeaders, ...headers },
      }),

    post: <T = any>(url: string, body?: any, headers?: Record<string, string>) =>
      apiFetch<T>(url, {
        method: 'POST',
        body,
        headers: { ...defaultHeaders, ...headers },
      }),

    put: <T = any>(url: string, body?: any, headers?: Record<string, string>) =>
      apiFetch<T>(url, {
        method: 'PUT',
        body,
        headers: { ...defaultHeaders, ...headers },
      }),

    patch: <T = any>(url: string, body?: any, headers?: Record<string, string>) =>
      apiFetch<T>(url, {
        method: 'PATCH',
        body,
        headers: { ...defaultHeaders, ...headers },
      }),

    delete: <T = any>(url: string, headers?: Record<string, string>) =>
      apiFetch<T>(url, {
        method: 'DELETE',
        headers: { ...defaultHeaders, ...headers },
      }),
  };
}
