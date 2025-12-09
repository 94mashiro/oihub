import { RateLimitError, type RateLimitConfig } from '../types';

/**
 * 请求限流器 - 基于任务队列的 QPS 控制和冷却期管理
 */
export class RateLimiter {
  private queue: Promise<void> = Promise.resolve();
  private cooldownUntil = 0;
  private readonly interval: number;
  private readonly cooldownMs: number;
  private taskId = 0;
  private pendingRejects = new Map<number, (error: Error) => void>();

  constructor(config: RateLimitConfig) {
    this.interval = 1000 / (config.qps ?? 2);
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
    // 立即 reject 所有等待中的任务
    const error = new RateLimitError('Rate limited - cooling down', this.cooldownUntil);
    for (const reject of this.pendingRejects.values()) {
      reject(error);
    }
    this.pendingRejects.clear();
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const id = ++this.taskId;

    if (this.isCoolingDown()) {
      throw new RateLimitError('Rate limited - cooling down', this.cooldownUntil);
    }

    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const result = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    this.pendingRejects.set(id, reject as (error: Error) => void);

    this.queue = this.queue.then(async () => {
      // 已被 cooldown reject
      if (!this.pendingRejects.has(id)) return;
      this.pendingRejects.delete(id);

      if (this.isCoolingDown()) {
        reject(new RateLimitError('Rate limited - cooling down', this.cooldownUntil));
        return;
      }

      await new Promise((r) => setTimeout(r, this.interval));

      try {
        resolve(await fn());
      } catch (error) {
        reject(error);
      }
    });

    return result;
  }
}
