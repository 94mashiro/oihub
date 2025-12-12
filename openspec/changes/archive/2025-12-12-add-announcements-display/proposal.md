# Proposal: Add Announcements Display

## Summary
在 TenantSelectCard 底部以 Accordion 形式接入 TenantInfo 的 announcements 字段，展示公告内容（markdown 格式）和发布时间，支持多条公告切换，按时间从新到老排序。

## Motivation
当前 popup 主页面仅展示租户列表和用量信息，缺少公告展示功能。API 已返回 `announcements` 数组，包含：
- `content`: markdown 格式的公告正文
- `publishDate`: ISO 8601 格式的发布时间
- `id`, `type`, `extra`: 其他元数据

用户需要在 popup 中查看服务商发布的公告信息，了解服务变更、维护通知等重要内容。

## Proposed Design

### 组件结构
在 `TenantSelectCard` 的 Accordion 中新增「公告」项，复用现有 UI 模式：
- 作为 AccordionItem 展示在 API 端点下方
- 支持多条公告时的切换（上一条/下一条）
- 按 `publishDate` 降序排列（最新在前）
- 仅当有公告时显示该 AccordionItem

### Markdown 解析与 XSS 防护
- 使用 `marked` 库进行 markdown 解析
- 使用 `dompurify` 库进行 XSS 过滤，确保安全性

### 位置
在 TenantSelectCard 的 Accordion 中，位于「API 端点」下方。

## Scope
- 新增 `components/biz/tenant-select-card/announcement-panel.tsx` 组件
- 修改 `components/biz/tenant-select-card/index.tsx` 添加公告 AccordionItem
- 新增依赖：`marked`、`dompurify`
- 不涉及 API 层或数据存储变更（数据已在 TenantInfo 中）

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Markdown XSS 风险 | 使用 DOMPurify 进行严格过滤 |
| 依赖体积增加 | marked + dompurify 体积可接受 |
| 无公告时布局空白 | 无公告时不渲染 AccordionItem |

## Design Decisions
- 公告作为 TenantSelectCard 的子组件，保持 UI 一致性
- 时间格式化使用本地化格式（如 `2025/12/13 10:30`）
- 切换按钮使用 lucide-react 图标保持一致性
