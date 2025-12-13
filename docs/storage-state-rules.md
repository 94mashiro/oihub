# Storage & Global State Rulebook

## Quick Reference (Core Rules)

**Storage Location:**
- All state management lives in `lib/state/<feature>-store.ts`
- Storage key format: `<scope>:<feature>` (e.g., `local:tenant`)
- Never use `browser.storage*` or `localStorage` directly

**Store Pattern:**
- Use `createStore` from `lib/state/create-store.ts` for ALL stores
- All stores are persistent by default with automatic cross-context sync
- Always include a `ready: boolean` field for hydration status

**React Consumption:**
- Access stores ONLY through selector hooks: `useTenantStore((state) => state.field)`
- Always check `ready` state before rendering forms
- Never call `store.getState()` in React components

**Persistence:**
- Use simplified `persist()` helper: `await persist({ changedField: value })`
- Update in-memory state via `set()` FIRST, then call `persist()`
- For mutations, use empty object: `await persist({})`

---

## Storage Scopes

| Scope | Usage |
|-------|-------|
| `local:` | Device-only config (does not sync) |
| `sync:` | Account-sync data (syncs via browser account) |
| `session:` | Ephemeral data (cleared on restart) |

---

## Store Implementation

### Type Definitions

```typescript
// 1. Persisted state shape
type FeaturePersistedState = {
  field1: string;
  field2: number;
};

// 2. Complete store state
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

### Store Creation

```typescript
import { storage } from '@wxt-dev/storage';
import { createStore } from '@/lib/state/create-store';

const featureStorageItem = storage.defineItem<FeaturePersistedState>('local:feature', {
  fallback: { field1: '', field2: 0 },
});

export const featureStore = createStore<
  FeatureStoreState,
  FeaturePersistedState,
  'field1' | 'field2'
>({
  storageItem: featureStorageItem,
  persistConfig: { keys: ['field1', 'field2'] },
  createState: (set, get, persist) => ({
    ready: false,
    field1: '',
    field2: 0,

    setField1: async (value) => {
      set((state) => { state.field1 = value; });
      await persist({ field1: value });
    },

    hydrate: async () => {},
  }),
});

// React hook
export const useFeatureStore = <T>(
  selector: (state: FeatureStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(featureStore, selector, equalityFn);
```

### Action Patterns

```typescript
// Simple field update
setField: async (value) => {
  set((state) => { state.field = value; });
  await persist({ field: value });
},

// Array mutation
addItem: async (item) => {
  set((state) => { state.items.push(item); });
  await persist({});  // Auto-merges all persisted fields
},

// Multiple fields
updateMultiple: async (updates) => {
  set((state) => {
    state.field1 = updates.field1;
    state.field2 = updates.field2;
  });
  await persist({ field1: updates.field1, field2: updates.field2 });
},
```

---

## React Usage

```typescript
// Always check ready state
const ready = useFeatureStore((state) => state.ready);
if (!ready) return <LoadingSpinner />;

// Or use StoreReadyGuard
<StoreReadyGuard store={featureStore} fallback={<LoadingSpinner />}>
  <FeatureForm />
</StoreReadyGuard>

// Select specific fields
const field1 = useFeatureStore((state) => state.field1);
const setField1 = useFeatureStore((state) => state.setField1);

// Computed values via helper functions
const selectedTenant = useTenantStore((state) => getSelectedTenant(state));
```

---

## Non-React Usage

```typescript
// Background/content scripts
const state = featureStore.getState();
featureStore.subscribe((state) => { /* handle changes */ });
```

---

## Code Review Checklist

Reviewers will reject:
- [ ] Direct storage access outside `lib/state`
- [ ] Stores not using `createStore` factory
- [ ] Missing `ready` flag checks in UI
- [ ] Actions calling `storageItem.setValue` directly
- [ ] Old verbose `persist((state) => ({ ... }))` pattern

---

## Migration Guide

From old patterns to `createStore`:
1. Extract persisted fields into `<Feature>PersistedState` type
2. Replace manual patterns with `createStore` from `lib/state/create-store.ts`
3. Configure `persistConfig.keys` for selective persistence
4. Replace `storageItem.setValue()` with `persist()` helper
5. Remove manual `queueMicrotask(() => void hydrate())`
6. Add ready state checks in components

See `lib/state/tenant-store.ts` for the canonical example.

---

## Reference

- **Factory**: `lib/state/create-store.ts`
- **Types**: `lib/state/types.ts`
- **Guard**: `lib/state/store-ready-guard.tsx`
- **Example**: `lib/state/tenant-store.ts`
