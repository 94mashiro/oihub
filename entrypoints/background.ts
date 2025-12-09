import { getSelectedTenant, tenantStore } from '@/lib/state/tenant-store';

interface FetchRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  cache?: { ttl?: number } | false;
}

// Simple in-memory cache for GET requests
const fetchCache = new Map<string, { data: FetchResponse; expiry: number }>();
const DEFAULT_CACHE_TTL = 30000; // 30 seconds

/** Simple hash function for cache keys */
function hashKey(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
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
  const { url, method = 'GET', headers = {}, body, timeout = 30000, cache } = request;

  // Check cache for GET requests (key includes user ID for user-specific data)
  const useCache = cache !== false && method === 'GET';
  const cacheKey = hashKey(`${url}|${headers['New-Api-User'] ?? ''}`);
  if (useCache) {
    const cached = fetchCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
  }

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

    const result: FetchResponse = {
      success: true,
      data,
      status: response.status,
    };

    // Cache successful GET responses
    if (useCache) {
      const ttl = (cache && typeof cache === 'object' ? cache.ttl : undefined) ?? DEFAULT_CACHE_TTL;
      fetchCache.set(cacheKey, { data: result, expiry: Date.now() + ttl });
    }

    return result;
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
