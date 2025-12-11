import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useStoreWithEqualityFn } from 'zustand/traditional';
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

export type CostStoreState = {
  costList: Record<TenantId, Partial<Record<CostPeriod, CostData[]>>>;
  setCost: (tenantId: TenantId, period: CostPeriod, costs: CostData[]) => void;
  getCost: (tenantId: TenantId, period: CostPeriod) => CostData[] | undefined;
};

export const costStore = createStore<CostStoreState>()(
  immer((set, get) => ({
    costList: {},

    setCost: (tenantId, period, costs) => {
      set((state) => {
        if (!state.costList[tenantId]) {
          state.costList[tenantId] = {};
        }
        state.costList[tenantId][period] = costs;
      });
    },

    getCost: (tenantId, period) => get().costList[tenantId]?.[period],
  })),
);

export const useCostStore = <T>(
  selector: (state: CostStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(costStore, selector, equalityFn);
