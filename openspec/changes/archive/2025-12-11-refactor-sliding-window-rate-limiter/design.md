# Design: Sliding Window Rate Limiter

## Current Implementation Analysis

```typescript
// 当前实现 - 固定间隔队列
class RateLimiter {
  private queue: Promise<void> = Promise.resolve();
  private interval: number; // 1000 / qps

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.queue = this.queue.then(async () => {
      await new Promise(r => setTimeout(r, this.interval)); // 每次都等待
      return fn();
    });
  }
}
```

问题：
- QPS=2 时，interval=500ms，每个请求都要等 500ms
- 第一个请求也要等待，即使系统完全空闲
- 请求 A、B、C 同时到达时，执行时间为 0ms、500ms、1000ms

## Proposed Implementation

```typescript
class RateLimiter {
  private timestamps: number[] = [];
  private readonly windowMs = 1000;
  private readonly qps: number;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // 1. 清理过期时间戳
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);

    // 2. 检查是否可以立即执行
    if (this.timestamps.length < this.qps) {
      this.timestamps.push(now);
      return fn();
    }

    // 3. 计算需要等待的时间
    const oldestTimestamp = this.timestamps[0];
    const waitTime = this.windowMs - (now - oldestTimestamp);
    await new Promise(r => setTimeout(r, waitTime));

    // 4. 等待后重新检查并执行
    return this.execute(fn);
  }
}
```

## Behavior Comparison

| 场景 | 当前实现 | 滑动窗口 |
|------|----------|----------|
| QPS=2, 第一个请求 | 等待 500ms | 立即执行 |
| QPS=2, 1秒内第2个请求 | 等待 500ms | 立即执行 |
| QPS=2, 1秒内第3个请求 | 等待 500ms | 等待至窗口内只有1个请求 |
| 空闲后的请求 | 等待 500ms | 立即执行 |

## Cooldown Integration

Cooldown 机制保持不变：
- `triggerCooldown()` 设置冷却截止时间
- `execute()` 在执行前检查冷却状态
- 冷却期间所有请求立即抛出 `RateLimitError`

## Concurrency Handling

JavaScript 单线程特性保证：
- `timestamps` 数组操作是原子的
- 无需额外的锁或同步机制
- 多个 `execute()` 调用会按顺序处理
