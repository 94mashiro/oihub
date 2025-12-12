# Proposal: Add Usage Display Component

## Summary
创建一个通用的用量展示组件 `UsageDisplay`，统一 popup 中所有费用和 token 消耗的展示格式，参照 TenantSelectCard 的「今日消耗」部分的内容格式。

## Motivation
当前 popup 中多处展示用量数据，但格式不统一：
- TenantSelectCard「今日消耗」：`$1.23 / 1,234 tokens`
- ModelUsagePanel：`$1.23 · 1,234 tokens`
- TokenListPanel：`已用 $1.23`

这种不一致性导致：
1. 用户体验不统一，增加认知负担
2. 代码重复，相同的格式化逻辑散落在多处
3. 维护成本高，修改格式需要改动多个文件

## Proposed Design

### 组件 API
```tsx
interface UsageDisplayProps {
  cost?: number | null;        // 原始 quota 值
  tokens?: number | null;      // token 数量
  quotaPerUnit?: number;       // 转换系数
  displayType?: string;        // 货币类型 (CNY/USD)
  separator?: '/' | '·';       // 分隔符，默认 '/'
  showTokensOnly?: boolean;    // 仅显示 tokens（用于特殊场景）
  className?: string;          // 自定义样式
}
```

### 展示格式
统一采用 TenantSelectCard 的格式：
- 完整格式：`$1.23 / 1,234 tokens`
- 仅费用：`$1.23`
- 仅 tokens：`1,234 tokens`
- 无数据：`–`

### 使用场景
1. TenantSelectCard「今日消耗」- 直接替换现有逻辑
2. ModelUsagePanel 模型用量 - 替换现有格式化代码
3. TokenListPanel 令牌用量 - 可选使用（当前仅显示费用）

## Scope
- 新增 `components/ui/usage-display.tsx` 组件
- 修改 `components/biz/tenant-select-card/index.tsx` 使用新组件
- 修改 `components/biz/tenant-select-card/model-usage-panel.tsx` 使用新组件
- 不涉及数据层或 API 变更

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| 组件过度抽象 | 保持 API 简单，仅处理展示逻辑 |
| 破坏现有样式 | 组件支持 className 自定义 |
| 性能影响 | 组件为纯展示，无状态，性能影响可忽略 |

## Design Decisions
- 组件放置于 `components/ui/` 作为通用 UI 组件
- 分隔符默认使用 `/`，与现有「今日消耗」保持一致
- 复用现有的 `quotaToPrice` 和 `formatThousands` 工具函数
