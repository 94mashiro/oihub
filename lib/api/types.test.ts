import { describe, expect, test } from 'bun:test';
import { APIError } from './types';

describe('APIError.isRetryable', () => {
  test('5xx status codes are retryable', () => {
    expect(new APIError('error', 500).isRetryable).toBe(true);
    expect(new APIError('error', 502).isRetryable).toBe(true);
    expect(new APIError('error', 503).isRetryable).toBe(true);
  });

  test('429 status code is retryable', () => {
    expect(new APIError('error', 429).isRetryable).toBe(true);
  });

  test('4xx status codes (except 429) are not retryable', () => {
    expect(new APIError('error', 400).isRetryable).toBe(false);
    expect(new APIError('error', 401).isRetryable).toBe(false);
    expect(new APIError('error', 403).isRetryable).toBe(false);
    expect(new APIError('error', 404).isRetryable).toBe(false);
  });

  test('undefined status is not retryable', () => {
    expect(new APIError('error').isRetryable).toBe(false);
  });
});
