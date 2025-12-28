import { useEffect, useState } from 'react';
import { useTenantStore } from '@/lib/state/tenant-store';
import { CostOrchestrator } from '@/lib/api/orchestrators';
import { CostPeriod } from '@/types/api';

export function useCostLoader(tenantId: string, period: CostPeriod) {
  const [loading, setLoading] = useState(false);
  const tenant = useTenantStore((state) => state.tenantList.find((t) => t.id === tenantId));

  useEffect(() => {
    if (!tenant) return;

    setLoading(true);
    const orchestrator = new CostOrchestrator(tenant, period);

    orchestrator.refresh().finally(() => setLoading(false));
  }, [tenant, tenantId, period]);

  return { loading };
}
