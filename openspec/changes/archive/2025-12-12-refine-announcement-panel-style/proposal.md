# Change: Refine Announcement Panel Styling

## Why
当前 AnnouncementPanel 组件的样式与 TenantSelectCard 中其他面板（ModelUsagePanel、TokenListPanel、ApiEndpointsPanel）风格不一致。使用了 `prose` 类导致样式臃肿，导航控件布局不够精致，整体视觉效果与精简、精致的设计语言不符。

## What Changes
- 移除 `prose` 类，改用项目统一的 Tailwind 语义样式
- 重构导航控件，采用与其他面板一致的紧凑布局
- 优化公告内容区域的排版，使用 `text-xs` 保持一致性
- 将日期显示整合到导航栏，减少视觉层级
- 添加公告标题显示（如有）
- 优化 markdown 渲染后的样式覆盖

## Impact
- Affected specs: tenant-management
- Affected code: `components/biz/tenant-select-card/announcement-panel.tsx`
- 无 API 或数据层变更
