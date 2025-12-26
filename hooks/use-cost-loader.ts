import { useEffect, useState } from 'react';
import { costStore } from '@/lib/state/cost-store';
import { useTenantStore } from '@/lib/state/tenant-store';
import { TenantAPIService } from '@/lib/api';
import { CostPeriod } from '@/types/api';

export function useCostLoader(tenantId: string, period: CostPeriod) {
  const [loading, setLoading] = useState(false);
  const tenant = useTenantStore((state) => state.tenantList.find((t) => t.id === tenantId));

  useEffect(() => {
    if (!tenant) return;

    setLoading(true);
    const api = new TenantAPIService(tenant);

    api
      .getCostData(period)
      .then(async (data) => {
        await costStore.getState().setCost(tenantId, period, data);
      })
      .finally(() => setLoading(false));
  }, [tenant, tenantId, period]);

  return { loading };
}
