# Change: Refactor Popup UI for Information Clarity

## Why

作为信息提供工具定位的插件，当前 popup UI 存在以下问题影响用户快速获取关键信息：

1. **信息层级不清晰**：余额作为最重要的信息，视觉权重不够突出；今日消耗与历史消耗的展示方式相同，无法快速区分
2. **设计语言不统一**：部分组件使用 `text-xs`，部分使用 `text-sm`；间距不一致（有 `gap-2`、`gap-3`、`space-y-2` 混用）
3. **信息密度过高**：TenantSelectCard 在展开状态下信息过于密集，Accordion 内容缺乏视觉分隔
4. **关键数据可读性差**：数字缺乏格式化（千分位）；金额/Token 切换时视觉反馈不明显

## What Changes

### 1. 信息层级优化
- **BREAKING**: 重新设计 TenantSelectCard 的视觉层级，余额使用更大字号和更醒目的样式
- 今日消耗使用高亮样式（如 Badge 或背景色）与历史消耗区分
- 为关键数值添加视觉强调（颜色、字重）

### 2. 设计语言统一
- 统一文字大小规范：标题 `text-sm font-semibold`，正文 `text-xs`，辅助信息 `text-[10px]`
- 统一间距规范：组件内部 `gap-2`，组件之间 `gap-3`
- 统一 Accordion 内部 Panel 的 padding 和间距

### 3. 信息展示优化
- 为 ModelUsagePanel 添加总计行，让用户一眼看到汇总数据
- 优化 TokenListPanel 的信息密度，突出令牌名称和使用量
- 为数值添加千分位格式化

### 4. 视觉反馈增强
- 金额/Token 切换时添加过渡动画
- 选中账号的视觉反馈更明显（当前仅背景色变化）
- 加载状态使用 Skeleton 保持布局稳定

## Impact

- Affected specs: `popup-navigation`, `usage-display`
- Affected code:
  - `components/biz/tenant-select-card/index.tsx`
  - `components/biz/tenant-select-card/model-usage-panel.tsx`
  - `components/biz/tenant-select-card/token-list-panel.tsx`
  - `components/ui/usage-display.tsx`
  - `components/biz/tenant-select/index.tsx`
