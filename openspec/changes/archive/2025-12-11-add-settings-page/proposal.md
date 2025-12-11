# Change: Add Settings Page

## Why
用户需要一个设置页面来配置扩展的全局选项。入口应放置在主界面的刷新按钮和添加账号按钮区域，保持 UI 一致性。

## What Changes
- 在主界面 FrameHeader 的按钮组中添加设置按钮（齿轮图标）
- 新增 `/settings` 路由和对应的设置页面组件
- 设置页面包含标题和返回按钮，点击返回按钮使用 `navigate(-1)` 回到之前的路由

## Impact
- Affected specs: popup-navigation (new capability)
- Affected code:
  - `entrypoints/popup/App.tsx` - 添加 settings 路由
  - `components/biz/tenant-select/index.tsx` - 添加设置按钮入口
  - `components/biz-screen/popup-settings-screen/index.tsx` - 新建设置页面组件
