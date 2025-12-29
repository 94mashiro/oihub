# Research: i7Relay Platform Adapter/Service Framework

**Feature**: 001-i7relay-adapter
**Date**: 2025-12-29

## Research Summary

本功能为框架代码生成，无需外部研究。所有技术决策基于现有代码库模式。

## Decision 1: 响应类型结构

**Decision**: 使用占位符类型定义，结构与 NewAPI 类似

**Rationale**:
- i7Relay 平台 API 结构尚未确定
- 框架代码只需类型签名，不需要具体字段
- 后续实现时根据实际 API 文档更新类型

**Alternatives considered**:
- 完全空类型 → 无法通过类型检查
- 复制 NewAPI 类型 → 可能与实际 API 不符，误导开发者

## Decision 2: Service 方法实现

**Decision**: 所有 fetch 方法抛出 NotImplementedError

**Rationale**:
- 明确标识未实现状态
- 防止意外调用返回错误数据
- 符合 spec 中 Edge Cases 的要求

**Alternatives considered**:
- 返回空数据 → 可能导致静默失败
- 返回 mock 数据 → 可能被误认为真实数据

## Decision 3: Adapter 方法实现

**Decision**: 返回符合类型的默认空值结构

**Rationale**:
- Adapter 需要返回有效的标准化类型
- 空数组/默认值比抛出异常更安全
- 符合 spec 中 Edge Cases 的要求

**Alternatives considered**:
- 抛出异常 → 与 Service 行为重复，且 Adapter 应处理空数据

## Decision 4: Orchestrator 集成方式

**Decision**: 在 switch 语句中添加 i7relay case，调用对应 service/adapter

**Rationale**:
- 遵循现有 orchestrator 模式
- 保持代码一致性
- 最小改动原则

**Alternatives considered**:
- 使用工厂模式自动分发 → 过度设计，现有 switch 模式足够

## No NEEDS CLARIFICATION Items

所有技术决策已基于现有代码库模式确定，无需额外澄清。
