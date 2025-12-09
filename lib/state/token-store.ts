import { storage } from '#imports';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { createPersistentStore } from './create-persistent-store';
import type { Token, TokenGroup } from '@/types/token';
import type { TenantId } from '@/types/tenant';

type TokenPersistedState = {
  tokenList: Record<TenantId, Token[]>;
  tokenGroups: Record<TenantId, Record<string, TokenGroup>>;
};

export type TokenStoreState = {
  tokenList: Record<TenantId, Token[]>;
  tokenGroups: Record<TenantId, Record<string, TokenGroup>>;
  ready: boolean;
  setTokens: (tenantId: TenantId, tokens: Token[]) => Promise<void>;
  getTokens: (tenantId: TenantId) => Token[] | undefined;
  addToken: (tenantId: TenantId, token: Token) => Promise<void>;
  removeToken: (tenantId: TenantId, key: string) => Promise<void>;
  clearTokens: (tenantId: TenantId) => Promise<void>;
  setTokenGroups: (tenantId: TenantId, groups: Record<string, TokenGroup>) => Promise<void>;
  getTokenGroup: (tenantId: TenantId, groupId: string) => TokenGroup | undefined;
  hydrate: () => Promise<void>;
};

const tokenStorageItem = storage.defineItem<TokenPersistedState>('local:token', {
  fallback: {
    tokenList: {},
    tokenGroups: {},
  },
});

export const tokenStore = createPersistentStore<
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
      await persist((state) => ({ tokenList: state.tokenList }));
    },

    getTokens: (tenantId) => get().tokenList[tenantId],

    addToken: async (tenantId, token) => {
      set((state) => {
        if (!state.tokenList[tenantId]) {
          state.tokenList[tenantId] = [];
        }
        state.tokenList[tenantId].push(token);
      });
      await persist((state) => ({ tokenList: state.tokenList }));
    },

    removeToken: async (tenantId, key) => {
      set((state) => {
        if (state.tokenList[tenantId]) {
          state.tokenList[tenantId] = state.tokenList[tenantId].filter((t) => t.key !== key);
        }
      });
      await persist((state) => ({ tokenList: state.tokenList }));
    },

    clearTokens: async (tenantId) => {
      set((state) => {
        delete state.tokenList[tenantId];
      });
      await persist((state) => ({ tokenList: state.tokenList }));
    },

    setTokenGroups: async (tenantId, groups) => {
      set((state) => {
        state.tokenGroups[tenantId] = groups;
      });
      await persist((state) => ({ tokenGroups: state.tokenGroups }));
    },

    getTokenGroup: (tenantId, groupId) => get().tokenGroups[tenantId]?.[groupId],

    hydrate: async () => {},
  }),
});

export const useTokenStore = <T>(
  selector: (state: TokenStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(tokenStore, selector, equalityFn);
