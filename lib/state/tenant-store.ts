import { storage } from '#imports';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createPersistentStore } from './create-persistent-store';

import type { Tenant, TenantInfo } from '@/types/tenant';

// Define persisted data structure
type TenantPersistedState = {
  selectedTenantId: string;
  tenantList: Tenant[];
};

// Define complete store state
export type TenantStoreState = {
  // Persisted fields
  selectedTenantId: string;
  tenantList: Tenant[];

  // Runtime fields
  ready: boolean;

  // Basic setters (with persistence)
  setSelectedTenantId: (tenantId: string) => Promise<void>;
  setTenantList: (tenants: Tenant[]) => Promise<void>;
  addTenant: (tenant: Tenant) => Promise<void>;
  updateTenant: (id: string, updates: Partial<Tenant>) => Promise<void>;
  removeTenant: (id: string) => Promise<void>;

  // Async business actions (selective persistence)
  updateTenantInfo: (tenantId: string, info: TenantInfo) => Promise<void>;

  // Internal methods
  hydrate: () => Promise<void>;
};

/**
 * Helper function to compute selectedTenant from state
 * Use this in selectors instead of storing selectedTenant in state
 */
export const getSelectedTenant = (state: TenantStoreState): Tenant | null => {
  return state.tenantList.find((t) => t.id === state.selectedTenantId) ?? null;
};

// Define storage item
const tenantStorageItem = storage.defineItem<TenantPersistedState>('local:tenant', {
  fallback: {
    selectedTenantId: '',
    tenantList: [],
  },
});

// Create store using factory function
export const tenantStore = createPersistentStore<
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

    // Basic setters - using persist() helper
    setSelectedTenantId: async (tenantId) => {
      set((state) => {
        state.selectedTenantId = tenantId;
      });
      await persist((state) => ({
        selectedTenantId: tenantId,
        tenantList: state.tenantList,
      }));
    },

    setTenantList: async (tenants) => {
      set((state) => {
        state.tenantList = tenants;
      });
      await persist((state) => ({
        selectedTenantId: state.selectedTenantId,
        tenantList: tenants,
      }));
    },

    addTenant: async (tenant) => {
      set((state) => {
        state.tenantList.push(tenant);
      });
      await persist((state) => ({
        selectedTenantId: state.selectedTenantId,
        tenantList: state.tenantList,
      }));
    },

    updateTenant: async (id, updates) => {
      set((state) => {
        const tenant = state.tenantList.find((t) => t.id === id);
        if (tenant) Object.assign(tenant, updates);
      });
      await persist((state) => ({
        selectedTenantId: state.selectedTenantId,
        tenantList: state.tenantList,
      }));
    },

    removeTenant: async (id) => {
      set((state) => {
        state.tenantList = state.tenantList.filter((t) => t.id !== id);
      });
      await persist((state) => ({
        selectedTenantId: state.selectedTenantId,
        tenantList: state.tenantList,
      }));
    },

    // Async business actions
    updateTenantInfo: async (tenantId, info) => {
      set((state) => {
        const target = state.tenantList.find((t) => t.id === tenantId);
        if (target) target.info = info;
      });
      await persist((state) => ({
        selectedTenantId: state.selectedTenantId,
        tenantList: state.tenantList,
      }));
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
