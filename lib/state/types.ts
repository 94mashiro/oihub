/**
 * State management type definitions
 * Supports configurable selective persistence for Zustand stores
 */

import type { WxtStorageItem } from 'wxt/utils/storage';
import type { Draft } from 'immer';

/**
 * Configuration for selective field persistence
 *
 * @template TState - The complete store state type
 * @template TPersistedKeys - Union type of keys to persist
 *
 * @example
 * ```typescript
 * const config: PersistConfig<StoreState, 'field1' | 'field2'> = {
 *   keys: ['field1', 'field2']
 * };
 * ```
 */
export interface PersistConfig<TState, TPersistedKeys extends keyof TState> {
  /** Array of state keys that should be persisted to storage */
  keys: TPersistedKeys[];
}

/**
 * Simplified persist function that automatically merges all persisted fields
 * Only need to provide the fields that changed
 *
 * @template TPersistedState - The persisted data structure type
 * @template TPersistedKeys - Union type of keys to persist
 *
 * @param updates - Partial updates to persist (only changed fields needed)
 * @returns Promise that resolves when persistence completes
 *
 * @example
 * ```typescript
 * // Old way (verbose, error-prone):
 * await persist((state) => ({
 *   field1: newValue,
 *   field2: state.field2, // Must include all fields
 * }));
 *
 * // New way (concise, safe):
 * await persist({ field1: newValue }); // Automatically merges field2
 * ```
 */
export type PersistFn<TPersistedState, TPersistedKeys extends keyof TPersistedState> = (
  updates: Partial<Pick<TPersistedState, TPersistedKeys>>,
) => Promise<void>;

/**
 * Store state creation function signature
 *
 * @template TState - The complete store state type
 * @template TPersistedState - The persisted data structure type
 * @template TPersistedKeys - Union type of keys to persist
 *
 * @param set - Zustand set function for updating state (with immer)
 * @param get - Zustand get function for reading current state
 * @param persist - Simplified persist function (auto-merges all persisted fields)
 * @returns The complete initial store state
 *
 * @example
 * ```typescript
 * createState: (set, get, persist) => ({
 *   field1: '',
 *   field2: 0,
 *   action: async () => {
 *     set((state) => { state.field1 = 'new'; });
 *     await persist({ field1: 'new' }); // Only need changed fields
 *   }
 * })
 * ```
 */
export type CreateStateFn<
  TState,
  TPersistedState extends Record<string, any>,
  TPersistedKeys extends keyof TState & keyof TPersistedState,
> = (
  set: (updater: (draft: Draft<TState>) => void) => void,
  get: () => TState,
  persist: PersistFn<TPersistedState, TPersistedKeys>,
) => TState;

/**
 * Error handler for store operations
 */
export type StoreErrorHandler = (error: Error, context: string) => void;

/**
 * Configuration for creating a persistent store
 *
 * @template TState - The complete store state type
 * @template TPersistedState - The persisted data structure type (must be object type)
 * @template TPersistedKeys - Union type of keys to persist
 */
export interface PersistentStoreConfig<
  TState,
  TPersistedState extends Record<string, any>,
  TPersistedKeys extends keyof TState & keyof TPersistedState,
> {
  /** WXT storage item for persistence */
  storageItem: WxtStorageItem<TPersistedState, any>;

  /** Configuration for which fields to persist */
  persistConfig: PersistConfig<TState, TPersistedKeys>;

  /** Function to create the store state and actions */
  createState: CreateStateFn<TState, TPersistedState, TPersistedKeys>;

  /** Optional error handler for persistence and hydration errors */
  onError?: StoreErrorHandler;
}

/**
 * Extract persisted fields from store state
 *
 * @template TState - The complete store state type
 * @template TKeys - Union type of keys to extract
 */
export type ExtractPersisted<TState, TKeys extends keyof TState> = Pick<TState, TKeys>;

/**
 * Extract action keys from store state
 *
 * @template TState - The complete store state type
 *
 * Filters out all non-function properties
 */
export type ExtractActions<TState> = {
  [K in keyof TState]: TState[K] extends (...args: any[]) => any ? K : never;
}[keyof TState];

/**
 * Extract all actions from store state
 *
 * @template TState - The complete store state type
 */
export type Actions<TState> = Pick<TState, ExtractActions<TState>>;
