import { storage } from 'wxt/utils/storage';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createStore } from './create-store';
import { tenantInfoStore } from './tenant-info-store';

import type { Tenant, TenantId } from '@/types/tenant';

export { getSelectedTenant } from './selectors';

// Define persisted data structure
type TenantPersistedState = {
  selectedTenantId: TenantId;
  tenantList: Tenant[];
};

// Define complete store state
export type TenantStoreState = {
  // Persisted fields
  selectedTenantId: TenantId;
  tenantList: Tenant[];

  // Runtime fields
  ready: boolean;

  // Basic setters (with persistence)
  setSelectedTenantId: (tenantId: TenantId) => Promise<void>;
  setTenantList: (tenants: Tenant[]) => Promise<void>;
  addTenant: (tenant: Tenant) => Promise<void>;
  updateTenant: (id: TenantId, updates: Partial<Tenant>) => Promise<void>;
  removeTenant: (id: TenantId) => Promise<void>;

  // Internal methods
  hydrate: () => Promise<void>;
};

// Define storage item
const tenantStorageItem = storage.defineItem<TenantPersistedState>('local:tenant', {
  fallback: {
    selectedTenantId: '',
    tenantList: [],
  },
});

// Create store using factory function
export const tenantStore = createStore<
  TenantStoreState,
  TenantPersistedState,
  'selectedTenantId' | 'tenantList'
>({
  storageItem: tenantStorageItem,

  // Configure which fields to persist
  persistConfig: {
    keys: ['selectedTenantId', 'tenantList'],
  },

  // Create store state and actions
  createState: (set, get, persist) => ({
    // Initial state
    ready: false,
    selectedTenantId: '',
    tenantList: [],

    // Basic setters - using simplified persist() API
    setSelectedTenantId: async (tenantId) => {
      set((state) => {
        state.selectedTenantId = tenantId;
      });
      // Only need to provide changed field, others auto-merged
      await persist({ selectedTenantId: tenantId });
    },

    setTenantList: async (tenants) => {
      set((state) => {
        state.tenantList = tenants;
      });
      await persist({ tenantList: tenants });
    },

    addTenant: async (tenant) => {
      const existing = get().tenantList.find(
        (t) => t.url === tenant.url && t.userId === tenant.userId,
      );
      if (existing) {
        throw new Error(`账号已存在：${existing.name}`);
      }
      set((state) => {
        state.tenantList.push(tenant);
      });
      // Auto-merges selectedTenantId from current state
      await persist({});
    },

    updateTenant: async (id, updates) => {
      set((state) => {
        const tenant = state.tenantList.find((t) => t.id === id);
        if (tenant) Object.assign(tenant, updates);
      });
      await persist({});
    },

    removeTenant: async (id) => {
      set((state) => {
        state.tenantList = state.tenantList.filter((t) => t.id !== id);
      });
      tenantInfoStore.getState().removeTenantInfo(id);
      await persist({});
    },

    // hydrate is injected by createPersistentStore
    hydrate: async () => {
      // Implemented by factory function
    },
  }),
});

export const useTenantStore = <T>(
  selector: (state: TenantStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(tenantStore, selector, equalityFn);
