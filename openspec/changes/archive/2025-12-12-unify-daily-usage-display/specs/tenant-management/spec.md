# tenant-management Spec Delta

## ADDED Requirements

### Requirement: Unified Daily Usage Display
租户卡片 SHALL 将今日消耗数据以单一标签「今日消耗」展示，同时呈现费用（金额）和用量（tokens）两种单位。

#### Scenario: Both cost and tokens available
- **GIVEN** 租户今日有消耗数据
- **WHEN** 用户查看租户卡片
- **THEN** 显示格式为 `今日消耗    $X.XX / N tokens`，其中 $X.XX 为费用金额，N 为 token 数量

#### Scenario: Only cost available
- **GIVEN** 租户今日仅有费用数据，无 token 数据
- **WHEN** 用户查看租户卡片
- **THEN** 显示格式为 `今日消耗    $X.XX`

#### Scenario: Only tokens available
- **GIVEN** 租户今日仅有 token 数据，无费用数据
- **WHEN** 用户查看租户卡片
- **THEN** 显示格式为 `今日消耗    N tokens`

#### Scenario: No data available
- **GIVEN** 租户今日无任何消耗数据
- **WHEN** 用户查看租户卡片
- **THEN** 显示格式为 `今日消耗    –`

