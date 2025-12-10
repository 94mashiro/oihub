import { RateLimiter } from './rate-limiter';
import type { RateLimitConfig } from '../types';

const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  qps: 5,
  cooldownMs: 30000,
};

const rateLimiters = new Map<string, RateLimiter>();

/**
 * 获取指定 baseURL 的限流器（单例）
 */
export function getRateLimiter(baseURL: string, config?: RateLimitConfig): RateLimiter {
  let limiter = rateLimiters.get(baseURL);
  if (!limiter) {
    limiter = new RateLimiter(config ?? DEFAULT_RATE_LIMIT_CONFIG);
    rateLimiters.set(baseURL, limiter);
  }
  return limiter;
}
