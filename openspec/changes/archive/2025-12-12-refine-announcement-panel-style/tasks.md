# Tasks

## Implementation Order

1. [x] **Refactor AnnouncementPanel layout** - 重构 `announcement-panel.tsx` 组件结构
   - 移除 `prose` 类，使用项目统一样式
   - 重构为顶部导航栏 + 内容区的两层结构
   - 导航栏包含：日期、分页指示器、切换按钮

2. [x] **Style markdown content** - 优化 markdown 渲染样式
   - 为 markdown 内容添加精简的样式覆盖
   - 使用 `text-xs` 保持与其他面板一致
   - 链接使用 `text-foreground underline` 样式

3. [x] **Verify build** - 运行 `bun run build` 确认无错误

## Dependencies
- 任务 2 依赖任务 1 完成
- 任务 3 依赖任务 2 完成
