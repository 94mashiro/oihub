import { messageRouter, type BackgroundModule } from '@/lib/background';

interface FetchRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

interface FetchResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  status?: number;
}

async function handleBackgroundFetch(request: FetchRequest): Promise<FetchResponse> {
  const { url, method = 'GET', headers = {}, body, timeout = 30000 } = request;

  try {
    let requestHeaders = headers;

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
      const filteredHeaders = { ...headers };
      delete filteredHeaders.Cookie;
      delete filteredHeaders.cookie;
      requestHeaders = filteredHeaders;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const fetchOptions: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json', ...requestHeaders },
      signal: controller.signal,
      credentials: 'include',
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    let data: unknown;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return {
        success: false,
        error:
          (data as { message?: string })?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        data,
      };
    }

    return { success: true, data, status: response.status };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Request timeout' };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

export const fetchProxyModule: BackgroundModule = {
  name: 'fetch-proxy',
  init() {
    messageRouter.register('FETCH', async (payload) => {
      return handleBackgroundFetch(payload as FetchRequest);
    });
  },
};
