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
│ Client Layer - APIClient + ClientManager                    │
│ 职责: HTTP 方法、rate limiting、重试、错误处理               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Transport Layer - BackgroundTransport                       │
│ 职责: CORS bypass、缓存、请求去重                            │
└─────────────────────────────────────────────────────────────┘
```

## 目录结构

```
lib/api/
├── types.ts                     # 统一类型定义
├── index.ts                     # 统一导出
├── transport/
│   ├── background-transport.ts  # CORS bypass + 请求去重
│   └── deduplicator.ts          # 请求去重器
├── client/
│   ├── api-client.ts            # HTTP 客户端
│   ├── client-manager.ts        # 客户端实例管理器
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

// ✅ 正确 - 通过 clientManager 获取
import { clientManager } from '@/lib/api';
const client = clientManager.getClient(tenant);
```

### 2. 使用 Service 层封装端点

```typescript
// ❌ 错误 - 在 hook/组件中硬编码 URL
const data = await client.get('/api/user/self');

// ✅ 正确 - 通过 Service 调用
import { TenantAPIService } from '@/lib/api';
const api = new TenantAPIService(client);
const data = await api.getSelfInfo();
```

### 3. 新增 API 端点必须添加到 Service

在 `lib/api/services/tenant-api-service.ts` 中添加新方法：

```typescript
export class TenantAPIService {
  // 新增端点示例
  async getNewFeature(): Promise<NewFeatureResponse> {
    return this.client.get('/api/new-feature');
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

- 相同 URL + 用户的 GET 请求自动去重
- 并发请求共享同一个 Promise

### Rate Limiting

- 默认 2 QPS
- 429 响应触发 30 秒冷却期
- 冷却期内所有请求立即拒绝

### 缓存（Background 层）

- GET 请求默认缓存 1 分钟
- 缓存 key = URL + 用户 ID
- LRU 淘汰，最多 100 条

## 使用示例

### 在 Hook 中使用

```typescript
import { clientManager, TenantAPIService } from '@/lib/api';

async function refreshTenantData(tenant: Tenant) {
  const client = clientManager.getClient(tenant);
  const api = new TenantAPIService(client);

  const [info, balance] = await Promise.allSettled([
    api.getStatus(),
    api.getSelfInfo(),
  ]);

  // 处理结果...
}
```

### 禁用重试

```typescript
const client = new APIClient({
  ...config,
  retry: false,
});
```

### 自定义重试配置

```typescript
const client = new APIClient({
  ...config,
  retry: {
    maxRetries: 5,
    baseDelayMs: 500,
    maxDelayMs: 30000,
  },
});
```

## 扩展指南

### 添加新的 API 服务

1. 在 `lib/api/services/` 创建新文件
2. 遵循 `TenantAPIService` 的模式
3. 在 `lib/api/index.ts` 导出

### 添加新的错误类型

1. 在 `lib/api/types.ts` 继承 `APIError`
2. 设置 `silent` 属性控制 toast 显示
3. 设置 `isRetryable` 控制重试行为
