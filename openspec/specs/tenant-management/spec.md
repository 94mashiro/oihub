# tenant-management Specification

## Purpose
TBD - created by archiving change add-duplicate-tenant-validation. Update Purpose after archive.
## Requirements
### Requirement: Duplicate Tenant Validation
系统在添加租户时 SHALL 校验是否存在重复账号，重复定义为 `url` + `userId` 组合相同。

#### Scenario: Duplicate tenant rejected
- **WHEN** 用户尝试添加一个租户，其 `url` 和 `userId` 与已存在租户相同
- **THEN** 系统拒绝添加并抛出错误，错误信息包含已存在账号的名称

#### Scenario: Unique tenant accepted
- **WHEN** 用户添加一个租户，其 `url` + `userId` 组合在现有列表中不存在
- **THEN** 系统正常添加该租户

