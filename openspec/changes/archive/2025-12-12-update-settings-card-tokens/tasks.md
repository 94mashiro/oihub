## 1. Implementation
- [x] 盘点 main page 账号卡片的关键 design token（圆角/间距/颜色/交互态）并形成对齐清单。
- [x] 识别 settings 页面中对应的卡片/区块元素与当前 token 差异。
- [x] 仅通过 className / token 覆盖方式，对 settings 元素做最小化样式调整，确保与 main page 视觉一致。
- [x] 在暗色模式下检查对齐效果，避免引入对比度或阴影异常。

## 2. Validation
- [x] 手动验证：main page 账号卡片与 settings 页面 tenant 告警配置区块在视觉上保持一致（圆角/间距/边框/hover 等）。
- [x] `bun run compile` 通过（无 TypeScript 错误）。
