## Context

当前 popup UI 作为信息提供工具，需要让用户在有限的 420×580px 空间内快速获取关键信息。经过分析，发现以下设计问题：

### 现状分析

**设计语言一致性**：
- 整体使用 coss 组件库，遵循 shadcn/vercel 设计风格 ✅
- Frame 组件提供统一的容器样式 ✅
- 颜色使用语义化 CSS 变量 ✅
- 但存在字号和间距不一致的问题 ⚠️

**信息层级问题**：
1. TenantSelectCard 中余额使用 `text-xl font-semibold`，但与周围元素对比度不够
2. "今日消耗"和"历史消耗"使用相同样式，无法快速区分重要性
3. Accordion 展开后信息密度高，缺乏视觉分组

**可读性问题**：
1. 大数字缺乏千分位分隔符
2. ModelUsagePanel 只显示 Top 5 模型，缺少汇总信息
3. 金额/Token 切换时无过渡效果

## Goals / Non-Goals

**Goals:**
- 提升关键信息（余额、今日消耗）的视觉权重
- 统一设计语言（字号、间距、颜色使用）
- 改善数据可读性（格式化、汇总）
- 增强交互反馈

**Non-Goals:**
- 不改变整体布局结构
- 不增加新功能
- 不修改数据获取逻辑

## Decisions

### Decision 1: 信息层级重构

**方案**: 采用"三层信息架构"

```
第一层（最重要）: 余额 - text-2xl font-semibold text-foreground
第二层（重要）: 今日消耗 - text-sm font-medium + 高亮背景
第三层（参考）: 历史消耗 - text-xs text-muted-foreground
```

**理由**: 用户打开插件的首要目的是查看余额，其次是今日消耗（实时性强），历史消耗为参考信息。

### Decision 2: 今日消耗高亮方案

**方案**: 使用 `bg-accent` 背景 + `rounded-md` + `px-2 py-1` 包裹今日消耗数值

**备选方案**:
- Badge 组件：过于强调，与其他 Badge 混淆
- 颜色变化：可能与状态颜色冲突
- 下划线：视觉效果弱

**理由**: 背景色方案既能突出又不过于抢眼，符合 shadcn 的"subtle"设计原则。

### Decision 3: 数值格式化

**方案**: 在 `UsageDisplay` 组件中添加千分位格式化

```typescript
// 使用 Intl.NumberFormat
const formatNumber = (n: number) =>
  new Intl.NumberFormat('zh-CN').format(n);
```

**理由**: 原生 API，无需额外依赖，支持国际化。

### Decision 4: ModelUsagePanel 汇总行

**方案**: 在模型列表上方添加汇总行，显示总消耗金额和 Token 数

```tsx
<div className="flex justify-between text-xs font-medium border-b pb-2 mb-2">
  <span>总计</span>
  <UsageDisplay cost={totalCost} tokens={totalTokens} />
</div>
```

**理由**: 用户需要快速了解整体消耗，而不仅仅是 Top 5 模型的分布。

### Decision 5: 统一间距规范

**方案**:
- 组件内部元素间距: `gap-2` (8px)
- 组件之间间距: `gap-3` (12px)
- 区块之间间距: `gap-4` (16px)

**理由**: 遵循 ui-design-rules.md 中的间距规范，保持一致性。

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 字号增大可能导致内容溢出 | 使用 `truncate` 和 `min-w-0` 确保文本截断 |
| 高亮样式可能在深色模式下不明显 | 使用语义化颜色变量，自动适配深色模式 |
| 格式化可能影响数值对齐 | 使用 `tabular-nums` 确保等宽数字 |

## Migration Plan

1. 先修改 `UsageDisplay` 组件添加格式化功能
2. 更新 `TenantSelectCard` 的信息层级样式
3. 更新 `ModelUsagePanel` 添加汇总行
4. 统一各组件的间距
5. 测试深色模式和边界情况

## Open Questions

1. 是否需要为余额添加趋势指示（如与昨日对比）？
2. 今日消耗的高亮是否需要根据阈值变色（如超过设定值变红）？
