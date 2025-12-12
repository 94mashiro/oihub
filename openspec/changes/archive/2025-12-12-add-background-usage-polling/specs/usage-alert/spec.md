# usage-alert Delta Specification

## ADDED Requirements

### Requirement: Background Daily Usage Polling
系统 SHALL 在 background 中定时获取启用告警租户的当日使用额度，并在超出阈值时触发额度告警。

#### Scenario: Background 定时检查触发告警
- **GIVEN** 某租户已启用当日额度告警且配置阈值 > 0
- **WHEN** background 定时任务拉取当日消费数据并计算今日用量
- **AND** 今日用量（quota 单位）达到或超过阈值
- **THEN** 系统触发与 popup 刷新一致的额度告警通知
- **AND** 记录该租户今日已告警以避免重复推送

#### Scenario: 仅轮询启用告警的租户
- **GIVEN** 多个租户存在告警配置
- **WHEN** background 运行定时检查
- **THEN** 系统仅对 `enabled=true && threshold>0` 的租户发起当日用量拉取
- **AND** 对未启用告警的租户不产生网络请求与告警判定

#### Scenario: 轮询失败不影响后续检查
- **GIVEN** 某轮询中部分租户接口请求失败
- **WHEN** background 下一次轮询到来
- **THEN** 系统继续按间隔发起检查
- **AND** 不因上一轮失败而停止轮询

#### Scenario: 无 popup 打开仍可告警
- **GIVEN** 用户未打开 popup
- **WHEN** background 定时任务运行并发现超阈值用量
- **THEN** 系统仍发送浏览器通知

