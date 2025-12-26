# Feature Specification: 平台类型字段

**Feature Branch**: `001-platform-type`
**Created**: 2025-12-26
**Status**: Draft
**Input**: User description: "由于我们将 store 重构成了通用的设计模式，所以之前针对newapi平台做的数据获取、数据写入，已经从默认的逻辑转变为了单个渠道的适配器设计。因此，在实现账号数据存储的时候，应该添加一个字段表明当前账号对应的平台类型是什么，这样才能让后续的业务逻辑找到应该调用那个平台的接口，使用哪个平台的适配器转换接口下发的数据并存入，完整的链路都需要依赖这个类型字段"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 添加账号时指定平台类型 (Priority: P1)

用户在添加新账号时，需要选择该账号所属的平台类型（如 newapi），系统将此信息与账号一起保存，以便后续业务逻辑能够正确调用对应平台的适配器。

**Why this priority**: 这是整个多平台适配器架构的基础，没有平台类型字段，系统无法知道应该使用哪个适配器来处理数据。

**Independent Test**: 可以通过添加一个新账号并验证其平台类型字段被正确保存来独立测试。

**Acceptance Scenarios**:

1. **Given** 用户在添加账号界面, **When** 界面加载完成, **Then** 显示平台类型下拉选择器（即使只有一个选项）
2. **Given** 用户在添加账号界面, **When** 用户填写账号信息并选择平台类型为 "newapi", **Then** 系统保存账号时包含 platformType 字段值为 "newapi"
3. **Given** 用户在添加账号界面, **When** 用户未选择平台类型, **Then** 系统使用默认平台类型 "newapi" 保存账号

---

### User Story 2 - 获取数据时使用正确的适配器 (Priority: P1)

当系统需要获取账号相关数据（如余额、消费记录、令牌列表）时，根据账号的平台类型字段找到对应的适配器，使用该适配器转换 API 返回的数据。

**Why this priority**: 这是平台类型字段的核心使用场景，确保数据获取链路能够正确工作。

**Independent Test**: 可以通过为一个已保存的账号获取余额数据，验证系统使用了正确的适配器来转换数据。

**Acceptance Scenarios**:

1. **Given** 存在一个 platformType 为 "newapi" 的账号, **When** 系统获取该账号的余额数据, **Then** 系统使用 newapi 适配器转换 API 响应数据
2. **Given** 存在一个 platformType 为 "newapi" 的账号, **When** 系统获取该账号的消费记录, **Then** 系统使用 newapi 适配器转换消费数据格式

---

### User Story 3 - 编辑账号时修改平台类型 (Priority: P2)

用户在编辑已有账号时，可以修改该账号的平台类型，系统更新存储的平台类型信息。

**Why this priority**: 允许用户修正错误的平台类型配置，但不是核心功能。

**Independent Test**: 可以通过编辑一个已有账号的平台类型并验证更改被保存来独立测试。

**Acceptance Scenarios**:

1. **Given** 存在一个 platformType 为 "newapi" 的账号, **When** 用户编辑该账号并更改平台类型, **Then** 系统保存新的平台类型值

---

### Edge Cases

- 当账号的 platformType 字段为空或未定义时，系统应使用默认平台类型 "newapi"
- 当账号的 platformType 对应的适配器不存在时，系统应阻止数据操作并显示用户可见的错误提示
- 当从旧版本数据迁移时，没有 platformType 字段的账号应自动补充默认值

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 在 Tenant 数据结构中包含 platformType 字段，用于标识账号所属平台
- **FR-002**: 系统 MUST 在添加新账号时保存 platformType 字段值
- **FR-003**: 系统 MUST 在 platformType 未指定时使用默认值 "newapi"
- **FR-004**: 系统 MUST 在获取账号数据时根据 platformType 选择对应的适配器
- **FR-005**: 系统 MUST 支持编辑账号时修改 platformType 字段
- **FR-006**: 系统 MUST 在适配器不存在时阻止操作并显示用户可见的错误提示
- **FR-007**: 系统 MUST 确保 platformType 字段被持久化存储
- **FR-008**: 平台类型选择器 UI MUST 在当前布局环境中样式合适，不得出现过大或过小的情况

### Key Entities

- **Tenant**: 账号实体，包含 id、name、token、userId、url 和 platformType 字段。platformType 标识该账号所属的平台类型，用于选择正确的数据适配器。
- **PlatformType**: 平台类型枚举，当前支持 "newapi"，未来可扩展支持其他平台。
- **PlatformAdapter**: 平台适配器接口，负责将各平台 API 返回的原始数据转换为统一的内部数据格式。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 所有新添加的账号都包含有效的 platformType 字段
- **SC-002**: 系统能够根据账号的 platformType 正确选择并使用对应的适配器
- **SC-003**: 没有 platformType 的历史账号能够正常工作（使用默认值）
- **SC-004**: 用户能够在账号编辑界面查看和修改平台类型

## Clarifications

### Session 2025-12-26

- Q: 平台类型选择 UI 如何呈现？ → A: 始终显示下拉选择器（即使只有一个选项）
- Q: 适配器不存在时的错误处理行为？ → A: 阻止操作并显示用户可见的错误提示
- Q: UI 组件样式约束？ → A: 必须确保组件在当前布局环境中样式合适，不得过大过小，必要时使用 className 覆盖进行样式调整

## Assumptions

- 当前仅支持 "newapi" 一种平台类型，但架构设计应支持未来扩展
- 默认平台类型为 "newapi"，因为这是当前唯一支持的平台
- 平台类型字段为必填字段，但为了向后兼容，允许为空时使用默认值
