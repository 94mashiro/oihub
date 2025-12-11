import { useEffect, useState } from 'react';
import { tokenStore } from '@/lib/state/token-store';
import { useTenantStore } from '@/lib/state/tenant-store';
import { TenantAPIService } from '@/lib/api';

export function useTokensLoader(tenantId: string) {
  const [loading, setLoading] = useState(false);
  const tenant = useTenantStore((state) => state.tenantList.find((t) => t.id === tenantId));

  useEffect(() => {
    if (!tenant) return;

    setLoading(true);
    const api = new TenantAPIService(tenant);

    Promise.all([api.getTokens(), api.getTokenGroups()])
      .then(([tokens, groups]) => {
        tokenStore.getState().setTokens(tenantId, tokens.items);
        tokenStore.getState().setTokenGroups(tenantId, groups);
      })
      .finally(() => setLoading(false));
  }, [tenant, tenantId]);

  return { loading };
}
