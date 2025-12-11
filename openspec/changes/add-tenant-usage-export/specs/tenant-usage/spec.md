## ADDED Requirements
### Requirement: Tenant usage export to CSV
系统 SHALL 允许用户在弹窗中为选定租户导出当前计费周期的用量与成本数据为 CSV 文件。

#### Scenario: Export succeeds
- **WHEN** 用户在弹窗用量面板点击“导出 CSV”且租户 API 返回用量数据
- **THEN** 系统 MUST 生成包含指标、时间范围、金额/额度的 CSV 内容
- **AND** 系统 MUST 触发浏览器下载或复制到剪贴板并提示成功

#### Scenario: API error handled
- **WHEN** 租户 API 返回错误或网络失败
- **THEN** 系统 MUST 显示错误消息并保持当前 UI 状态不变
- **AND** 系统 MUST 提供重试入口

#### Scenario: Rate limited
- **WHEN** 导出请求因频率限制被拒绝
- **THEN** 系统 MUST 告知用户等待时间或限制原因
- **AND** 系统 MUST 阻止在冷却期内的重复触发
