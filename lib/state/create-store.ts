/**
 * Factory function for creating persistent Zustand stores
 * with selective field persistence and cross-context synchronization
 *
 * Key improvements:
 * - Simplified persist API: only provide changed fields, auto-merges others
 * - Better type safety with improved type inference
 * - Optional error handling
 * - Automatic cross-context synchronization
 */

import { createStore as createZustandStore } from 'zustand/vanilla';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { StoreConfig, StoreErrorHandler } from './types';

/**
 * Creates a Zustand vanilla store with:
 * - Selective field persistence via WXT storage
 * - Automatic cross-context synchronization (Popup ↔ Background)
 * - hydrate/ready pattern for safe initialization
 * - Simplified persist API (auto-merges all persisted fields)
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
 * const store = createStore({
 *   storageItem: tenantStorageItem,
 *   persistConfig: {
 *     keys: ['selectedTenantId', 'tenantList']
 *   },
 *   createState: (set, get, persist) => ({
 *     ready: false,
 *     selectedTenantId: '',
 *     tenantList: [],
 *     setSelectedTenantId: async (id) => {
 *       set((state) => { state.selectedTenantId = id; });
 *       await persist({ selectedTenantId: id }); // Only changed field needed
 *     },
 *   })
 * });
 * ```
 */
export function createStore<
  TState,
  TPersistedState extends Record<string, any>,
  TPersistedKeys extends keyof TState & keyof TPersistedState,
>(config: StoreConfig<TState, TPersistedState, TPersistedKeys>) {
  const { storageItem, persistConfig, createState, onError } = config;

  const handleError: StoreErrorHandler = (error, context) => {
    if (onError) {
      onError(error, context);
    } else {
      console.error(`[createStore] ${context}:`, error);
    }
  };

  return createZustandStore<TState>()(
    subscribeWithSelector(
      immer((set, get) => {
        /**
         * Apply persisted snapshot to in-memory state
         * Read-only operation, does not trigger persistence
         * Type-safe: only applies configured persisted fields
         */
        const applySnapshot = (value: TPersistedState | null) => {
          if (!value || typeof value !== 'object') return;

          set((state) => {
            // Apply only configured persisted fields
            for (const key of persistConfig.keys) {
              if (key in value) {
                // Type-safe: TPersistedKeys ensures key exists in both types
                // and types are compatible
                const persistedValue = value[key];
                (state as any)[key] = persistedValue;
              }
            }
          });
        };

        /**
         * Simplified persist helper function
         * Automatically merges provided updates with all other persisted fields
         * Only need to provide the fields that changed
         */
        const persist = async (
          updates: Partial<Pick<TPersistedState, TPersistedKeys>>,
        ): Promise<void> => {
          try {
            const currentState = get();
            const currentPersisted = await storageItem.getValue();

            // Build complete persisted state: merge updates with current persisted values
            const completePersisted: Partial<TPersistedState> = { ...currentPersisted };

            // Apply provided updates
            for (const key of persistConfig.keys) {
              const keyStr = key as string;
              if (keyStr in updates) {
                // Type-safe: key is guaranteed to be in both TState and TPersistedState
                completePersisted[key] = (updates as any)[key];
              } else {
                // Auto-merge: use current state value for fields not in updates
                const stateValue = (currentState as any)[key];
                if (stateValue !== undefined) {
                  completePersisted[key] = stateValue;
                }
              }
            }

            await storageItem.setValue(completePersisted as TPersistedState);
          } catch (error) {
            handleError(
              error instanceof Error ? error : new Error(String(error)),
              'Persistence failed',
            );
            throw error;
          }
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
            handleError(
              error instanceof Error ? error : new Error(String(error)),
              'Hydration failed',
            );
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
    ),
  );
}
