import { storage } from '#imports';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { produce } from 'immer';
import { createPersistentStore } from './create-persistent-store';
import { createOneAPIClient } from '@/lib/api/oneapi/client';

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
  fetchTenantInfo: (tenantId: string) => Promise<void>;

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
      set((state) => ({ ...state, selectedTenantId: tenantId }));
      await persist((state) => ({
        selectedTenantId: tenantId,
        tenantList: state.tenantList,
      }));
    },

    setTenantList: async (tenants) => {
      set((state) => ({ ...state, tenantList: tenants }));
      await persist((state) => ({
        selectedTenantId: state.selectedTenantId,
        tenantList: tenants,
      }));
    },

    addTenant: async (tenant) => {
      const newList = [...get().tenantList, tenant];
      set((state) => ({ ...state, tenantList: newList }));
      await persist((state) => ({
        selectedTenantId: state.selectedTenantId,
        tenantList: newList,
      }));
    },

    updateTenant: async (id, updates) => {
      const newList = produce(get().tenantList, (draft) => {
        const tenant = draft.find((t) => t.id === id);
        if (tenant) {
          Object.assign(tenant, updates);
        }
      });
      set((state) => ({ ...state, tenantList: newList }));
      await persist((state) => ({
        selectedTenantId: state.selectedTenantId,
        tenantList: newList,
      }));
    },

    removeTenant: async (id) => {
      const newList = get().tenantList.filter((t) => t.id !== id);
      set((state) => ({ ...state, tenantList: newList }));
      await persist((state) => ({
        selectedTenantId: state.selectedTenantId,
        tenantList: newList,
      }));
    },

    // Async business actions
    fetchTenantInfo: async (tenantId) => {
      try {
        const tenant = get().tenantList.find((t) => t.id === tenantId);
        if (!tenant) return;

        const client = createOneAPIClient({
          baseURL: tenant.url,
          token: tenant.token,
          userId: tenant.userId,
        });

        const info = await client.get<TenantInfo>('/api/status');

        // Update memory state with immer - 支持深层字段更新
        const newList = produce(get().tenantList, (draft) => {
          const target = draft.find((t) => t.id === tenantId);
          if (target) {
            if (!target.info) target.info = {} as TenantInfo;
            target.info.quota_per_unit = info.quota_per_unit;
            target.info.usd_exchange_rate = info.usd_exchange_rate;
            target.info.api_info = info.api_info;
          }
        });

        set((state) => ({ ...state, tenantList: newList }));

        // Selective persistence - persist the tenant info
        await persist((state) => ({
          selectedTenantId: state.selectedTenantId,
          tenantList: newList,
        }));
      } catch (error) {
        console.error('[fetchTenantInfo] Failed:', error);
      }
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
