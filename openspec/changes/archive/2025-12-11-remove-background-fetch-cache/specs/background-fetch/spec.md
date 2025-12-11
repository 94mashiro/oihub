## REMOVED Requirements

### Requirement: Request Caching
**Reason**: 简化 background fetch 层，仅保留核心 CORS 绕过功能
**Migration**: 调用方如需缓存应在上层自行实现

### Requirement: Request Deduplication
**Reason**: 简化 background fetch 层，仅保留核心 CORS 绕过功能
**Migration**: 调用方如需去重应在上层自行实现

## ADDED Requirements

### Requirement: Minimal Background Fetch
Background fetch 层 SHALL 仅提供跨 CORS 的 HTTP 请求转发功能，不包含缓存、去重等附加逻辑。

#### Scenario: Simple GET request
- **WHEN** popup 发起 GET 请求
- **THEN** background 直接转发请求并返回响应，无缓存处理

#### Scenario: POST request
- **WHEN** popup 发起 POST 请求
- **THEN** background 直接转发请求并返回响应
