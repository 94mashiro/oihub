# Research: 平台类型字段

**Feature**: 001-platform-type
**Date**: 2025-12-26

## Research Tasks

### 1. Adapter Pattern Best Practices

**Decision**: 使用现有的 `getAdapter(platformType)` 函数从注册表获取适配器

**Rationale**:
- 项目已有 `lib/api/adapters/index.ts` 实现了适配器注册表模式
- `PlatformAdapter` 接口已定义，包含 `normalizeBalance`, `normalizeCosts`, `normalizeTokens` 等方法
- `TenantAPIService` 已支持通过构造函数参数接收 `platformType`

**Alternatives considered**:
- 动态导入适配器：增加复杂性，当前规模不需要
- 适配器工厂类：过度设计，简单的函数注册表足够

### 2. 默认值处理策略

**Decision**: 在数据访问层统一处理默认值，使用 `tenant.platformType ?? 'newapi'`

**Rationale**:
- 向后兼容：旧数据没有 platformType 字段时自动使用默认值
- 单一职责：默认值逻辑集中在 `TenantAPIService` 构造函数
- 类型安全：TypeScript 的 nullish coalescing 操作符确保类型正确

**Alternatives considered**:
- 在 store hydrate 时补充默认值：需要数据迁移逻辑，增加复杂性
- 在 UI 层处理：分散逻辑，容易遗漏

### 3. 错误处理模式

**Decision**: 在 `getAdapter` 函数中检查适配器是否存在，不存在时抛出明确错误

**Rationale**:
- 符合 spec 要求：阻止操作并显示用户可见的错误提示
- 快速失败：在数据获取前就发现配置错误
- 可测试：错误类型明确，便于单元测试

**Alternatives considered**:
- 返回 null 让调用方处理：增加调用方复杂性
- 静默回退到默认适配器：可能掩盖配置错误

### 4. UI 组件选择

**Decision**: 使用 coss Select 组件实现平台类型下拉选择器

**Rationale**:
- 符合 Constitution 要求：使用 `components/ui/` 中的 coss 组件
- 一致性：与项目其他下拉选择器保持一致
- 可访问性：coss 组件已实现 ARIA 标签和键盘导航

**Alternatives considered**:
- 自定义下拉组件：违反 Constitution，增加维护成本
- Radio buttons：当选项增多时不够灵活

### 5. UI 样式适配策略

**Decision**: 使用 className 覆盖确保组件在当前布局环境中样式合适

**Rationale**:
- 灵活性：className 覆盖允许针对不同布局环境进行精细调整
- 一致性：使用 Tailwind CSS 的 `cn()` 工具函数合并样式
- 可维护性：样式调整集中在组件使用处，便于追踪

**Implementation approach**:
- 检查现有表单组件的尺寸和间距
- 使用 `w-full` 或具体宽度类确保选择器与其他表单元素对齐
- 必要时调整 padding/margin 以匹配布局

**Alternatives considered**:
- 全局样式覆盖：影响范围过大，可能产生副作用
- 创建新的样式变体：增加组件复杂性，当前场景不需要

## Summary

所有技术决策都基于现有代码库模式，无需引入新依赖或架构变更。主要工作是：
1. 确保 `Tenant.platformType` 字段被正确持久化
2. 在 `TenantAPIService` 中使用 `tenant.platformType` 选择适配器
3. 在 UI 中添加平台类型选择器，使用 className 覆盖确保样式合适
4. 添加适配器不存在时的错误处理
