import { storage } from 'wxt/utils/storage';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createStore } from './create-store';
import type { TenantId } from '@/types/tenant';
import { CostPeriod } from '@/types/api';
import type { Cost } from '@/lib/api/adapters';

// Define persisted data structure
type CostPersistedState = {
  costMap: Record<TenantId, Partial<Record<CostPeriod, Cost[]>>>;
};

// Define complete store state
export type CostStoreState = {
  // Persisted fields
  costMap: Record<TenantId, Partial<Record<CostPeriod, Cost[]>>>;

  // Runtime fields
  ready: boolean;

  // Actions
  setCost: (tenantId: TenantId, period: CostPeriod, costs: Cost[]) => Promise<void>;
  getCost: (tenantId: TenantId, period: CostPeriod) => Cost[] | undefined;

  // Internal methods
  hydrate: () => Promise<void>;
};

// Define storage item
const costStorageItem = storage.defineItem<CostPersistedState>('local:cost', {
  fallback: {
    costMap: {},
  },
});

// Create store using factory function
export const costStore = createStore<CostStoreState, CostPersistedState, 'costMap'>({
  storageItem: costStorageItem,

  persistConfig: {
    keys: ['costMap'],
  },

  createState: (set, get, persist) => ({
    ready: false,
    costMap: {},

    setCost: async (tenantId, period, costs) => {
      set((state) => {
        if (!state.costMap[tenantId]) {
          state.costMap[tenantId] = {};
        }
        state.costMap[tenantId][period] = costs;
      });
      await persist({});
    },

    getCost: (tenantId, period) => get().costMap[tenantId]?.[period],

    hydrate: async () => {
      // Implemented by factory function
    },
  }),
});

export const useCostStore = <T>(
  selector: (state: CostStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(costStore, selector, equalityFn);
