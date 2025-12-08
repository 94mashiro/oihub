# OneAPI 简化版客户端

简洁、类型安全的 OneAPI HTTP 客户端，基于 axios 和拦截器。

## 特性

- ✅ **TypeScript 友好**：完整的类型定义和泛型支持
- ✅ **自动认证**：自动添加 `Authorization` 和 `New-Api-User` headers
- ✅ **统一错误处理**：自动检查 `success` 字段并抛出错误
- ✅ **自动解包**：直接返回 `data` 字段，无需手动解包
- ✅ **跨环境支持**：React 和 Extension Script 都能使用
- ✅ **基于 axios**：支持拦截器等高级特性

## 快速开始

### 1. 创建客户端

```typescript
import { createOneAPIClient } from '@/lib/api/oneapi-simple';

const client = createOneAPIClient({
  baseURL: 'https://api.example.com',
  token: 'sk-xxxxx',
  userId: '123',
  timeout: 30000,        // 可选，默认 30s
  enableLogging: false,  // 可选，开发时可启用
});
```

### 2. 发送请求

```typescript
// 定义响应类型
interface User {
  id: number;
  username: string;
  email: string;
}

// GET 请求
const user = await client.get<User>('/api/user/self');
console.log(user.username); // 直接访问 data 字段

// POST 请求
interface CreateRequest {
  name: string;
}
const result = await client.post<User, CreateRequest>('/api/users', {
  name: 'John',
});

// PUT 请求
const updated = await client.put<User>('/api/users/123', {
  name: 'Jane',
});

// DELETE 请求
await client.delete('/api/users/123');
```

## API 响应格式

OneAPI 标准响应格式：

```typescript
{
  "success": true,
  "message": "",
  "data": { /* 实际业务数据 */ }
}
```

客户端会自动：
1. 检查 `success` 字段
2. 如果 `success: false`，抛出 `OneAPIError`
3. 如果 `success: true`，直接返回 `data` 字段

## 错误处理

```typescript
import { OneAPIError } from '@/lib/api/oneapi-simple';

try {
  const user = await client.get<User>('/api/user/self');
} catch (error) {
  if (error instanceof OneAPIError) {
    console.error('业务错误:', error.message);
    console.error('HTTP 状态:', error.status);
    console.error('原始响应:', error.response);
  }
}
```

## 在 React 中使用

```typescript
// hooks/useUser.ts
import { createOneAPIClient, OneAPIError } from '@/lib/api/oneapi-simple';
import { useTenantStore } from '@/lib/state/tenant-store';
import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const tenant = useTenantStore((s) => s.currentTenant);

  useEffect(() => {
    if (!tenant) return;

    const client = createOneAPIClient({
      baseURL: tenant.url,
      token: tenant.token,
      userId: tenant.userId,
    });

    client
      .get<User>('/api/user/self')
      .then(setUser)
      .catch((err) => {
        if (err instanceof OneAPIError) {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [tenant]);

  return { user, error, loading };
}
```

## 在 Extension Script 中使用

```typescript
// entrypoints/background.ts
import { createOneAPIClient } from '@/lib/api/oneapi-simple';
import { tenantStore } from '@/lib/state/tenant-store';

async function fetchUserData() {
  const tenant = tenantStore.getState().currentTenant;
  if (!tenant) return;

  const client = createOneAPIClient({
    baseURL: tenant.url,
    token: tenant.token,
    userId: tenant.userId,
  });

  try {
    const user = await client.get<User>('/api/user/self');
    console.log('User loaded:', user);
  } catch (error) {
    console.error('Failed to load user:', error);
  }
}
```

## 封装业务 API

推荐为不同的业务模块创建独立的 API 类：

```typescript
// lib/api/user-api.ts
import type { OneAPIClient } from '@/lib/api/oneapi-simple';

interface User {
  id: number;
  username: string;
  email: string;
  quota: number;
}

interface UpdateUserRequest {
  display_name?: string;
  email?: string;
}

export class UserAPI {
  constructor(private readonly client: OneAPIClient) {}

  async getSelf(): Promise<User> {
    return this.client.get<User>('/api/user/self');
  }

  async updateProfile(data: UpdateUserRequest): Promise<User> {
    return this.client.put<User, UpdateUserRequest>('/api/user/self', data);
  }
}

// 使用
const client = createOneAPIClient(config);
const userApi = new UserAPI(client);
const user = await userApi.getSelf();
```

## 高级用法

### 访问原始 axios 实例

```typescript
const axiosInstance = client.getAxios();

// 添加自定义拦截器
axiosInstance.interceptors.request.use((config) => {
  // 自定义逻辑
  return config;
});
```

### 请求配置

```typescript
// 使用原始 axios 实例发送自定义请求
const response = await client.getAxios().get('/api/custom', {
  params: { page: 1 },
  headers: { 'X-Custom': 'value' },
  timeout: 60000,
});
```

## 对比旧版本

**旧版本（复杂）：**
- 多个文件：client.ts, business-client.ts, interceptors.ts, errors.ts
- 多种错误类型：OneAPIError, OneAPIHTTPError, OneAPIAuthError, etc.
- 复杂配置：RetryConfig, OneAPIRequestOptions
- 需要手动选择 OneAPIClient 或 OneAPIBusinessClient

**新版本（简洁）：**
- 3 个文件：client.ts, types.ts, index.ts
- 1 种错误类型：OneAPIError
- 简单配置：5 个必选/可选字段
- 自动处理业务响应格式

## 类型定义

```typescript
// 配置
interface OneAPIConfig {
  baseURL: string;
  token: string;
  userId: string;
  timeout?: number;      // 默认 30000ms
  enableLogging?: boolean; // 默认 false
}

// 响应格式
interface OneAPIResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 错误类
class OneAPIError extends Error {
  message: string;
  status?: number;
  response?: unknown;
}
```
