# Tasks

## Implementation Order

1. [x] **Update tenant-select-card UI** - 修改 `components/biz/tenant-select-card/index.tsx`，将「今日费用」和「今日用量」两行合并为单行「今日消耗」展示
   - 移除原有的两个 `<div className="flex justify-between">` 块
   - 新增单行展示，格式：`今日消耗    $1.23 / 1,234 tokens`
   - 处理数据缺失的边界情况

2. [x] **Verify build** - 运行 `bun run compile` 和 `bun run build` 确认无类型错误和构建问题

3. [ ] **Manual testing** - 在开发模式下验证各种数据状态的展示效果
   - 两者都有数据
   - 仅有费用数据
   - 仅有 token 数据
   - 两者都无数据

## Dependencies
- 无外部依赖
- 任务 2、3 依赖任务 1 完成

## Parallelization
- 任务 1 为串行
- 任务 2、3 可在任务 1 完成后并行执行
