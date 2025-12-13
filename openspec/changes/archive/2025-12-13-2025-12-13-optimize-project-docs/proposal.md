# Proposal: Optimize Project Documentation

## Summary
精简和优化项目中与 OpenSpec 无关的文档（`docs/` 目录和 `CLAUDE.md`），减少冗余内容，提升可读性和维护性。

## Motivation
当前文档存在以下问题：
1. **ui-design-rules.md 过长**（1740 行）：包含大量示例代码和重复说明，AI 和开发者难以快速定位关键规则
2. **storage-state-rules.md 有冗余**（324 行）：部分内容与代码示例重复，可精简
3. **CLAUDE.md 与 docs/ 重复**：CLAUDE.md 中的 Quick Reference 与 docs/ 文档内容重叠
4. **缺乏层次结构**：长文档没有清晰的"必读规则"vs"参考示例"分层

## Goals
- 将 ui-design-rules.md 精简至 ~500 行，保留核心规则，移除冗余示例
- 将 storage-state-rules.md 精简至 ~200 行
- 优化 CLAUDE.md 中的文档引用，避免重复
- 保持所有关键规则和约束不变

## Non-Goals
- 不修改 OpenSpec 相关文档（`openspec/` 目录）
- 不修改 coss.md（仅为组件目录引用）
- 不修改 api-architecture.md（已足够精简）
- 不改变任何实际的编码规则或约束

## Approach
1. **ui-design-rules.md 重构**：
   - 提取核心规则到文档顶部（~100 行）
   - 将详细示例移至"参考示例"章节或删除重复示例
   - 合并相似的 Do's/Don'ts 示例
   - 删除与 coss.md 重复的组件列表

2. **storage-state-rules.md 精简**：
   - 合并重复的代码示例
   - 删除过于详细的迁移指南（保留简要说明）
   - 精简 Implementation Checklist

3. **CLAUDE.md 优化**：
   - 移除与 docs/ 重复的 Quick Reference 内容
   - 改为简洁的"详见 docs/xxx.md"引用

## Impact
- 减少 AI 上下文消耗，提升响应质量
- 开发者更快找到关键规则
- 降低文档维护成本

## Risks
- 精简过度可能遗漏重要信息 → 通过 review 确保关键规则保留
- 开发者习惯旧文档结构 → 保持章节标题一致性
