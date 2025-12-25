import { storage } from 'wxt/utils/storage';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createStore } from './create-store';
import type { TenantId } from '@/types/tenant';
import type { Balance } from '@/lib/api/adapters';

// Define persisted data structure
type BalancePersistedState = {
  balanceList: Record<TenantId, Balance>;
};

// Define complete store state
export type BalanceStoreState = {
  // Persisted fields
  balanceList: Record<TenantId, Balance>;

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
    balanceList: {},
  },
});

// Create store using factory function
export const balanceStore = createStore<BalanceStoreState, BalancePersistedState, 'balanceList'>({
  storageItem: balanceStorageItem,

  persistConfig: {
    keys: ['balanceList'],
  },

  createState: (set, get, persist) => ({
    ready: false,
    balanceList: {},

    setBalance: async (tenantId, balance) => {
      set((state) => {
        state.balanceList[tenantId] = balance;
      });
      await persist({});
    },

    getBalance: (tenantId) => get().balanceList[tenantId],

    removeBalance: async (tenantId) => {
      set((state) => {
        delete state.balanceList[tenantId];
      });
      await persist({});
    },

    clearAllBalances: async () => {
      set((state) => {
        state.balanceList = {};
      });
      await persist({ balanceList: {} });
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
