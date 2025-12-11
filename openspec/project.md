# Project Context

## Purpose
基于 WXT 的浏览器扩展，用 React/Tailwind 构建弹出式 UI，集中管理多租户（PackyCode、DuckCoding 等）API 令牌与额度信息，提供配额/成本可视化与调用入口。

## Tech Stack
- TypeScript + React（函数式组件、hooks）
- WXT 扩展脚手架（Chromium/Firefox）
- Zustand（vanilla）+ 持久化存储封装
- Tailwind 语义色变量 + coss 组件库（`components/ui/`）
- Bun 脚本（`bun run dev/build/compile`）

## Project Conventions

### Code Style
- 2 空格缩进，Prettier/ESLint 配置在仓库根目录
- TypeScript 无 `any`，避免默认导出（除入口）
- 文件命名：业务/工具模块用 kebab-case；React 组件文件用 PascalCase
- UI 仅用 coss 组件 + Tailwind `cn()`；颜色走语义变量（见 `assets/tailwind.css`）

### Architecture Patterns
- WXT 多入口：`entrypoints/background.ts`（service worker）、`entrypoints/content.ts`（DOM 注入）、`entrypoints/popup/`（React UI）
- `@/` 解析到仓库根，跨模块引用不使用深层相对路径
- API 访问通过 `lib/api` 层，复用 `clientManager.getClient`，端点集中于 `services/tenant-api-service.ts`
- 状态存储遵循 `docs/storage-state-rules.md`：`storage.defineItem`、Zustand hydrate/ready 守卫，不直接触碰 `browser.storage*`

### Testing Strategy
- 主要使用 `bun run compile` 做类型检查；当前无专门测试套件，可按需要补充
- 变更前后建议运行 `bun run build` 确认打包通过

### Git Workflow
- 主分支 `master`；常规 PR 流程，提交信息聚焦动机/影响（遵循仓库已有风格）
- 避免破坏性变更合入前未获批准；遵循 OpenSpec 变更提案流程

## Domain Context
- 多租户 API 管理（PackyCode、DuckCoding），需要保存 `id/name/url/userId/token` 及配额/汇率/API 信息
- 弹出式 UI 包含租户选择、令牌列表、用量/成本面板等业务组件

## Important Constraints
- 不直接在组件中硬编码 API URL/密钥；配置在服务层或环境变量
- 所有持久化访问走已封装的存储/守卫，确保 ready 状态后再读写
- 禁用未授权的第三方依赖；新增依赖需先通过 Context7 获取文档

## External Dependencies
- 外部 API：PackyCode、DuckCoding（基于 `tenant.api_info` 提供路由/描述/URL）
- 浏览器扩展运行时：Chromium/Firefox（WXT）
