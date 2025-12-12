## 1. UsageDisplay 组件增强

- [x] 1.1 为 `UsageDisplay` 添加千分位格式化功能
- [x] 1.2 添加 `tabular-nums` 确保数字等宽对齐
- [x] 1.3 验证格式化在各种数值范围下的显示效果

## 2. TenantSelectCard 信息层级优化

- [x] 2.1 将余额字号从 `text-xl` 调整为 `text-2xl`
- [x] 2.2 为今日消耗添加高亮背景样式 (`bg-accent rounded-md px-2 py-1`)
- [x] 2.3 调整历史消耗为更低视觉权重 (`text-muted-foreground`)
- [x] 2.4 统一组件内部间距为 `gap-2`

## 3. ModelUsagePanel 优化

- [x] 3.1 添加汇总行显示总消耗金额和 Token 数
- [x] 3.2 统一列表项间距
- [x] 3.3 为金额/Token 切换添加过渡动画

## 4. TokenListPanel 优化

- [x] 4.1 突出令牌名称的视觉权重
- [x] 4.2 优化已用额度的显示格式
- [x] 4.3 统一列表项间距

## 5. 整体样式统一

- [x] 5.1 审查并统一所有 Accordion Panel 的 padding
- [x] 5.2 确保深色模式下所有样式正常显示
- [x] 5.3 验证 420×580px 视口下的布局稳定性

## 6. 验证与测试

- [x] 6.1 运行 `bun run compile` 确保类型检查通过
- [x] 6.2 运行 `bun run build` 确保构建成功
- [x] 6.3 手动测试各种数据状态（空数据、大数值、长文本）
