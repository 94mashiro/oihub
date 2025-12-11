# Proposal: Refactor RateLimiter to Sliding Window Algorithm

## Summary
重写 `RateLimiter` 类，使用滑动窗口算法实现真正的 QPS 限制，替代当前基于固定间隔的队列实现。

## Motivation
当前实现存在问题：
1. **固定间隔不等于 QPS**：当前实现在每个请求之间强制等待 `1000/qps` ms，这意味着即使系统空闲，第一个请求也要等待
2. **无法突发**：真正的 QPS 限制应允许在窗口内快速发送多个请求，只要不超过限制
3. **队列堆积**：当前实现会导致请求排队等待，延迟累积

## Proposed Solution
使用滑动窗口算法：
1. 维护最近 1 秒内的请求时间戳数组
2. 新请求到达时，清理过期时间戳（超过 1 秒的）
3. 如果当前窗口内请求数 < qps，立即执行并记录时间戳
4. 如果 >= qps，计算最早请求过期的时间，等待后再执行

## Scope
- 修改 `lib/api/client/rate-limiter.ts`
- 保持现有接口不变（`execute`, `isCoolingDown`, `triggerCooldown` 等）
- 保持 cooldown 机制不变

## Out of Scope
- 不修改 `RateLimitConfig` 接口
- 不修改 `RateLimiterRegistry`
- 不添加新的公共 API

## Risks
- 低风险：接口保持不变，仅内部实现变更
- 需要确保并发安全（JavaScript 单线程，无需额外处理）
