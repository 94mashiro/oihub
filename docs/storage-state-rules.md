# Storage & Global State Rulebook

## Context
- This WXT extension shares configuration across popup, background, and content contexts via the `storage` permission and `@wxt-dev/storage` (see `wxt.config.ts:7-32`). Every persistent value must travel through that layer.
- `lib/state/tenant-store.ts` already showcases the canonical pattern: `storage.defineItem` + Zustand vanilla store + `hydrate/ready` guard + `storageItem.watch`. The rules below generalize that template for all current and future data.

## Storage Rules
- **Mandatory**: Any value that needs to survive reloads or be visible in more than one context must be declared through `storage.defineItem` under `lib/state`. Components, hooks, and entrypoints may not touch `browser.storage*`, `localStorage`, or ad-hoc caches directly; store actions are the only public API.
- **Mandatory (Naming Convention)**: Storage module names and storage keys MUST follow this strict pattern:
  - Store module: `lib/state/<feature>-store.ts` (e.g., `tenant-store.ts`, `theme-store.ts`)
  - Storage key: `<scope>:<feature>` (e.g., `local:tenant`, `sync:theme`)
  - The `<feature>` segment must match exactly between the module name and storage key.
  - Choose the scope intentionally: device-only config → `local`, account-sync data → `sync`, ephemeral session data → `session`.
  - **Example**: Module `lib/state/tenant-store.ts` defines storage key `local:tenant` (NOT `local:tenant-selection` or `local:tenant-store`).
- **Mandatory**: Each storage item must describe its full TypeScript shape, provide a `fallback` value sourced from shared constants, and add a `version` field when migrations are possible. Default data must be render-safe so React never mounts with `undefined`.
- **Mandatory**: Persistent stores expose a `hydrate` function that exits early when `get().ready === true`, otherwise reads the storage snapshot, applies it, and finally sets `ready: true`. The `ready` flag is the single source of truth for UI gating.
- **Critical (Initialization Timing)**: `hydrate()` must be invoked AFTER the store's initial state object is returned. Calling `hydrate()` directly in the store factory (e.g., `void hydrate()` before the `return` statement) will cause `get()` to return `undefined` and crash. Use `queueMicrotask(() => void hydrate())` to defer execution until after Zustand completes initialization. This pattern ensures the store is fully constructed before attempting to read persisted values.
- **Mandatory**: All write operations return `Promise<void>` and `await storageItem.setValue`. Update in-memory state first, then persist, so UI stays in sync (`setSelectedTenant` is the reference). Storage writes must never originate from `storageItem.watch` callbacks to avoid loops.
- **Recommended**: Subscribe to `storageItem.watch` inside the store file only and restrict the callback to `applySnapshot`. Use background/service-worker logging (e.g., `store.subscribe`) for diagnostics instead of sprinkling console statements across contexts.

## Global State Rules
- **Mandatory**: Place every global store in `lib/state/<feature>-store.ts`, build it with `createStore` + `subscribeWithSelector`, and export a strongly-typed `use<Feature>Store` hook built from `useStoreWithEqualityFn`. Store modules must stay host-agnostic—no `window`, `document`, or React hooks inside.
- **Mandatory**: React surfaces consume stores exclusively through selector hooks; components may not call `tenantStore.getState()` or interact with storage items. Actions inside the store own every side effect, including persistence and messaging.
- **Mandatory**: Background, content, or other non-React contexts access stores via `store.subscribe`, `store.getState()`, or `store.getInitialState()`. Pulling React hooks into those files is prohibited.
- **Mandatory**: Classify stores before implementation:
  1. Persistent store = storage item + `hydrate/ready` + watch.
  2. Runtime shared store (no persistence) = vanilla Zustand store without storage bindings.
  3. Pure UI/local state = React hooks/state inside components and must not live in `lib/state`.
  Document the chosen category and storage key(s) in every PR description.
- **Recommended**: After adding or modifying a store, run a manual loop: trigger the action in the popup, inspect the UI update, and confirm background logs show the same change. Finish with `bun run compile` to keep typing strict.

## Enforcement & Ops
- Reviewers will request changes for any direct storage access or deviations from this document. Submissions that reach into `browser.storage*`/`localStorage` outside `lib/state` must be refactored before approval.
- New contributors must read this file alongside `lib/state/tenant-store.ts` prior to shipping persistent functionality. Copy that template when scaffolding new stores and adapt only the types, key names, and actions needed.
