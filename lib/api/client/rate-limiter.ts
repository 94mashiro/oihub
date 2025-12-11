import { RateLimitError, type RateLimitConfig } from '../types';

/**
 * 请求限流器 - 基于滑动窗口的 QPS 控制和冷却期管理
 */
export class RateLimiter {
  private timestamps: number[] = [];
  private cooldownUntil = 0;
  private readonly qps: number;
  private readonly windowMs = 1000;
  private readonly cooldownMs: number;

  constructor(config: RateLimitConfig) {
    this.qps = config.qps ?? 2;
    this.cooldownMs = config.cooldownMs ?? 30000;
  }

  isCoolingDown(): boolean {
    return Date.now() < this.cooldownUntil;
  }

  getCooldownUntil(): number {
    return this.cooldownUntil;
  }

  triggerCooldown(durationMs?: number): void {
    this.cooldownUntil = Date.now() + (durationMs ?? this.cooldownMs);
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isCoolingDown()) {
      throw new RateLimitError('Rate limited - cooling down', this.cooldownUntil);
    }

    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

    if (this.timestamps.length < this.qps) {
      this.timestamps.push(now);
      return fn();
    }

    const waitTime = this.windowMs - (now - this.timestamps[0]);
    await new Promise((r) => setTimeout(r, waitTime));
    return this.execute(fn);
  }
}
