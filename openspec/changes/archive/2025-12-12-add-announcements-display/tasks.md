# Tasks

## Implementation Order

1. [x] **Add dependencies** - 运行 `bun add marked dompurify` 和 `bun add -d @types/dompurify`

2. [x] **Create AnnouncementPanel component** - 新建 `components/biz/tenant-select-card/announcement-panel.tsx`
   - 接收 `announcements` 数组作为 props
   - 实现按 `publishDate` 降序排序
   - 实现公告切换状态管理（当前索引）
   - 使用 marked + dompurify 安全渲染 markdown 内容
   - 格式化并展示发布时间

3. [x] **Integrate into TenantSelectCard** - 修改 `components/biz/tenant-select-card/index.tsx`
   - 导入 AnnouncementPanel 组件
   - 在 Accordion 中添加「公告」AccordionItem
   - 条件渲染（仅当有公告时显示）

4. [x] **Verify build** - 运行 `bun run build` 确认无错误

5. [ ] **Manual testing** - 在开发模式下验证功能
   - 无公告时不显示 AccordionItem
   - 单条公告正常展示
   - 多条公告切换功能
   - Markdown 渲染效果
   - 时间格式化显示

## Dependencies
- 任务 2 依赖任务 1 完成
- 任务 3 依赖任务 2 完成
- 任务 4、5 依赖任务 3 完成

## Parallelization
- 任务 1、2、3 为串行
- 任务 4、5 可在任务 3 完成后并行执行
