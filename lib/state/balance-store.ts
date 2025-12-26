import { storage } from 'wxt/utils/storage';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createStore } from './create-store';
import type { TenantId } from '@/types/tenant';
import type { Balance } from '@/lib/api/adapters';

// Define persisted data structure
type BalancePersistedState = {
  balanceMap: Record<TenantId, Balance>;
};

// Define complete store state
export type BalanceStoreState = {
  // Persisted fields
  balanceMap: Record<TenantId, Balance>;

  // Runtime fields
  ready: boolean;

  // Actions
  setBalance: (tenantId: TenantId, balance: Balance) => Promise<void>;
  getBalance: (tenantId: TenantId) => Balance | undefined;
  removeBalance: (tenantId: TenantId) => Promise<void>;
  clearAllBalances: () => Promise<void>;

  // Internal methods
  hydrate: () => Promise<void>;
};

// Define storage item
const balanceStorageItem = storage.defineItem<BalancePersistedState>('local:balance', {
  fallback: {
    balanceMap: {},
  },
});

// Create store using factory function
export const balanceStore = createStore<BalanceStoreState, BalancePersistedState, 'balanceMap'>({
  storageItem: balanceStorageItem,

  persistConfig: {
    keys: ['balanceMap'],
  },

  createState: (set, get, persist) => ({
    ready: false,
    balanceMap: {},

    setBalance: async (tenantId, balance) => {
      set((state) => {
        state.balanceMap[tenantId] = balance;
      });
      await persist({});
    },

    getBalance: (tenantId) => get().balanceMap[tenantId],

    removeBalance: async (tenantId) => {
      set((state) => {
        delete state.balanceMap[tenantId];
      });
      await persist({});
    },

    clearAllBalances: async () => {
      set((state) => {
        state.balanceMap = {};
      });
      await persist({ balanceMap: {} });
    },

    hydrate: async () => {
      // Implemented by factory function
    },
  }),
});

export const useBalanceStore = <T>(
  selector: (state: BalanceStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(balanceStore, selector, equalityFn);
