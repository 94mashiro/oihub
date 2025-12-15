# Change: 添加 CC Switch 服务商配置导出功能

## Why
用户需要将 OIHub 中的令牌快速导出到 CC Switch 应用，以便在其他 AI 客户端（Claude、Codex、Gemini）中使用。通过 deeplink 跳转可以实现一键配置，提升用户体验。

## What Changes
- 在令牌列表的每个令牌项中添加「导出到 CC Switch」操作按钮
- 点击后弹出应用选择器（claude / codex / gemini）
- 选择后构建 `ccswitch://v1/import` deeplink 并跳转

## Impact
- Affected specs: `tenant-management`（令牌列表功能扩展）
- Affected code: `components/biz/tenant-select-card/token-list-panel.tsx`
