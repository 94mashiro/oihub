# Storage & Global State Rulebook

## Context
- This WXT extension shares configuration across popup, background, and content contexts via the `storage` permission and `@wxt-dev/storage` (see `wxt.config.ts:7-32`). Every persistent value must travel through that layer.
- `lib/state/tenant-store.ts` showcases the canonical pattern: factory function `createPersistentStore` from `lib/state/create-persistent-store.ts` + selective field persistence + automatic cross-context synchronization. The rules below generalize that template for all current and future stores.

## Storage Rules

### File Organization & Naming
- **Mandatory**: State management lives exclusively under `lib/state/`:
  - Store module: `lib/state/<feature>-store.ts` (e.g., `tenant-store.ts`, `theme-store.ts`)
  - Storage key: `<scope>:<feature>` (e.g., `local:tenant`, `sync:theme`)
  - The `<feature>` segment must match exactly between the module name and storage key.
  - **Example**: Module `lib/state/tenant-store.ts` defines storage key `local:tenant` (NOT `local:tenant-selection` or `local:tenant-store`).
- **Mandatory**: Choose storage scope intentionally:
  - `local`: device-only config (does not sync across devices)
  - `sync`: account-sync data (syncs via browser account)
  - `session`: ephemeral session data (cleared on browser restart)
- **Mandatory**: Core infrastructure files:
  - `lib/state/create-persistent-store.ts` - Factory function for persistent stores
  - `lib/state/types.ts` - Shared type definitions for state management

### Storage Item Definition
- **Mandatory**: Any value that needs to survive reloads or be visible across contexts must be declared via `storage.defineItem` under `lib/state`. Components, hooks, and entrypoints may NOT touch `browser.storage*`, `localStorage`, or ad-hoc caches directly.
- **Mandatory**: Each storage item must:
  - Describe its full TypeScript shape (use a dedicated type for persisted data)
  - Provide a `fallback` value that is render-safe (no `undefined` that would break React)
  - Add a `version` field when data migrations are required

### Persistent Store Pattern (Mandatory)
- **Mandatory**: Use `createPersistentStore` factory function from `lib/state/create-persistent-store.ts` for ALL stores that need persistence.
- **Mandatory**: Define three types for each store:
  1. `<Feature>PersistedState` - The exact data structure stored in WXT storage
  2. `<Feature>StoreState` - Complete store state (persisted fields + runtime fields + actions)
  3. Type union for persisted keys (e.g., `'selectedTenantId' | 'tenantList'`)

### Selective Persistence
- **Mandatory**: Configure `persistConfig.keys` to explicitly declare which fields to persist. This enables:
  - Runtime-only fields (e.g., `ready`, `loading`, computed values) that never hit storage
  - Clear separation between persisted data and transient state
  - Type-safe persistence with compile-time checks
- **Mandatory**: Use the `persist()` helper function provided by `createPersistentStore` for all write operations:
  ```typescript
  await persist((state) => ({
    selectedTenantId: newId,
    tenantList: state.tenantList,
  }));
  ```
  - The `persist()` helper automatically merges updates with existing persisted data
  - Always include ALL persisted fields in the updater return value
  - Update in-memory state via `set()` FIRST, then call `persist()`, so UI never lags

### Hydration & Initialization
- **Automatic**: The `createPersistentStore` factory automatically handles hydration timing via `queueMicrotask`. Developers do NOT need to manually call `hydrate()` at module initialization.
- **Mandatory**: Every persistent store MUST include a `ready: boolean` field. This flag indicates whether hydration has completed. UI components must check `ready` before rendering forms or persisted data:
  ```typescript
  const ready = useTenantStore((state) => state.ready);
  if (!ready) return <LoadingSpinner />;
  ```
- **Critical**: The `ready` flag is set to `true` after hydration completes (or fails with fallback). Even on storage errors, `ready` becomes `true` to allow usage with fallback values.

### Cross-Context Synchronization
- **Automatic**: `createPersistentStore` sets up `storageItem.watch` internally to synchronize state across popup, background, and content contexts. Changes in one context automatically propagate to others.
- **Mandatory**: NEVER manually call `storageItem.setValue` from inside a `watch` callback, as this creates infinite loops. The factory function's `applySnapshot` is read-only and safe.

### Action Patterns
- **Mandatory**: All actions that modify persisted state MUST be async and return `Promise<void>`.
- **Mandatory**: Use immer-style direct mutation in `set()` callbacks (immer middleware is built into `createPersistentStore`):
  ```typescript
  // Simple assignment
  set((state) => { state.selectedTenantId = tenantId; });

  // Array operations
  set((state) => { state.tenantList.push(tenant); });
  set((state) => { state.tenantList = state.tenantList.filter(t => t.id !== id); });

  // Deep nested updates
  set((state) => {
    const tenant = state.tenantList.find(t => t.id === id);
    if (tenant) Object.assign(tenant, updates);
  });

  // Object operations
  set((state) => { state.balanceList[tenantId] = balance; });
  set((state) => { delete state.balanceList[tenantId]; });
  ```
- **Mandatory**: Complete action pattern:
  ```typescript
  setSelectedTenantId: async (tenantId) => {
    set((state) => { state.selectedTenantId = tenantId; });
    await persist((state) => ({
      selectedTenantId: tenantId,
      tenantList: state.tenantList,
    }));
  },
  ```

## Global State Rules

### Store Creation & Consumption
- **Mandatory**: All stores live in `lib/state/<feature>-store.ts`. For persistent stores, use `createPersistentStore`; for runtime-only stores, use `createStore` with `subscribeWithSelector` middleware.
- **Mandatory**: Export a strongly-typed hook for React consumption:
  ```typescript
  export const useTenantStore = <T>(
    selector: (state: TenantStoreState) => T,
    equalityFn?: (a: T, b: T) => boolean,
  ) => useStoreWithEqualityFn(tenantStore, selector, equalityFn);
  ```
- **Mandatory**: Store modules must be host-agnostic—NO `window`, `document`, or React hooks inside store files. Actions encapsulate all side effects.

### React Component Consumption
- **Mandatory**: React components consume stores ONLY through selector hooks:
  ```typescript
  const ready = useTenantStore((state) => state.ready);
  const setTenantId = useTenantStore((state) => state.setSelectedTenantId);
  ```
- **Prohibited**: Components may NOT call `tenantStore.getState()` or interact with storage items directly. Actions inside the store own persistence and messaging.

### Non-React Context Consumption
- **Mandatory**: Background, content, or other non-React contexts access stores via:
  - `store.getState()` - Read current state synchronously
  - `store.getInitialState()` - Read initial state before hydration
  - `store.subscribe()` - Listen to state changes
- **Prohibited**: Pulling React hooks (`useStoreWithEqualityFn`, etc.) into background/content scripts.

### Store Classification
- **Mandatory**: Before implementing a new store, classify it and document the category:
  1. **Persistent store**: Requires `createPersistentStore` + storage item + `ready` flag
     - Example: `tenant-store.ts` (syncs tenant selection across contexts)
  2. **Runtime shared store**: Use `createStore` without persistence
     - Example: UI modal state shared between popup components
  3. **Pure component state**: Use React hooks (`useState`, `useReducer`) inside components
     - Example: Form input values, accordion open/closed state
- **Mandatory**: Include the store category and storage key (if applicable) in PR descriptions.

### Helper Functions & Computed Values
- **Recommended**: For derived values, export helper functions instead of storing computed state:
  ```typescript
  export const getSelectedTenant = (state: TenantStoreState): Tenant | null => {
    return state.tenantList.find((t) => t.id === state.selectedTenantId) ?? null;
  };

  // Usage in components:
  const selectedTenant = useTenantStore((state) => getSelectedTenant(state));
  ```
- **Rationale**: Computed values should not be persisted. Helper functions keep persistence config clean and avoid stale data.

## Implementation Checklist

### Creating a New Persistent Store
1. **Define types** (`lib/state/<feature>-store.ts`):
   ```typescript
   type FeaturePersistedState = {
     field1: string;
     field2: number;
   };

   export type FeatureStoreState = {
     // Persisted fields
     field1: string;
     field2: number;

     // Runtime fields
     ready: boolean;

     // Actions
     setField1: (value: string) => Promise<void>;
     hydrate: () => Promise<void>;
   };
   ```

2. **Declare storage item**:
   ```typescript
   const featureStorageItem = storage.defineItem<FeaturePersistedState>('local:feature', {
     fallback: {
       field1: '',
       field2: 0,
     },
   });
   ```

3. **Create store with factory** (immer middleware is built-in, use direct mutation):
   ```typescript
   export const featureStore = createPersistentStore<
     FeatureStoreState,
     FeaturePersistedState,
     'field1' | 'field2'
   >({
     storageItem: featureStorageItem,
     persistConfig: {
       keys: ['field1', 'field2'],
     },
     createState: (set, get, persist) => ({
       ready: false,
       field1: '',
       field2: 0,

       setField1: async (value) => {
         set((state) => { state.field1 = value; });
         await persist((state) => ({
           field1: value,
           field2: state.field2,
         }));
       },

       hydrate: async () => {},
     }),
   });
   ```

4. **Export React hook**:
   ```typescript
   export const useFeatureStore = <T>(
     selector: (state: FeatureStoreState) => T,
     equalityFn?: (a: T, b: T) => boolean,
   ) => useStoreWithEqualityFn(featureStore, selector, equalityFn);
   ```

5. **Guard UI rendering**:
   ```typescript
   const ready = useFeatureStore((state) => state.ready);
   if (!ready) return <LoadingSpinner />;
   ```

### Testing New Stores
- **Recommended**: After adding or modifying a store, perform this manual verification loop:
  1. Trigger actions from the popup UI
  2. Inspect state updates in React DevTools
  3. Check background console for synchronization logs (`store.subscribe` output)
  4. Reload extension and verify `hydrate()` restores previous state
  5. Run `bun run compile` to ensure type safety

## Enforcement & Ops

### Code Review Requirements
- **Reviewers will reject**: Any direct storage access (`browser.storage*`, `localStorage`) outside `lib/state` modules.
- **Reviewers will reject**: Persistent stores that don't use the `createPersistentStore` factory function.
- **Reviewers will reject**: Missing `ready` flag checks in UI components that render persisted data.
- **Reviewers will reject**: Actions that call `storageItem.setValue` directly instead of using the `persist()` helper.
- **Reviewers will require**: PR descriptions to document the store category (persistent/runtime/component) and storage key.

### Onboarding Checklist
New contributors must read these files before implementing persistent state:
1. `docs/storage-state-rules.md` (this document)
2. `lib/state/create-persistent-store.ts` (factory implementation)
3. `lib/state/types.ts` (type definitions)
4. `lib/state/tenant-store.ts` (canonical example)

### Scaffolding Template
When creating a new persistent store, copy `lib/state/tenant-store.ts` and adapt:
- Replace `Tenant` types with your feature types
- Update storage key from `local:tenant` to `<scope>:<feature>`
- Modify `persistConfig.keys` to match your persisted fields
- Implement feature-specific actions following the `set() → persist()` pattern

### Migration Guide (from old pattern)
If you encounter stores using the old pattern (manual `hydrate()`, `queueMicrotask`, `storageItem.setValue`), refactor to `createPersistentStore`:
1. Extract persisted field types into `<Feature>PersistedState`
2. Replace manual `createStore` + `hydrate` with `createPersistentStore` factory
3. Configure `persistConfig.keys` for selective persistence
4. Replace `storageItem.setValue()` calls with `persist()` helper
5. Remove manual `queueMicrotask(() => void hydrate())` (now automatic)

See `lib/state/tenant-store.ts` commit history for a real-world migration example.
