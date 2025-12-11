## 1. Implementation

- [x] 1.1 移除 `entrypoints/background.ts` 中的缓存逻辑（`fetchCache`、`generateCacheKey`、TTL/LRU 代码）
- [x] 1.2 移除 `FetchRequest` 接口中的 `cache` 字段
- [x] 1.3 删除 `lib/api/transport/deduplicator.ts` 文件
- [x] 1.4 简化 `lib/api/transport/background-transport.ts`，移除去重逻辑
- [x] 1.5 运行 `bun run compile` 确认类型检查通过
- [x] 1.6 运行 `bun run build` 确认构建成功
