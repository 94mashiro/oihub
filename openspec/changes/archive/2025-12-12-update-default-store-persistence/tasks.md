## 1. 重构核心工厂函数
- [x] 1.1 重命名 `create-persistent-store.ts` → `create-store.ts`
- [x] 1.2 将导出的 `createPersistentStore` 重命名为 `createStore`
- [x] 1.3 更新 `types.ts` 中相关类型命名（如 `PersistentStoreConfig` → `StoreConfig`）

## 2. 更新现有持久化 Stores 的导入
- [x] 2.1 更新 `tenant-store.ts` 导入路径和函数名
- [x] 2.2 更新 `balance-store.ts` 导入路径和函数名
- [x] 2.3 更新 `setting-store.ts` 导入路径和函数名

## 3. 迁移非持久化 Stores
- [x] 3.1 迁移 `cost-store.ts` 使用新的 `createStore`
- [x] 3.2 迁移 `token-store.ts` 使用新的 `createStore`
- [x] 3.3 为迁移后的 stores 添加 `ready` 状态检查到相关组件

## 4. 更新文档
- [x] 4.1 更新 `docs/storage-state-rules.md` 移除"运行时 store"分类
- [x] 4.2 将文档中所有 `createPersistentStore` 引用替换为 `createStore`

## 5. 验证
- [x] 5.1 运行 `bun run compile` 确保类型检查通过
- [x] 5.2 运行 `bun run build` 确保构建成功
- [x] 5.3 手动测试扩展重启后数据恢复
