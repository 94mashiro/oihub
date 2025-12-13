# Tasks

## Phase 1: ui-design-rules.md 重构

1. [x] 提取核心规则到文档顶部
   - 创建 "Quick Reference" 章节（~50 行）
   - 包含：组件选择、颜色系统、间距规则、表单模式
   - 验证：核心规则清晰可见

2. [x] 精简示例代码
   - 合并重复的 Good/Bad 示例
   - 删除与 coss.md 重复的组件列表
   - 保留每个模式 1-2 个典型示例
   - 验证：示例覆盖所有关键场景

3. [x] 删除冗余内容
   - 移除过长的 CSS 变量列表（引用 tailwind.css）
   - 精简 Interactive States 章节
   - 合并 Typography 和 Color 章节的重复说明
   - 验证：文档 273 行 (< 600 行) ✓

## Phase 2: storage-state-rules.md 精简

4. [x] 合并代码示例
   - 将分散的 persist() 示例合并为一个完整示例
   - 删除重复的 set() 用法说明
   - 验证：示例不重复

5. [x] 精简迁移指南
   - 保留简要迁移步骤
   - 删除详细的旧 API 对比
   - 验证：迁移指南 6 行 (< 30 行) ✓

## Phase 3: CLAUDE.md 优化

6. [x] 移除重复的 Quick Reference
   - 删除 "UI Design & Component Usage" 中的内联规则
   - 改为表格形式的文档引用
   - 验证：CLAUDE.md 无重复内容

7. [x] 统一文档引用格式
   - 所有 docs/ 引用使用一致的表格格式
   - 验证：引用格式统一

## Phase 4: 验证

8. [x] 运行 `bun run compile` 确认无类型错误
9. [x] 检查所有关键规则仍然存在
10. [x] 验证文档内部链接有效

## Summary

| 文件 | 原行数 | 新行数 | 精简比例 |
|------|--------|--------|----------|
| ui-design-rules.md | 1740 | 273 | 84% |
| storage-state-rules.md | 324 | 188 | 42% |
| CLAUDE.md | 71 | 58 | 18% |
