## ADDED Requirements
### Requirement: Refresh Button Loading State
刷新按钮 SHALL 在 refreshAll 执行期间显示 loading 状态，让用户感知刷新进度。

#### Scenario: 点击刷新按钮显示 loading 状态
- **WHEN** 用户点击刷新按钮
- **THEN** 按钮图标开始旋转动画
- **AND** 按钮处于 disabled 状态防止重复点击

#### Scenario: 刷新完成后恢复正常状态
- **WHEN** refreshAll 执行完成
- **THEN** 按钮图标停止旋转
- **AND** 按钮恢复可点击状态
