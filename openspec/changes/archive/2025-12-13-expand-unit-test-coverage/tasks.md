## 1. Testability Prep
- [x] 1.1 Replace `#imports` storage import with `wxt/utils/storage` in `lib/state/*-store.ts`
- [x] 1.2 Add a small test helper (kebab-case) for setting/resetting `globalThis.browser = fakeBrowser` and waiting for store hydration microtask

## 2. Unit Tests (Add/Update)
- [x] 2.1 Add `lib/background/message-router.test.ts` (routing, init idempotency, single listener)
- [x] 2.2 Add `lib/background/module-registry.test.ts` (init order, cleanup reverse order, reset after cleanup)
- [x] 2.3 Add `lib/background/modules/fetch-proxy.test.ts` (FETCH handler registration + core response/error paths)
- [x] 2.4 Update `lib/state/setting-store.test.ts` to cover:
  - `setDailyUsageAlert` / `removeDailyUsageAlert`
  - `markAlerted` / `isAlertedToday`
  - `clearAlertedToday`
- [x] 2.5 Add tests for formatting helpers:
  - `lib/utils/format-number.test.ts`
  - `lib/utils/quota-to-price.test.ts`

## 3. Validation
- [x] 3.1 Run `bun run test`
- [x] 3.2 Run `bun run compile`
- [x] 3.3 Run `bun run build` to ensure WXT bundling still resolves imports correctly
