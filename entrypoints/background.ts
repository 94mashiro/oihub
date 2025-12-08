import { getSelectedTenant, tenantStore } from '@/lib/state/tenant-store';

interface FetchRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface FetchResponse {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
}

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  // Universal fetch handler - bypasses CORS
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'FETCH') {
      handleBackgroundFetch(message.payload)
        .then(sendResponse)
        .catch((error) => {
          sendResponse({
            success: false,
            error: error.message || 'Request failed',
          });
        });
      return true; // Keep message channel open for async response
    }
  });

  const unsubscribe = tenantStore.subscribe(
    getSelectedTenant,
    (tenant) => {
      console.log('Active tenant changed', tenant);
    },
    { fireImmediately: true },
  );

  return () => {
    unsubscribe();
  };
});

/**
 * Handle fetch requests in background - bypasses CORS
 */
async function handleBackgroundFetch(request: FetchRequest): Promise<FetchResponse> {
  const { url, method = 'GET', headers = {}, body, timeout = 30000 } = request;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    let data: any;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        data,
      };
    }

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout',
      };
    }
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}
