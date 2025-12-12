import { storage } from '#imports';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createStore } from './create-store';
import type { TenantId } from '@/types/tenant';
import { CostPeriod } from '@/types/api';

export interface CostData {
  count: number;
  created_at: number;
  id: number;
  model_name: string;
  quota: number;
  token_used: number;
  user_id: number;
  username: string;
}

// Define persisted data structure
type CostPersistedState = {
  costList: Record<TenantId, Partial<Record<CostPeriod, CostData[]>>>;
};

// Define complete store state
export type CostStoreState = {
  // Persisted fields
  costList: Record<TenantId, Partial<Record<CostPeriod, CostData[]>>>;

  // Runtime fields
  ready: boolean;

  // Actions
  setCost: (tenantId: TenantId, period: CostPeriod, costs: CostData[]) => Promise<void>;
  getCost: (tenantId: TenantId, period: CostPeriod) => CostData[] | undefined;

  // Internal methods
  hydrate: () => Promise<void>;
};

// Define storage item
const costStorageItem = storage.defineItem<CostPersistedState>('local:cost', {
  fallback: {
    costList: {},
  },
});

// Create store using factory function
export const costStore = createStore<
  CostStoreState,
  CostPersistedState,
  'costList'
>({
  storageItem: costStorageItem,

  persistConfig: {
    keys: ['costList'],
  },

  createState: (set, get, persist) => ({
    ready: false,
    costList: {},

    setCost: async (tenantId, period, costs) => {
      set((state) => {
        if (!state.costList[tenantId]) {
          state.costList[tenantId] = {};
        }
        state.costList[tenantId][period] = costs;
      });
      await persist({});
    },

    getCost: (tenantId, period) => get().costList[tenantId]?.[period],

    hydrate: async () => {
      // Implemented by factory function
    },
  }),
});

export const useCostStore = <T>(
  selector: (state: CostStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(costStore, selector, equalityFn);
