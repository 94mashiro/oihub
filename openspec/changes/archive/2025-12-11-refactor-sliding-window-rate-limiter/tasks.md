# Tasks

## Implementation

- [x] 重写 `RateLimiter` 类，使用滑动窗口算法
  - 用 `timestamps: number[]` 替代 `queue: Promise<void>`
  - 实现 `cleanExpiredTimestamps()` 清理过期记录
  - 修改 `execute()` 方法实现滑动窗口逻辑
  - 保持 cooldown 机制不变

## Validation

- [x] 运行 `bun run compile` 确保类型检查通过
- [x] 运行 `bun run build` 确保构建成功
