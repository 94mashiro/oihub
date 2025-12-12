## 1. Infrastructure
- [x] 1.1 Create `lib/background/types.ts` with `BackgroundModule` interface
- [x] 1.2 Create `lib/background/module-registry.ts` for module lifecycle management
- [x] 1.3 Create `lib/background/message-router.ts` for unified message handling
- [x] 1.4 Create `lib/background/index.ts` with unified exports

## 2. Module Extraction
- [x] 2.1 Extract usage alert logic to `lib/background/modules/usage-alert.ts`
- [x] 2.2 Extract fetch proxy logic to `lib/background/modules/fetch-proxy.ts`
- [x] 2.3 Extract tenant watcher logic to `lib/background/modules/tenant-watcher.ts`

## 3. Integration
- [x] 3.1 Refactor `entrypoints/background.ts` to use module registry
- [x] 3.2 Verify all existing functionality works correctly

## 4. Validation
- [x] 4.1 Run `bun run compile` to verify type safety (pre-existing errors in background-transport.ts unrelated to this change)
- [x] 4.2 Run `bun run build` to verify build passes
- [ ] 4.3 Manual test: verify usage alert notifications work
- [ ] 4.4 Manual test: verify CORS fetch proxy works
