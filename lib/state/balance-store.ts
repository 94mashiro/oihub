import { storage } from '#imports';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createPersistentStore } from './create-persistent-store';
import type { TenantId } from '@/types/tenant';

// Balance data structure per tenant
export interface TenantBalance {
  id: number;
  username: string;
  display_name: string;
  email: string;
  role: number;
  status: number;
  group: string;
  quota: number;
  used_quota: number;
  request_count: number;
  aff_code: string;
  aff_count: number;
  aff_quota: number;
  aff_history_quota: number;
  inviter_id: number;
  github_id: string;
  telegram_id: string;
  wechat_id: string;
  linux_do_id: string;
  oidc_id: string;
  stripe_customer: string;
  setting: string;
  sidebar_modules: string;
  permissions: {
    sidebar_modules: {
      admin: boolean;
    };
    sidebar_settings: boolean;
  };
}

// Define persisted data structure
type BalancePersistedState = {
  balanceList: Record<TenantId, TenantBalance>;
};

// Define complete store state
export type BalanceStoreState = {
  // Persisted fields
  balanceList: Record<TenantId, TenantBalance>;

  // Runtime fields
  ready: boolean;

  // Actions
  setBalance: (tenantId: TenantId, balance: TenantBalance) => Promise<void>;
  getBalance: (tenantId: TenantId) => TenantBalance | undefined;
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
export const balanceStore = createPersistentStore<
  BalanceStoreState,
  BalancePersistedState,
  'balanceList'
>({
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
      await persist((state) => ({ balanceList: state.balanceList }));
    },

    getBalance: (tenantId) => get().balanceList[tenantId],

    removeBalance: async (tenantId) => {
      set((state) => {
        delete state.balanceList[tenantId];
      });
      await persist((state) => ({ balanceList: state.balanceList }));
    },

    clearAllBalances: async () => {
      set((state) => {
        state.balanceList = {};
      });
      await persist(() => ({ balanceList: {} }));
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
