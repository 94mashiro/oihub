# Quickstart: 平台类型字段

**Feature**: 001-platform-type
**Date**: 2025-12-26

## Overview

本功能为 Tenant 数据结构添加 `platformType` 字段，使系统能够根据账号所属平台选择正确的适配器进行数据转换。

## Key Changes

### 1. Type Definition

```typescript
// types/tenant.ts
import type { PlatformType } from '@/lib/api/adapters';

export interface Tenant {
  id: TenantId;
  name: string;
  token: string;
  userId: string;
  url: string;
  platformType?: PlatformType;  // 新增字段
}
```

### 2. Adapter Selection

```typescript
// lib/api/services/tenant-api-service.ts
export class TenantAPIService {
  constructor(tenant: Tenant) {
    const platformType = tenant.platformType ?? 'newapi';
    this.adapter = getAdapter(platformType);
    // ...
  }
}
```

### 3. Error Handling

```typescript
// lib/api/adapters/index.ts
export function getAdapter(platformType: PlatformType): PlatformAdapter {
  const adapter = adapters[platformType];
  if (!adapter) {
    throw new Error(`不支持的平台类型: ${platformType}`);
  }
  return adapter;
}
```

### 4. UI Component

在账号添加/编辑表单中添加平台类型选择器：

```tsx
// 注意：必须确保组件在当前布局环境中样式合适
// 必要时使用 className 覆盖进行样式调整
<Select
  value={platformType}
  onValueChange={setPlatformType}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="选择平台类型" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="newapi">NewAPI</SelectItem>
  </SelectContent>
</Select>
```

**样式约束**: 组件不得出现过大或过小的情况，必须与表单其他元素保持视觉一致性。

## Testing

验证功能正常工作：

1. **添加账号**: 创建新账号，验证 platformType 被保存
2. **数据获取**: 获取余额/消费数据，验证使用正确适配器
3. **编辑账号**: 修改 platformType，验证更改被保存
4. **向后兼容**: 旧账号（无 platformType）能正常工作

## Files to Modify

| File | Change |
|------|--------|
| `types/tenant.ts` | 已有 platformType 字段（可选） |
| `lib/api/adapters/index.ts` | 添加错误处理 |
| `lib/api/services/tenant-api-service.ts` | 从 tenant 读取 platformType |
| `entrypoints/popup/components/*` | 添加平台类型选择器 |
