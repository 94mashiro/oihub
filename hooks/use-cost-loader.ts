import { useEffect, useState } from 'react';
import { useTenantStore } from '@/lib/state/tenant-store';
import { getRawService } from '@/lib/api/services';
import { getAdapter } from '@/lib/api/adapters';
import { CostOrchestrator } from '@/lib/api/orchestrators';
import { CostPeriod } from '@/types/api';

export function useCostLoader(tenantId: string, period: CostPeriod) {
  const [loading, setLoading] = useState(false);
  const tenant = useTenantStore((state) => state.tenantList.find((t) => t.id === tenantId));

  useEffect(() => {
    if (!tenant) return;

    setLoading(true);
    const service = getRawService(tenant);
    const adapter = getAdapter(tenant.platformType ?? 'newapi');
    const orchestrator = new CostOrchestrator(tenant, service, adapter, period);

    orchestrator.refresh().finally(() => setLoading(false));
  }, [tenant, tenantId, period]);

  return { loading };
}
