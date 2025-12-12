# Change: Refactor Background Script into Modular Architecture

## Why
当前 `entrypoints/background.ts` 将所有逻辑（告警轮询、消息处理、CORS fetch 代理、store 订阅）混杂在单一文件中，缺乏模块化组织，难以维护和扩展。

## What Changes
- 将 background 逻辑拆分为独立模块，按职责分类
- 建立 `lib/background/` 目录结构，遵循项目现有架构模式
- 主入口 `background.ts` 仅负责模块注册和生命周期管理
- 每个模块独立管理自己的 alarms、message handlers、subscriptions

## Impact
- Affected specs: 新增 `background-architecture` capability
- Affected code: `entrypoints/background.ts`, 新增 `lib/background/` 目录
