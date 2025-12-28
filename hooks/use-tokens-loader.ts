import { useEffect, useState } from 'react';
import { useTenantStore } from '@/lib/state/tenant-store';
import { TokenOrchestrator } from '@/lib/api/orchestrators';

export function useTokensLoader(tenantId: string) {
  const [loading, setLoading] = useState(false);
  const tenant = useTenantStore((state) => state.tenantList.find((t) => t.id === tenantId));

  useEffect(() => {
    if (!tenant) return;

    setLoading(true);
    const orchestrator = new TokenOrchestrator(tenant);

    orchestrator.refresh().finally(() => setLoading(false));
  }, [tenant, tenantId]);

  return { loading };
}
