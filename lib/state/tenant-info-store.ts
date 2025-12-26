/**
 * Tenant Info Store
 *
 * Stores runtime tenant info data fetched from platform APIs.
 * Persisted to storage for better UX (no need to refetch on restart).
 */

import { storage } from 'wxt/utils/storage';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createStore } from './create-store';
import type { TenantId, TenantInfo } from '@/types/tenant';

// Define persisted data structure
type TenantInfoPersistedState = {
  tenantInfoMap: Record<TenantId, TenantInfo>;
};

// Define complete store state
export type TenantInfoStoreState = {
  // Persisted fields
  tenantInfoMap: Record<TenantId, TenantInfo>;

  // Runtime fields
  ready: boolean;

  // Actions
  setTenantInfo: (tenantId: TenantId, info: TenantInfo) => Promise<void>;
  removeTenantInfo: (tenantId: TenantId) => Promise<void>;
  getTenantInfo: (tenantId: TenantId) => TenantInfo | undefined;

  // Internal methods
  hydrate: () => Promise<void>;
};

// Define storage item
const tenantInfoStorageItem = storage.defineItem<TenantInfoPersistedState>('local:tenant-info', {
  fallback: {
    tenantInfoMap: {},
  },
});

// Create store using factory function
export const tenantInfoStore = createStore<
  TenantInfoStoreState,
  TenantInfoPersistedState,
  'tenantInfoMap'
>({
  storageItem: tenantInfoStorageItem,

  persistConfig: {
    keys: ['tenantInfoMap'],
  },

  createState: (set, get, persist) => ({
    ready: false,
    tenantInfoMap: {},

    setTenantInfo: async (tenantId, info) => {
      set((state) => {
        state.tenantInfoMap[tenantId] = info;
      });
      await persist({});
    },

    getTenantInfo: (tenantId) => get().tenantInfoMap[tenantId],

    removeTenantInfo: async (tenantId) => {
      set((state) => {
        delete state.tenantInfoMap[tenantId];
      });
      await persist({});
    },

    hydrate: async () => {
      // Implemented by factory function
    },
  }),
});

export const useTenantInfoStore = <T>(
  selector: (state: TenantInfoStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(tenantInfoStore, selector, equalityFn);
