# Documentation Standards

## ADDED Requirements

### Requirement: Documentation Length Limits SHALL Be Enforced
文档 MUST 保持精简，避免冗余内容影响可读性。

#### Scenario: ui-design-rules.md 长度限制
- Given: UI 设计规则文档
- When: 文档被修改或审查
- Then: 文档总行数 MUST < 600 行

#### Scenario: storage-state-rules.md 长度限制
- Given: 存储状态规则文档
- When: 文档被修改或审查
- Then: 文档总行数 MUST < 250 行

### Requirement: Documentation Structure SHALL Prioritize Core Rules
文档 MUST 有清晰的层次结构，核心规则优先展示。

#### Scenario: 核心规则优先
- Given: 任何规则文档
- When: 开发者打开文档
- Then: 前 100 行 MUST 包含所有必须遵守的核心规则
- And: 详细示例和参考内容放在后续章节

#### Scenario: 避免重复内容
- Given: CLAUDE.md 和 docs/ 目录
- When: 同一规则需要说明
- Then: CLAUDE.md MUST 仅包含简要引用，详细内容在 docs/ 中
- And: 不在多处重复相同的代码示例

### Requirement: Example Code Guidelines SHALL Ensure Conciseness
示例代码 MUST 精简且有代表性。

#### Scenario: 每个模式一个典型示例
- Given: 需要展示某个 UI 模式
- When: 编写文档示例
- Then: 每个模式 MUST 最多包含 2 个示例（Good + Bad）
- And: 示例代码 < 30 行

#### Scenario: 避免重复组件列表
- Given: coss.md 已包含组件目录
- When: 其他文档需要引用组件
- Then: MUST 使用 "详见 docs/coss.md" 引用
- And: 不重复列出组件清单
