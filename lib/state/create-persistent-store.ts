/**
 * Factory function for creating persistent Zustand stores
 * with selective field persistence and cross-context synchronization
 */

import { createStore } from 'zustand/vanilla';
import { subscribeWithSelector } from 'zustand/middleware';
import type { PersistentStoreConfig } from './types';

/**
 * Creates a Zustand vanilla store with:
 * - Selective field persistence via WXT storage
 * - Automatic cross-context synchronization (Popup ↔ Background)
 * - hydrate/ready pattern for safe initialization
 *
 * @template TState - The complete store state type
 * @template TPersistedState - The persisted data structure type
 * @template TPersistedKeys - Union type of keys to persist
 *
 * @param config - Store configuration
 * @returns Zustand store instance
 *
 * @example
 * ```typescript
 * const store = createPersistentStore({
 *   storageItem: tenantStorageItem,
 *   persistConfig: {
 *     keys: ['selectedTenantId', 'tenantList']
 *   },
 *   createState: (set, get, persist) => ({
 *     ready: false,
 *     selectedTenantId: '',
 *     tenantList: [],
 *     setSelectedTenantId: async (id) => {
 *       set((state) => ({ ...state, selectedTenantId: id }));
 *       await persist((state) => ({
 *         selectedTenantId: id,
 *         tenantList: state.tenantList,
 *       }));
 *     },
 *   })
 * });
 * ```
 */
export function createPersistentStore<
  TState,
  TPersistedState extends Record<string, any>,
  TPersistedKeys extends keyof TState & keyof TPersistedState,
>(config: PersistentStoreConfig<TState, TPersistedState, TPersistedKeys>) {
  const { storageItem, persistConfig, createState } = config;

  return createStore<TState>()(
    subscribeWithSelector((set, get) => {
      /**
       * Apply persisted snapshot to in-memory state
       * Read-only operation, does not trigger persistence
       */
      const applySnapshot = (value: TPersistedState | null) => {
        if (!value) return;

        set((state) => {
          const updates: Partial<TState> = {};

          // Apply only configured persisted fields
          for (const key of persistConfig.keys) {
            if (key in value) {
              // Safe cast: key is guaranteed to be in both TState and TPersistedState
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              updates[key] = value[key] as any;
            }
          }

          return { ...state, ...updates };
        });
      };

      /**
       * Persist helper function for selective persistence
       * Merges updates with existing persisted data
       */
      const persist = async (
        updater: (state: TState) => Partial<TPersistedState>,
      ): Promise<void> => {
        const currentState = get();
        const updates = updater(currentState);

        // Merge with existing persisted data
        const currentPersisted = await storageItem.getValue();
        await storageItem.setValue({
          ...currentPersisted,
          ...updates,
        } as TPersistedState);
      };

      /**
       * Hydrate store from persisted storage
       * Guards against multiple hydrations with ready flag
       *
       * CRITICAL: This function must be called via queueMicrotask
       * after store initialization to avoid get() returning undefined
       */
      const hydrate = async () => {
        const state = get();

        // Guard: prevent duplicate hydration
        if ((state as any).ready) {
          return;
        }

        try {
          const persistedValue = await storageItem.getValue();
          applySnapshot(persistedValue);
          set((s) => ({ ...s, ready: true }) as TState);
        } catch (error) {
          // Even on failure, set ready to allow usage with fallback values
          console.error('[createPersistentStore] Hydration failed:', error);
          set((s) => ({ ...s, ready: true }) as TState);
        }
      };

      /**
       * Cross-context synchronization
       * Listen to storage changes from other contexts and apply updates
       */
      storageItem.watch((value: TPersistedState | null) => {
        applySnapshot(value);
      });

      /**
       * Create the store state with injected helpers
       * Note: hydrate() is passed but must be called via queueMicrotask externally
       */
      const state = createState(set, get, persist);

      /**
       * CRITICAL: Delay hydration until after store initialization
       * Using queueMicrotask ensures get() returns the initial state correctly
       * See storage-state-rules.md line 17 for details
       */
      queueMicrotask(() => {
        void hydrate();
      });

      // Inject hydrate method into state for manual calls if needed
      return {
        ...state,
        hydrate,
      } as TState;
    }),
  );
}
