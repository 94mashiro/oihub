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
  - `lib/state/store-ready-guard.tsx` - Ready state guard utilities (HOC, Hook, Component)

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
- **Mandatory**: Use the simplified `persist()` helper function for all write operations:
  ```typescript
  // NEW: Simplified API - only provide changed fields
  await persist({ selectedTenantId: newId });
  // Automatically merges all other persisted fields (e.g., tenantList)
  
  // For multiple field updates:
  await persist({ field1: value1, field2: value2 });
  
  // For state mutations (arrays/objects), empty object auto-merges all:
  set((state) => { state.tenantList.push(tenant); });
  await persist({}); // Auto-merges all persisted fields from current state
  ```
  - The `persist()` helper automatically merges provided updates with all other persisted fields
  - **Only need to provide fields that changed** - other persisted fields are auto-merged
  - Update in-memory state via `set()` FIRST, then call `persist()`, so UI never lags
  - Empty object `{}` persists all persisted fields from current state (useful after mutations)

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
- **Mandatory**: Complete action pattern (simplified):
  ```typescript
  // Simple field update
  setSelectedTenantId: async (tenantId) => {
    set((state) => { state.selectedTenantId = tenantId; });
    await persist({ selectedTenantId: tenantId }); // Only changed field needed
  },

  // Array mutation - use empty object to auto-merge all persisted fields
  addTenant: async (tenant) => {
    set((state) => { state.tenantList.push(tenant); });
    await persist({}); // Auto-merges selectedTenantId and tenantList
  },

  // Multiple field updates
  updateMultipleFields: async (updates) => {
    set((state) => {
      state.field1 = updates.field1;
      state.field2 = updates.field2;
    });
    await persist({ field1: updates.field1, field2: updates.field2 });
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
- **Mandatory**: Always check `ready` state before rendering persisted data:
  ```typescript
  const ready = useTenantStore((state) => state.ready);
  if (!ready) return <LoadingSpinner />;
  
  // Or use StoreReadyGuard component:
  <StoreReadyGuard store={tenantStore} fallback={<LoadingSpinner />}>
    <TenantList />
  </StoreReadyGuard>
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
         // Simplified: only provide changed field, others auto-merged
         await persist({ field1: value });
       },

       mutateField2: async () => {
         set((state) => { state.field2++; });
         // For mutations, empty object auto-merges all persisted fields
         await persist({});
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
- **Reviewers will reject**: Using old verbose `persist((state) => ({ ... }))` pattern instead of simplified `persist({ ... })`.
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

### Migration Guide

#### From Old Pattern (manual hydration)
If you encounter stores using the old pattern (manual `hydrate()`, `queueMicrotask`, `storageItem.setValue`), refactor to `createPersistentStore`:
1. Extract persisted field types into `<Feature>PersistedState`
2. Replace manual `createStore` + `hydrate` with `createPersistentStore` factory
3. Configure `persistConfig.keys` for selective persistence
4. Replace `storageItem.setValue()` calls with simplified `persist()` helper
5. Remove manual `queueMicrotask(() => void hydrate())` (now automatic)
6. Add ready state checks in components

#### From Old Persist API (verbose)
If you have stores using the old verbose `persist()` API:
```typescript
// Old (verbose, error-prone):
await persist((state) => ({
  field1: newValue,
  field2: state.field2, // Must manually include all fields
}));

// New (simplified, safe):
await persist({ field1: newValue }); // Auto-merges field2
```

Migration steps:
1. Replace `persist((state) => ({ ... }))` with `persist({ ... })`
2. Remove manual field merging - only provide changed fields
3. For mutations, use empty object: `await persist({})`

See `lib/state/tenant-store.ts` for the canonical example.
