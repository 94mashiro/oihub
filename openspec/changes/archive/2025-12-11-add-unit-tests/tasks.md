## 1. Test Infrastructure
- [x] 1.1 Add `test` script to package.json
- [x] 1.2 Export `getTimestampRange` from tenant-api-service.ts

## 2. Unit Tests
- [x] 2.1 Create `lib/api/types.test.ts` for APIError.isRetryable
- [x] 2.2 Create `lib/api/services/tenant-api-service.test.ts` for getTimestampRange
- [x] 2.3 Create `lib/state/tenant-store.test.ts` for getSelectedTenant
- [x] 2.4 Create `lib/utils.test.ts` for cn()

## 3. Validation
- [x] 3.1 Run `bun run test` to verify all tests pass
- [x] 3.2 Run `bun run compile` to verify type checking
