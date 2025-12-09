import { storage } from '#imports';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createPersistentStore } from './create-persistent-store';

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
  costList: Record<string, CostData[]>;
};

export type CostStoreState = {
  costList: Record<string, CostData[]>;
  ready: boolean;

  setCost: (tenantId: string, costs: CostData[]) => Promise<void>;
  getCost: (tenantId: string) => CostData[] | undefined;
  removeCost: (tenantId: string) => Promise<void>;
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

    setCost: async (tenantId, costs) => {
      set((state) => {
        state.costList[tenantId] = costs;
      });
      await persist((state) => ({ costList: state.costList }));
    },

    getCost: (tenantId) => get().costList[tenantId],

    removeCost: async (tenantId) => {
      set((state) => {
        delete state.costList[tenantId];
      });
      await persist((state) => ({ costList: state.costList }));
    },

    hydrate: async () => {},
  }),
});

export const useCostStore = <T>(
  selector: (state: CostStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(costStore, selector, equalityFn);
