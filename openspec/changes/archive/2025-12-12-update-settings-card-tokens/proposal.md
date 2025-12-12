# Change: 统一 Settings 页面卡片设计 token

## Why
当前 popup 的 settings 页面中“卡片/区块”的视觉风格与 main page 中账号卡片不一致，造成体验割裂。需要以 main page 卡片为基准，调整 settings 中相应元素的 design token（Tailwind classes / UI 组件 token），让整体风格统一。

## What Changes
- 调整 settings 页面中卡片/区块相关的设计 token，使其在圆角、内边距、边框/阴影、交互态（hover/selected）等维度与 main page 卡片保持一致。
- 不改变信息结构、交互流程和数据逻辑；仅做视觉层面的 token 对齐。

## Impact
- Affected specs: popup-navigation（Settings Page Layout 视觉一致性补充）
- Affected code (apply stage):
  - `components/biz-screen/popup-settings-screen/index.tsx`
  - 可能涉及 `components/ui/frame.tsx` 的使用方式（仅通过 className 覆盖，不改组件默认行为）

## Open Questions
- Settings 页面中需要对齐的“卡片”范围：仅 tenant 告警配置列表项，还是包含顶部告警说明区块/整体 FramePanel？
- main page 卡片的交互态是否需要在 settings 中复用（例如每个 tenant 配置项 hover 高亮，但无选中态）？

