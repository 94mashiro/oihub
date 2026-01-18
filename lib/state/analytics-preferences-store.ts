/**
 * Analytics Preferences Store
 *
 * Persistent user preferences for analytics dashboard (period, breakdown type)
 */

import { storage } from 'wxt/utils/storage';
import { createStore } from './create-store';
import { CostPeriod } from '@/types/api';
import type { AnalyticsPreferences, BreakdownType } from '@/types/tenant-analytics';

// Define persisted data structure
type AnalyticsPreferencesPersistedState = AnalyticsPreferences;

// Define complete store state
export type AnalyticsPreferencesStoreState = AnalyticsPreferences & {
  // Runtime fields
  ready: boolean;

  // Setters (with persistence)
  setDefaultPeriod: (period: CostPeriod) => Promise<void>;
  setDefaultBreakdownType: (type: BreakdownType) => Promise<void>;

  // Internal methods
  hydrate: () => Promise<void>;
};

// Define storage item
const analyticsPreferencesStorageItem = storage.defineItem<AnalyticsPreferencesPersistedState>(
  'local:analytics-preferences',
  {
    fallback: {
      defaultPeriod: CostPeriod.DAY_7,
      defaultBreakdownType: 'model',
    },
  },
);

// Create store using factory function
export const analyticsPreferencesStore = createStore<
  AnalyticsPreferencesStoreState,
  AnalyticsPreferencesPersistedState,
  'defaultPeriod' | 'defaultBreakdownType'
>({
  storageItem: analyticsPreferencesStorageItem,

  // Configure which fields to persist
  persistConfig: {
    keys: ['defaultPeriod', 'defaultBreakdownType'],
  },

  // Create store state and actions
  createState: (set, _get, persist) => ({
    // Initial state
    ready: false,
    defaultPeriod: CostPeriod.DAY_7,
    defaultBreakdownType: 'model',

    // Setters - using simplified persist() API
    setDefaultPeriod: async (period) => {
      set((state) => {
        state.defaultPeriod = period;
      });
      await persist({ defaultPeriod: period });
    },

    setDefaultBreakdownType: async (type) => {
      set((state) => {
        state.defaultBreakdownType = type;
      });
      await persist({ defaultBreakdownType: type });
    },

    // Hydrate will be injected by createStore
    hydrate: async () => {},
  }),
});
