import TenantSelector from '@/components/biz/tenant-select';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTenantStore, getSelectedTenant } from '@/lib/state/tenant-store';
import { useEffect } from 'react';

const PopupMainScreen = () => {
  const navigate = useNavigate();
  const selectedTenant = useTenantStore((state) => getSelectedTenant(state));
  const fetchTenantInfo = useTenantStore((state) => state.fetchTenantInfo);

  useEffect(() => {
    if (!selectedTenant?.id) {
      return;
    }
    fetchTenantInfo(selectedTenant.id);
  }, [fetchTenantInfo, selectedTenant?.id]);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <TenantSelector />

      {selectedTenant && (
        <div className="flex flex-col gap-3">
          {/* Basic Information */}
          <div className="bg-muted flex flex-col gap-2 rounded-md p-3">
            <div className="text-sm font-medium">Tenant Information</div>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-muted-foreground">Name:</span> {selectedTenant.name}
              </div>
              <div>
                <span className="text-muted-foreground">URL:</span> {selectedTenant.url}
              </div>
              <div>
                <span className="text-muted-foreground">User ID:</span> {selectedTenant.userId}
              </div>
            </div>
          </div>

          {/* Tenant Status Info */}
          {selectedTenant.info && (
            <div className="bg-muted flex flex-col gap-2 rounded-md p-3">
              <div className="text-sm font-medium">Status Information</div>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-muted-foreground">Quota Per Unit:</span>{' '}
                  {selectedTenant.info.quota_per_unit}
                </div>
                <div>
                  <span className="text-muted-foreground">USD Exchange Rate:</span>{' '}
                  {selectedTenant.info.usd_exchange_rate}
                </div>
                {selectedTenant.info.api_info && selectedTenant.info.api_info.length > 0 && (
                  <div className="mt-2">
                    <div className="text-muted-foreground mb-1">API Routes:</div>
                    <div className="space-y-1 pl-2">
                      {selectedTenant.info.api_info.map((api) => (
                        <div key={api.id} className="text-xs">
                          <div className="font-medium">{api.route}</div>
                          {api.description && (
                            <div className="text-muted-foreground">{api.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedTenant && (
        <div className="text-muted-foreground bg-muted rounded-md p-3 text-sm">
          No tenant selected. Please select or create a tenant.
        </div>
      )}

      <Button
        onClick={() => {
          navigate('/tenant/create');
        }}
      >
        Create Tenant
      </Button>
    </div>
  );
};

export default PopupMainScreen;
