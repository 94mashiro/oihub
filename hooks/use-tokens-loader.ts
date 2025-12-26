import { useEffect, useState } from 'react';
import { useTenantStore } from '@/lib/state/tenant-store';
import { getRawService } from '@/lib/api/services';
import { getAdapter } from '@/lib/api/adapters';
import { TokenOrchestrator } from '@/lib/api/orchestrators';

export function useTokensLoader(tenantId: string) {
  const [loading, setLoading] = useState(false);
  const tenant = useTenantStore((state) => state.tenantList.find((t) => t.id === tenantId));

  useEffect(() => {
    if (!tenant) return;

    setLoading(true);
    const service = getRawService(tenant);
    const adapter = getAdapter(tenant.platformType ?? 'newapi');
    const orchestrator = new TokenOrchestrator(tenant, service, adapter);

    orchestrator.refresh().finally(() => setLoading(false));
  }, [tenant, tenantId]);

  return { loading };
}
