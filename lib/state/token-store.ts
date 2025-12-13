import { storage } from 'wxt/utils/storage';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createStore } from './create-store';
import type { Token, TokenGroup } from '@/types/token';
import type { TenantId } from '@/types/tenant';

// Define persisted data structure
type TokenPersistedState = {
  tokenList: Record<TenantId, Token[]>;
  tokenGroups: Record<TenantId, Record<string, TokenGroup>>;
};

// Define complete store state
export type TokenStoreState = {
  // Persisted fields
  tokenList: Record<TenantId, Token[]>;
  tokenGroups: Record<TenantId, Record<string, TokenGroup>>;

  // Runtime fields
  ready: boolean;

  // Actions
  setTokens: (tenantId: TenantId, tokens: Token[]) => Promise<void>;
  getTokens: (tenantId: TenantId) => Token[] | undefined;
  setTokenGroups: (tenantId: TenantId, groups: Record<string, TokenGroup>) => Promise<void>;
  getTokenGroup: (tenantId: TenantId, groupId: string) => TokenGroup | undefined;

  // Internal methods
  hydrate: () => Promise<void>;
};

// Define storage item
const tokenStorageItem = storage.defineItem<TokenPersistedState>('local:token', {
  fallback: {
    tokenList: {},
    tokenGroups: {},
  },
});

// Create store using factory function
export const tokenStore = createStore<
  TokenStoreState,
  TokenPersistedState,
  'tokenList' | 'tokenGroups'
>({
  storageItem: tokenStorageItem,

  persistConfig: {
    keys: ['tokenList', 'tokenGroups'],
  },

  createState: (set, get, persist) => ({
    ready: false,
    tokenList: {},
    tokenGroups: {},

    setTokens: async (tenantId, tokens) => {
      set((state) => {
        state.tokenList[tenantId] = tokens;
      });
      await persist({});
    },

    getTokens: (tenantId) => get().tokenList[tenantId],

    setTokenGroups: async (tenantId, groups) => {
      set((state) => {
        state.tokenGroups[tenantId] = groups;
      });
      await persist({});
    },

    getTokenGroup: (tenantId, groupId) => get().tokenGroups[tenantId]?.[groupId],

    hydrate: async () => {
      // Implemented by factory function
    },
  }),
});

export const useTokenStore = <T>(
  selector: (state: TokenStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(tokenStore, selector, equalityFn);
