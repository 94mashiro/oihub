# Change: Update CC Switch Menu Icons with Provider SVGs

## Why
当前 CC Switch 导出菜单使用通用的 lucide-react 图标（Sparkles、Code2、Bot），无法直观区分不同的 AI 提供商。使用各提供商的官方 SVG 图标可以提升用户体验和品牌识别度。

## What Changes
- 将 CC Switch 导出菜单中的图标替换为 `assets/` 目录下的提供商 SVG 图标
  - Claude: `assets/claude.svg`
  - Codex (OpenAI): `assets/openai.svg`
  - Gemini: `assets/gemini.svg`
- 图标使用 `currentColor` 填充，与整体颜色风格保持一致
- 图标尺寸与现有设计一致（`size-3.5`）

## Impact
- Affected specs: `tenant-management`
- Affected code: `components/biz/tenant-select-card/token-list-panel.tsx`
