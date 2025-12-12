# Tasks

## Implementation Order

1. [x] **Create UsageDisplay component** - 新建 `components/ui/usage-display.tsx`
   - 实现 `UsageDisplayProps` 接口
   - 复用 `quotaToPrice` 和 `formatThousands` 工具函数
   - 处理各种数据缺失的边界情况
   - 支持 `separator` 和 `className` 自定义

2. [x] **Update TenantSelectCard** - 修改 `components/biz/tenant-select-card/index.tsx`
   - 导入 `UsageDisplay` 组件
   - 替换「余额」「历史消耗」「今日消耗」的内联格式化逻辑
   - 移除不再需要的 `quotaToPrice` 导入和局部变量

3. [x] **Update ModelUsagePanel** - 修改 `components/biz/tenant-select-card/model-usage-panel.tsx`
   - 导入 `UsageDisplay` 组件
   - 替换模型用量的格式化代码
   - 使用 `separator="·"` 保持现有分隔符风格

4. [x] **Update TokenListPanel** - 修改 `components/biz/tenant-select-card/token-list-panel.tsx`
   - 导入 `UsageDisplay` 组件
   - 替换令牌「已用」的格式化代码

5. [x] **Verify build** - 运行 `bun run compile` 和 `bun run build` 确认无类型错误和构建问题

6. [ ] **Manual testing** - 在开发模式下验证各组件的展示效果
   - TenantSelectCard 余额/历史消耗/今日消耗展示
   - ModelUsagePanel 模型用量展示
   - TokenListPanel 令牌用量展示
   - 各种数据状态（完整/部分/无数据）

## Dependencies
- 任务 2、3、4 依赖任务 1 完成
- 任务 5、6 依赖任务 1-4 完成

## Parallelization
- 任务 1 为串行
- 任务 2、3、4 可在任务 1 完成后并行执行
- 任务 5、6 可在任务 2-4 完成后并行执行
