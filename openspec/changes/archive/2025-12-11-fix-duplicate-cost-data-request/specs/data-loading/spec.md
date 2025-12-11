## MODIFIED Requirements

### Requirement: Lazy Data Loading Strategy
系统 SHALL 区分「必需数据」和「按需数据」，仅在 popup 打开时加载必需数据，按需数据在用户交互时实时获取。

#### Scenario: Popup 打开时仅加载必需数据
- **WHEN** 用户打开 popup
- **THEN** 系统仅获取 tenantInfo、balance、DAY_1 cost
- **AND** 不获取 tokens、tokenGroups、其他周期 cost

#### Scenario: 展开令牌列表时获取 tokens
- **WHEN** 用户展开「令牌列表」Accordion
- **THEN** 系统调用接口获取该租户的 tokens 和 tokenGroups
- **AND** 每次展开都重新获取最新数据

#### Scenario: 模型消耗面板渲染时使用已有数据
- **WHEN** 「模型消耗」AccordionPanel 展开渲染且 store 中已有对应周期的 cost 数据
- **THEN** 系统使用 store 中的已有数据，不发起新的 API 请求
- **AND** 避免重复请求，即使组件因渲染机制被挂载多次

#### Scenario: 模型消耗面板渲染时加载缺失数据
- **WHEN** 「模型消耗」面板渲染且 store 中不存在对应周期的 cost 数据
- **THEN** 系统调用接口获取该周期的 cost 数据

#### Scenario: 切换消耗周期时获取对应数据
- **WHEN** 用户在「模型消耗」面板切换周期
- **THEN** 系统调用接口获取该周期的 cost 数据
- **AND** 每次切换都重新获取最新数据
