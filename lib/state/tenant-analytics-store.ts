/**
 * Tenant Analytics Store
 *
 * Session-scoped analytics data for current tenant view.
 * Data is NOT persisted and resets on session refresh.
 */

import { storage } from 'wxt/utils/storage';
import { createStore } from './create-store';
import type { TenantId } from '@/types/tenant';
import type { CostPeriod } from '@/types/api';
import type {
  NewAPIUsageSummary,
  NewAPIUsagePoint,
  NewAPIModelUsage,
  NewAPIEndpointUsage,
  AnalyticsStatus,
  AnalyticsCacheMap,
  CachedPeriodData,
} from '@/types/tenant-analytics';
import type { NewAPIBalanceResponse, NewAPICostData } from '@/lib/api/types/platforms/newapi-response-types';

// Define persisted data structure (session-scoped, resets on reload)
type TenantAnalyticsPersistedState = {
  tenantId: TenantId;
  period: CostPeriod;
};

// Define complete store state
export type TenantAnalyticsStoreState = {
  // Persisted fields (session-scoped)
  tenantId: TenantId;
  period: CostPeriod;

  // Runtime analytics data (NOT persisted)
  status: AnalyticsStatus;
  isRefreshing: boolean;
  error?: string;
  balance?: NewAPIBalanceResponse;
  costs?: NewAPICostData[];
  summary?: NewAPIUsageSummary;
  series?: NewAPIUsagePoint[];
  models?: NewAPIModelUsage[];
  endpoints?: NewAPIEndpointUsage[];
  lastUpdatedAt?: number;

  // Runtime cache (NOT persisted)
  cache: AnalyticsCacheMap;

  // Runtime fields
  ready: boolean;

  // Setters
  setPeriod: (period: CostPeriod) => Promise<void>;
  setTenantId: (tenantId: TenantId) => Promise<void>;
  setStatus: (status: AnalyticsStatus, error?: string) => void;
  setRefreshing: (isRefreshing: boolean) => void;
  setAnalyticsData: (data: {
    balance?: NewAPIBalanceResponse;
    costs?: NewAPICostData[];
    summary?: NewAPIUsageSummary;
    series?: NewAPIUsagePoint[];
    models?: NewAPIModelUsage[];
    endpoints?: NewAPIEndpointUsage[];
  }) => void;
  clearAnalyticsData: () => void;

  // Cache methods
  getCachedData: (period: CostPeriod) => CachedPeriodData | undefined;
  setCachedData: (period: CostPeriod, data: CachedPeriodData) => void;
  clearCache: () => void;

  // Internal methods
  hydrate: () => Promise<void>;
};

// Define storage item (session storage)
const tenantAnalyticsStorageItem = storage.defineItem<TenantAnalyticsPersistedState>(
  'session:tenant-analytics',
  {
    fallback: {
      tenantId: '',
      period: 'DAY_7' as CostPeriod,
    },
  },
);

// Create store using factory function
export const tenantAnalyticsStore = createStore<
  TenantAnalyticsStoreState,
  TenantAnalyticsPersistedState,
  'tenantId' | 'period'
>({
  storageItem: tenantAnalyticsStorageItem,

  // Configure which fields to persist
  persistConfig: {
    keys: ['tenantId', 'period'],
  },

  // Create store state and actions
  createState: (set, _get, persist) => ({
    // Initial state
    ready: false,
    tenantId: '',
    period: 'DAY_7' as CostPeriod,
    status: 'idle',
    isRefreshing: false,
    cache: {},

    // Setters - using simplified persist() API
    setPeriod: async (period) => {
      set((state) => {
        state.period = period;
      });
      await persist({ period });
    },

    setTenantId: async (tenantId) => {
      set((state) => {
        state.tenantId = tenantId;
      });
      await persist({ tenantId });
    },

    setStatus: (status, error) => {
      set((state) => {
        state.status = status;
        state.error = error;
      });
    },

    setRefreshing: (isRefreshing) => {
      set((state) => {
        state.isRefreshing = isRefreshing;
      });
    },

    setAnalyticsData: (data) => {
      set((state) => {
        state.balance = data.balance;
        state.costs = data.costs;
        state.summary = data.summary;
        state.series = data.series;
        state.models = data.models;
        state.endpoints = data.endpoints;
        state.lastUpdatedAt = Date.now();
        state.status = 'ready';
        state.error = undefined;
      });
    },

    clearAnalyticsData: () => {
      set((state) => {
        state.status = 'idle';
        state.error = undefined;
        state.balance = undefined;
        state.costs = undefined;
        state.summary = undefined;
        state.series = undefined;
        state.models = undefined;
        state.endpoints = undefined;
        state.lastUpdatedAt = undefined;
      });
    },

    getCachedData: (period) => {
      return _get().cache[period];
    },

    setCachedData: (period, data) => {
      set((state) => {
        state.cache[period] = data;
      });
    },

    clearCache: () => {
      set((state) => {
        state.cache = {};
      });
    },

    // Hydrate will be injected by createStore
    hydrate: async () => {},
  }),
});
