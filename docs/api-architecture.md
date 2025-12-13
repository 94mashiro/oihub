# API 架构规范

## 架构分层

```
┌─────────────────────────────────────────────────────────────┐
│ React Components - 只读取 store，通过 hooks 触发操作         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Hooks Layer - useTenantDataRefresh() 等                     │
│ 职责: 连接 React 和 Service，管理副作用                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Service Layer - TenantAPIService                            │
│ 职责: 封装 API 端点、类型安全、业务逻辑（分页等）             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Client Layer - APIClient（`apiClient` 全局单例）             │
│ 职责: HTTP 方法、rate limiting、重试、错误处理               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Transport Layer - BackgroundTransport                       │
│ 职责: CORS bypass（message passing），不包含缓存/去重         │
└─────────────────────────────────────────────────────────────┘
```

## 目录结构

```
lib/api/
├── types.ts                     # 统一类型定义
├── index.ts                     # 统一导出
├── transport/
│   └── background-transport.ts  # CORS bypass（无缓存/去重）
├── client/
│   ├── api-client.ts            # HTTP 客户端
│   ├── rate-limiter.ts          # 限流器
│   ├── rate-limiter-registry.ts # 限流器注册表
│   ├── retry.ts                 # 指数退避重试
│   └── error-handler.ts         # 错误处理
└── services/
    └── tenant-api-service.ts    # 租户 API 服务层
```

## 强制规则

### 1. 禁止直接创建 Client

```typescript
// ❌ 错误 - 直接创建 client
const client = new APIClient({ baseURL, token, userId });

// ✅ 正确 - 使用全局单例（或更推荐：直接使用 TenantAPIService）
import { apiClient } from '@/lib/api';
const data = await apiClient.get('/api/user/self', { baseURL, token, userId });
```

### 2. 使用 Service 层封装端点

```typescript
// ❌ 错误 - 在 hook/组件中硬编码 URL
const data = await client.get('/api/user/self');

// ✅ 正确 - 通过 Service 调用
import { TenantAPIService } from '@/lib/api';
const api = new TenantAPIService(tenant);
const data = await api.getSelfInfo();
```

### 3. 新增 API 端点必须添加到 Service

在 `lib/api/services/tenant-api-service.ts` 中添加新方法：

```typescript
export class TenantAPIService {
  // 新增端点示例
  async getNewFeature(): Promise<NewFeatureResponse> {
    return apiClient.get('/api/new-feature', this.config);
  }
}
```

### 4. 类型安全

- 所有 API 响应必须有明确的类型定义
- 禁止使用 `any` 类型
- 响应类型定义在对应的 store 或 `types/` 目录

### 5. 错误处理

- 使用 `APIError` 类，不要创建新的错误类型
- 可重试错误 (5xx, 429) 会自动重试
- `RateLimitError` 是静默错误，不显示 toast

## 内置特性

### 请求重试（默认启用）

- 对 5xx 和 429 错误自动重试
- 指数退避: 1s → 2s → 4s
- 最多重试 3 次
- `RateLimitError` 不会重试（已触发冷却）

### 请求去重（GET 请求）

- 当前 background fetch 层不提供请求去重（如需去重请在上层自行实现）

### Rate Limiting

- 默认 2 QPS
- 429 响应触发 30 秒冷却期
- 冷却期内所有请求立即拒绝

### 缓存（Background 层）

- 当前 background fetch 层不提供缓存（如需缓存请在上层自行实现）

## 使用示例

### 在 Hook 中使用

```typescript
import { TenantAPIService } from '@/lib/api';

async function refreshTenantData(tenant: Tenant) {
  const api = new TenantAPIService(tenant);

  const [info, balance] = await Promise.allSettled([
    api.getStatus(),
    api.getSelfInfo(),
  ]);

  // 处理结果...
}
```

### 重试配置

- 重试与限流配置由 `lib/api/client/api-client.ts` 中的 `apiClient` 全局单例负责
- 如需调整默认策略，请在该文件中修改单例配置（避免在业务代码中散落创建新 client）

## 扩展指南

### 添加新的 API 服务

1. 在 `lib/api/services/` 创建新文件
2. 遵循 `TenantAPIService` 的模式
3. 在 `lib/api/index.ts` 导出

### 添加新的错误类型

1. 在 `lib/api/types.ts` 继承 `APIError`
2. 设置 `silent` 属性控制 toast 显示
3. 设置 `isRetryable` 控制重试行为
