# Feature Specification: i7Relay Platform Adapter/Service Framework

**Feature Branch**: `001-i7relay-adapter`
**Created**: 2025-12-29
**Status**: Draft
**Input**: User description: "引入新的平台类型 i7relay,所以需要生成对应平台的 adapter/service 的框架代码,可以不实现内部细节"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Adds i7Relay Tenant (Priority: P1)

开发者需要为 i7Relay 平台创建租户配置，系统应能识别该平台类型并加载对应的 adapter/service 框架代码，即使内部实现尚未完成。

**Why this priority**: 这是平台集成的基础，没有框架代码就无法进行后续的 API 对接开发。

**Independent Test**: 可以通过创建一个 i7Relay 类型的租户，验证系统能正确识别平台类型并实例化对应的 service，即使返回的是占位数据。

**Acceptance Scenarios**:

1. **Given** 系统已加载 i7relay adapter/service 框架代码, **When** 开发者创建 platformType 为 'i7relay' 的租户, **Then** 系统能成功实例化 I7RelayRawService
2. **Given** i7relay service 已实例化, **When** 调用任意 fetch 方法, **Then** 方法存在且可调用（可返回占位数据或抛出 NotImplemented 错误）

---

### User Story 2 - System Loads i7Relay Adapter (Priority: P2)

系统在处理 i7Relay 平台数据时，能通过 adapter 进行数据标准化转换，即使当前返回的是占位数据结构。

**Why this priority**: Adapter 是数据标准化的关键，确保不同平台的数据能统一处理。

**Independent Test**: 可以通过调用 i7relay adapter 的 normalize 方法，验证方法签名正确且能返回符合标准类型的数据结构。

**Acceptance Scenarios**:

1. **Given** i7relay adapter 已导出, **When** 调用 normalizeBalance 方法, **Then** 返回符合 Balance 类型的数据结构
2. **Given** i7relay adapter 已导出, **When** 调用 normalizeCosts 方法, **Then** 返回符合 Cost[] 类型的数据结构

---

### User Story 3 - Orchestrators Support i7Relay (Priority: P3)

各领域 orchestrator（balance、cost、token、tenant-info）能识别 i7relay 平台类型并调用对应的 service/adapter。

**Why this priority**: Orchestrator 是业务流程的协调者，需要支持新平台才能完成完整的数据流。

**Independent Test**: 可以通过创建 i7relay 租户并调用 orchestrator 的 refresh 方法，验证不会抛出 PlatformNotSupportedError。

**Acceptance Scenarios**:

1. **Given** i7relay 租户已配置, **When** BalanceOrchestrator 执行 refresh, **Then** 不抛出 PlatformNotSupportedError
2. **Given** i7relay 租户已配置, **When** CostOrchestrator 执行 refresh, **Then** 不抛出 PlatformNotSupportedError

---

### Edge Cases

- 当 i7relay service 方法未实现时，应抛出明确的 NotImplementedError 而非静默失败
- 当 i7relay adapter 收到空数据时，应返回空数组或默认值而非抛出异常
- 当 raw-service-factory 收到 'i7relay' 类型时，应能正确实例化 service

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 在 `lib/api/types/platforms/` 目录下创建 `i7relay-response-types.ts` 文件，定义平台响应类型占位符
- **FR-002**: 系统 MUST 在 `lib/api/adapters/` 目录下创建 `i7relay-adapter.ts` 文件，导出包含所有标准化方法的 adapter 对象
- **FR-003**: 系统 MUST 在 `lib/api/services/` 目录下创建 `i7relay-service.ts` 文件，实现 RawService 接口的框架代码
- **FR-004**: 系统 MUST 更新 `lib/api/types/platforms/index.ts` 导出 i7relay 响应类型
- **FR-005**: 系统 MUST 更新 `lib/api/adapters/index.ts` 导出 i7relay adapter
- **FR-006**: 系统 MUST 更新 `lib/api/services/raw-service-factory.ts` 注册 i7relay service 工厂函数
- **FR-007**: 系统 MUST 更新所有 orchestrator 文件添加 i7relay case 分支
- **FR-008**: 所有框架代码 MUST 通过 TypeScript 类型检查（`bun run compile` 无错误）

### Key Entities

- **I7RelayRawService**: 负责从 i7Relay 平台获取原始数据的服务类，实现 RawService 接口
- **i7relayAdapter**: 负责将 i7Relay 平台响应数据标准化为统一类型的适配器对象
- **I7Relay Response Types**: 定义 i7Relay 平台 API 响应的 TypeScript 类型

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 项目能通过 TypeScript 类型检查（`bun run compile` 返回成功）
- **SC-002**: 创建 i7relay 类型租户时，系统能正确实例化对应的 service 而非抛出 PlatformNotSupportedError
- **SC-003**: 所有 4 个 orchestrator（balance、cost、token、tenant-info）都包含 i7relay case 分支
- **SC-004**: i7relay adapter 导出对象包含全部 5 个标准化方法（normalizeBalance、normalizeCosts、normalizeTokens、normalizeTokenGroups、normalizeTenantInfo）

## Assumptions

- i7Relay 平台的 API 响应结构与现有平台（newapi、cubence、packycode_codex）类似，包含 balance、costs、tokens、token groups、tenant info 等数据
- 框架代码中的方法可以返回占位数据或抛出 NotImplementedError，待后续实现具体逻辑
- PlatformType 类型定义中已包含 'i7relay'，无需修改类型定义
- 遵循现有代码库的命名规范：文件使用 kebab-case，类使用 PascalCase
