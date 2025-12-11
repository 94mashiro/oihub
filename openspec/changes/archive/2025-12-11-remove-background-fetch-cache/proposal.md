# Change: Remove Background Fetch Cache Layer

## Why
当前 background fetch 层包含内存缓存和请求去重逻辑，增加了代码复杂度。为保持请求逻辑干净简洁，应移除这些附加功能，仅保留核心的跨 CORS HTTP 请求能力。

## What Changes
- **BREAKING**: 移除 `entrypoints/background.ts` 中的内存缓存逻辑（`fetchCache`、`generateCacheKey`、TTL/LRU 相关代码）
- **BREAKING**: 移除 `FetchRequest.cache` 参数
- 移除 `lib/api/transport/deduplicator.ts` 文件
- 简化 `lib/api/transport/background-transport.ts`，移除去重逻辑

## Impact
- Affected code:
  - `entrypoints/background.ts` - 移除缓存相关代码
  - `lib/api/transport/background-transport.ts` - 移除去重调用
  - `lib/api/transport/deduplicator.ts` - 删除文件
- 调用方无需修改（`cache` 参数将被忽略后移除）
