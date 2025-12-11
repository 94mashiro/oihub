import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import type { Token, TokenGroup } from '@/types/token';
import type { TenantId } from '@/types/tenant';

export type TokenStoreState = {
  tokenList: Record<TenantId, Token[]>;
  tokenGroups: Record<TenantId, Record<string, TokenGroup>>;
  setTokens: (tenantId: TenantId, tokens: Token[]) => void;
  getTokens: (tenantId: TenantId) => Token[] | undefined;
  setTokenGroups: (tenantId: TenantId, groups: Record<string, TokenGroup>) => void;
  getTokenGroup: (tenantId: TenantId, groupId: string) => TokenGroup | undefined;
};

export const tokenStore = createStore<TokenStoreState>()(
  immer((set, get) => ({
    tokenList: {},
    tokenGroups: {},

    setTokens: (tenantId, tokens) => {
      set((state) => {
        state.tokenList[tenantId] = tokens;
      });
    },

    getTokens: (tenantId) => get().tokenList[tenantId],

    setTokenGroups: (tenantId, groups) => {
      set((state) => {
        state.tokenGroups[tenantId] = groups;
      });
    },

    getTokenGroup: (tenantId, groupId) => get().tokenGroups[tenantId]?.[groupId],
  })),
);

export const useTokenStore = <T>(
  selector: (state: TokenStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => useStoreWithEqualityFn(tokenStore, selector, equalityFn);
