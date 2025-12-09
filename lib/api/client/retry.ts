import type { APIError, RetryConfig } from '../types';

/**
 * 带重试的异步函数执行器（指数退避）
 */
export async function withRetry<T>(fn: () => Promise<T>, config: RetryConfig = {}): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 1000, maxDelayMs = 10000 } = config;
  const shouldRetry = config.retryOn ?? ((e: APIError) => e.isRetryable);

  let lastError: APIError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as APIError;
      if (attempt === maxRetries || !shouldRetry(lastError)) throw lastError;
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError!;
}
