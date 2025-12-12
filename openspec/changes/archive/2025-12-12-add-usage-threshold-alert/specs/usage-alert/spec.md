# usage-alert Specification

## Purpose
提供租户级别的今日额度使用阈值告警功能，当用量达到用户设定的阈值时通过浏览器通知提醒用户。

## ADDED Requirements

### Requirement: Alert Configuration Storage
系统 SHALL 在 `setting-store` 中持久化存储每个租户的告警配置，包括启用状态和阈值数值（原始 quota 单位）。

#### Scenario: 保存告警配置
- **WHEN** 用户为某租户设置告警阈值并启用告警
- **THEN** 系统将配置持久化到 `setting-store.dailyUsageAlert` 字段
- **AND** 阈值以原始 quota 单位存储
- **AND** 配置在浏览器重启后保留

#### Scenario: 跨上下文同步配置
- **WHEN** 用户在 popup 中修改告警配置
- **THEN** background script 能立即读取到最新配置

### Requirement: Quota Currency Conversion
系统 SHALL 提供 quota 与货币单位之间的双向转换功能。

#### Scenario: 展示时转换为货币单位
- **WHEN** UI 需要展示阈值
- **THEN** 系统使用 `quotaToCurrency()` 将存储的 quota 转换为货币单位
- **AND** 使用租户的 `quota_per_unit` 和 `usd_exchange_rate` 进行计算

#### Scenario: 存储时转换为 quota
- **WHEN** 用户输入货币单位的阈值
- **THEN** 系统使用 `currencyToQuota()` 将输入转换为原始 quota
- **AND** 存储转换后的 quota 值

### Requirement: Alert Configuration UI
设置页面 SHALL 提供告警配置界面，允许用户为每个租户单独配置告警。

#### Scenario: 展示租户告警配置列表
- **WHEN** 用户打开设置页面
- **THEN** 系统展示所有租户的告警配置
- **AND** 每个租户显示名称、告警开关、阈值输入框（货币单位）

#### Scenario: 启用租户告警
- **WHEN** 用户打开某租户的告警开关
- **THEN** 该租户的阈值输入框变为可编辑状态
- **AND** 系统保存启用状态

#### Scenario: 设置告警阈值
- **WHEN** 用户输入阈值数值（货币单位）并失焦或按回车
- **THEN** 系统验证输入为正数
- **AND** 转换为 quota 后保存

#### Scenario: 阈值输入验证失败
- **WHEN** 用户输入非正数或非数字
- **THEN** 系统显示错误提示
- **AND** 不保存无效配置

#### Scenario: 租户信息未加载
- **WHEN** 租户的 tenantInfo 尚未加载
- **THEN** 阈值输入框显示禁用状态
- **AND** 提示用户需要先加载租户信息

### Requirement: Usage Threshold Alert Trigger
系统 SHALL 在租户今日用量达到或超过阈值时触发告警。

#### Scenario: 用量达到阈值触发告警
- **WHEN** 租户今日 cost 总额（quota 单位）达到或超过配置的阈值
- **AND** 该租户告警已启用
- **AND** 该租户今日尚未告警
- **THEN** 系统发送浏览器通知
- **AND** 记录该租户今日已告警

#### Scenario: 告警去重
- **WHEN** 租户今日已触发过告警
- **AND** 用量数据再次刷新
- **THEN** 系统不重复发送通知

#### Scenario: 跨日重置告警状态
- **WHEN** 日期变更（进入新的一天）
- **THEN** 系统清除所有租户的已告警标记
- **AND** 允许新一天的告警触发

### Requirement: Browser Notification
系统 SHALL 使用浏览器 Notification API 发送告警通知。

#### Scenario: 发送告警通知
- **WHEN** 告警触发条件满足
- **THEN** 系统调用 `browser.notifications.create` 发送通知
- **AND** 通知标题包含租户名称
- **AND** 通知内容包含当前用量和阈值信息（货币单位）

#### Scenario: 通知权限未授权
- **WHEN** 用户未授权通知权限
- **THEN** 系统静默失败，不阻塞其他功能
- **AND** 在设置页面提示用户授权

### Requirement: Unit Test Coverage
核心转换函数和 store 操作 SHALL 有单元测试覆盖。

#### Scenario: quota-converter 单元测试
- **WHEN** 运行 `bun test lib/utils/quota-converter.test.ts`
- **THEN** `quotaToCurrency` 正常转换测试通过
- **AND** `currencyToQuota` 正常转换测试通过
- **AND** 双向转换可逆性测试通过
- **AND** 边界值（0、极大值）测试通过

#### Scenario: setting-store 单元测试
- **WHEN** 运行 `bun test lib/state/setting-store.test.ts`
- **THEN** `setDailyUsageAlert` 保存配置测试通过
- **AND** `markAlerted` 记录已告警测试通过
- **AND** `clearAlertedToday` 清除告警记录测试通过
