import { storage } from '#imports';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createStore } from 'zustand/vanilla';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Tenant } from '@/types/tenant';

const tenantStorageItem = storage.defineItem<{
  selectedTenantId: string;
  tenantList: Tenant[];
}>('local:tenant', {
  fallback: {
    selectedTenantId: '',
    tenantList: [],
  },
});

export type TenantStoreState = {
  ready: boolean;
  selectedTenantId: string;
  tenantList: Tenant[];
  setSelectedTenantId: (tenantId: string) => Promise<void>;
  setTenantList: (tenants: Tenant[]) => Promise<void>;
  addTenant: (tenant: Tenant) => Promise<void>;
  updateTenant: (id: string, updates: Partial<Tenant>) => Promise<void>;
  removeTenant: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
};

/**
 * Helper function to compute selectedTenant from state
 * Use this in selectors instead of storing selectedTenant in state
 */
export const getSelectedTenant = (state: TenantStoreState): Tenant | null => {
  return state.tenantList.find((t) => t.id === state.selectedTenantId) ?? null;
};

const createTenantStore = () =>
  createStore<TenantStoreState>()(
    subscribeWithSelector((set, get) => {
      const applySnapshot = (
        value: {
          selectedTenantId: string;
          tenantList: Tenant[];
        } | null,
      ) => {
        const selectedTenantId = value?.selectedTenantId ?? '';
        const tenantList = value?.tenantList ?? [];
        set((state) => ({
          ...state,
          selectedTenantId,
          tenantList,
        }));
      };

      const hydrate = async () => {
        if (get().ready) {
          return;
        }

        try {
          const persistedValue = await tenantStorageItem.getValue();
          applySnapshot(persistedValue);
          set({ ready: true });
        } catch (error) {
          // 即使失败也设置 ready，让用户能使用默认值
          set({ ready: true });
        }
      };

      // Keep every context in sync by watching the shared storage key.
      tenantStorageItem.watch((value) => {
        applySnapshot(value);
      });

      // Delay hydration until after store initialization
      queueMicrotask(() => {
        void hydrate();
      });

      return {
        ready: false,
        selectedTenantId: '',
        tenantList: [],
        setSelectedTenantId: async (tenantId) => {
          const currentList = get().tenantList;
          set((state) => ({
            ...state,
            selectedTenantId: tenantId,
          }));
          await tenantStorageItem.setValue({
            selectedTenantId: tenantId,
            tenantList: currentList,
          });
        },
        setTenantList: async (tenants) => {
          const currentTenantId = get().selectedTenantId;
          set((state) => ({
            ...state,
            tenantList: tenants,
          }));
          await tenantStorageItem.setValue({
            selectedTenantId: currentTenantId,
            tenantList: tenants,
          });
        },
        addTenant: async (tenant) => {
          const currentList = get().tenantList;
          const currentTenantId = get().selectedTenantId;
          const newList = [...currentList, tenant];
          set((state) => ({
            ...state,
            tenantList: newList,
          }));
          await tenantStorageItem.setValue({
            selectedTenantId: currentTenantId,
            tenantList: newList,
          });
        },
        updateTenant: async (id, updates) => {
          const currentList = get().tenantList;
          const currentTenantId = get().selectedTenantId;
          const newList = currentList.map((t) => (t.id === id ? { ...t, ...updates } : t));
          set((state) => ({
            ...state,
            tenantList: newList,
          }));
          await tenantStorageItem.setValue({
            selectedTenantId: currentTenantId,
            tenantList: newList,
          });
        },
        removeTenant: async (id) => {
          const currentList = get().tenantList;
          const currentTenantId = get().selectedTenantId;
          const newList = currentList.filter((t) => t.id !== id);
          set((state) => ({
            ...state,
            tenantList: newList,
          }));
          await tenantStorageItem.setValue({
            selectedTenantId: currentTenantId,
            tenantList: newList,
          });
        },
        hydrate,
      };
    }),
  );

export const tenantStore = createTenantStore();

export const useTenantStore = <T>(
  selector: (state: TenantStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(tenantStore, selector, equalityFn);
