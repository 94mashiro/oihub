## 1. Implementation

- [ ] 1.1 盘点现状：枚举所有 `@/utils/*`、`@/types/*`、`@/lib/*` 的引用点，确认迁移影响面可控
- [ ] 1.2 将根目录 `utils/` 下文件迁移到 `lib/utils/`（保持文件名与导出不变）
- [ ] 1.3 更新所有引用 `@/utils/*` 的导入路径为 `@/lib/utils/*`
- [ ] 1.4 删除根目录 `utils/`（或在需要兼容时保留薄 re-export，但默认不保留以避免双源）
- [ ] 1.5 校准 `docs/api-architecture.md`：修正与实际目录树/文件名不一致的部分（不改变规则语义）

## 2. Validation

- [ ] 2.1 `bun run compile`：确保类型检查通过
- [ ] 2.2 `bun run build`（及需要时 `bun run build:firefox`）：确保生产打包通过
- [ ] 2.3 运行现有单测（若有）：`bun test`（或项目约定的测试命令）确保无回归

## 3. Rollback Plan

- [ ] 3.1 若构建/运行异常：回退 `utils/` 迁移相关提交，恢复原始导入路径与文件位置


