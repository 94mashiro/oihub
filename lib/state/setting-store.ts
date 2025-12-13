import { storage } from 'wxt/utils/storage';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createStore } from './create-store';

import type { TenantId } from '@/types/tenant';

// Daily usage alert configuration for a single tenant
export interface DailyUsageAlertConfig {
  enabled: boolean;
  threshold: number; // Stored in raw quota units
}

// Define persisted data structure
type SettingPersistedState = {
  dailyUsageAlert: Record<TenantId, DailyUsageAlertConfig>;
  alertedToday: Record<TenantId, string>; // value is date string like "2025-12-12"
};

// Define complete store state
export type SettingStoreState = {
  // Persisted fields
  dailyUsageAlert: Record<TenantId, DailyUsageAlertConfig>;
  alertedToday: Record<TenantId, string>;

  // Runtime fields
  ready: boolean;

  // Actions
  setDailyUsageAlert: (tenantId: TenantId, config: DailyUsageAlertConfig) => Promise<void>;
  removeDailyUsageAlert: (tenantId: TenantId) => Promise<void>;
  markAlerted: (tenantId: TenantId) => Promise<void>;
  clearAlertedToday: () => Promise<void>;
  isAlertedToday: (tenantId: TenantId) => boolean;

  // Internal methods
  hydrate: () => Promise<void>;
};

// Get today's date string in YYYY-MM-DD format
const getTodayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Define storage item
const settingStorageItem = storage.defineItem<SettingPersistedState>('local:setting', {
  fallback: {
    dailyUsageAlert: {},
    alertedToday: {},
  },
});

// Create store using factory function
export const settingStore = createStore<
  SettingStoreState,
  SettingPersistedState,
  'dailyUsageAlert' | 'alertedToday'
>({
  storageItem: settingStorageItem,

  persistConfig: {
    keys: ['dailyUsageAlert', 'alertedToday'],
  },

  createState: (set, get, persist) => ({
    // Initial state
    ready: false,
    dailyUsageAlert: {},
    alertedToday: {},

    setDailyUsageAlert: async (tenantId, config) => {
      set((state) => {
        state.dailyUsageAlert[tenantId] = config;
      });
      await persist({});
    },

    removeDailyUsageAlert: async (tenantId) => {
      set((state) => {
        delete state.dailyUsageAlert[tenantId];
      });
      await persist({});
    },

    markAlerted: async (tenantId) => {
      const today = getTodayString();
      set((state) => {
        state.alertedToday[tenantId] = today;
      });
      await persist({});
    },

    clearAlertedToday: async () => {
      set((state) => {
        state.alertedToday = {};
      });
      await persist({});
    },

    isAlertedToday: (tenantId) => {
      const today = getTodayString();
      return get().alertedToday[tenantId] === today;
    },

    hydrate: async () => {
      // Implemented by factory function
    },
  }),
});

export const useSettingStore = <T>(
  selector: (state: SettingStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(settingStore, selector, equalityFn);
