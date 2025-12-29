# Quickstart: i7Relay Platform Adapter/Service Framework

**Feature**: 001-i7relay-adapter
**Date**: 2025-12-29

## Prerequisites

- Node.js 18+
- Bun package manager
- 已克隆 oihub 仓库

## Quick Verification

框架代码完成后，运行以下命令验证：

```bash
# 类型检查
bun run compile

# 验证 service 可实例化
# (在浏览器扩展环境中测试)
```

## File Checklist

### New Files (3)

- [X] `lib/api/types/platforms/i7relay-response-types.ts`
- [X] `lib/api/adapters/i7relay-adapter.ts`
- [X] `lib/api/services/i7relay-service.ts`

### Updated Files (6)

- [X] `lib/api/types/platforms/index.ts` - 导出 i7relay 类型
- [X] `lib/api/adapters/index.ts` - 导出 i7relay adapter
- [X] `lib/api/services/raw-service-factory.ts` - 注册 i7relay service
- [X] `lib/api/orchestrators/balance/balance-orchestrator.ts` - 添加 i7relay case
- [X] `lib/api/orchestrators/cost/cost-orchestrator.ts` - 添加 i7relay case
- [X] `lib/api/orchestrators/token/token-orchestrator.ts` - 添加 i7relay case
- [X] `lib/api/orchestrators/tenant-info/tenant-info-orchestrator.ts` - 添加 i7relay case

## Usage Example

```typescript
import { getRawService } from '@/lib/api/services/raw-service-factory';
import { i7relayAdapter } from '@/lib/api/adapters';

// 创建 i7relay 租户
const tenant = {
  id: 'test-tenant',
  platformType: 'i7relay' as const,
  url: 'https://api.i7relay.example.com',
  token: 'sk-xxx',
};

// 获取 service 实例
const service = getRawService(tenant);
// service 是 I7RelayRawService 实例

// 调用方法（当前会抛出 NotImplementedError）
try {
  await service.fetchBalance();
} catch (e) {
  // NotImplementedError: I7Relay fetchBalance not implemented
}

// Adapter 可以处理空数据
const balance = i7relayAdapter.normalizeBalance({});
// { remainingCredit: 0, consumedCredit: 0 }
```

## Next Steps

1. 运行 `/speckit.tasks` 生成任务列表
2. 按任务顺序实现框架代码
3. 运行 `bun run compile` 验证类型检查通过
4. 后续根据 i7Relay API 文档实现具体逻辑
