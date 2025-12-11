# unit-testing Specification

## Purpose
TBD - created by archiving change add-unit-tests. Update Purpose after archive.
## Requirements
### Requirement: Unit Test Infrastructure
项目 SHALL 使用 Bun 内置测试框架运行单元测试。

#### Scenario: Run tests via npm script
- **WHEN** 执行 `bun run test`
- **THEN** 运行所有 `*.test.ts` 文件中的测试用例

### Requirement: APIError Retryable Logic Tests
`APIError.isRetryable` getter SHALL 有完整的单元测试覆盖。

#### Scenario: 5xx status codes are retryable
- **WHEN** APIError 的 status 为 500、502、503 等 5xx 状态码
- **THEN** `isRetryable` 返回 `true`

#### Scenario: 429 status code is retryable
- **WHEN** APIError 的 status 为 429
- **THEN** `isRetryable` 返回 `true`

#### Scenario: 4xx status codes are not retryable
- **WHEN** APIError 的 status 为 400、401、403、404 等非 429 的 4xx 状态码
- **THEN** `isRetryable` 返回 `false`

#### Scenario: Undefined status is not retryable
- **WHEN** APIError 的 status 为 undefined
- **THEN** `isRetryable` 返回 `false`

### Requirement: Timestamp Range Calculation Tests
`getTimestampRange()` 函数 SHALL 有完整的单元测试覆盖。

#### Scenario: Calculate range for each CostPeriod
- **WHEN** 传入 CostPeriod.DAY_1、DAY_7、DAY_14、DAY_30
- **THEN** 返回正确的 [start, end] 时间戳元组，start 为当天 00:00:00，end 为当天 23:59:59

### Requirement: Tenant Selector Tests
`getSelectedTenant()` 函数 SHALL 有完整的单元测试覆盖。

#### Scenario: Find selected tenant
- **WHEN** state 中存在匹配 selectedTenantId 的租户
- **THEN** 返回该租户对象

#### Scenario: Return null when not found
- **WHEN** state 中不存在匹配 selectedTenantId 的租户
- **THEN** 返回 `null`

### Requirement: CSS Class Merge Tests
`cn()` 函数 SHALL 有基本的单元测试覆盖。

#### Scenario: Merge multiple classes
- **WHEN** 传入多个 class 字符串
- **THEN** 返回合并后的 class 字符串

#### Scenario: Handle Tailwind conflicts
- **WHEN** 传入冲突的 Tailwind 类（如 `p-2` 和 `p-4`）
- **THEN** 后者覆盖前者

