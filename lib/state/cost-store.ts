import { storage } from '#imports';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createPersistentStore } from './create-persistent-store';
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

type CostPersistedState = {
  costList: Record<TenantId, Partial<Record<CostPeriod, CostData[]>>>;
};

export type CostStoreState = {
  costList: Record<TenantId, Partial<Record<CostPeriod, CostData[]>>>;
  ready: boolean;

  setCost: (tenantId: TenantId, period: CostPeriod, costs: CostData[]) => Promise<void>;
  getCost: (tenantId: TenantId, period: CostPeriod) => CostData[] | undefined;
  removeCost: (tenantId: TenantId) => Promise<void>;
  hydrate: () => Promise<void>;
};

const costStorageItem = storage.defineItem<CostPersistedState>('local:cost', {
  fallback: {
    costList: {},
  },
});

export const costStore = createPersistentStore<CostStoreState, CostPersistedState, 'costList'>({
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

    removeCost: async (tenantId) => {
      set((state) => {
        delete state.costList[tenantId];
      });
      await persist({});
    },

    hydrate: async () => {},
  }),
});

export const useCostStore = <T>(
  selector: (state: CostStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(costStore, selector, equalityFn);
