import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getSelectedTenant, useTenantStore } from '@/lib/state/tenant-store';

const TenantSelector = () => {
  const tenantList = useTenantStore((state) => state.tenantList);
  const selectedTenant = useTenantStore(getSelectedTenant);
  const setSelectedTenantId = useTenantStore((state) => state.setSelectedTenantId);

  console.log(selectedTenant);

  return (
    <div>
      <Select
        aria-label="Select tenant"
        value={selectedTenant?.id ?? ''}
        onValueChange={(value) => {
          if (value) {
            void setSelectedTenantId(value);
          }
        }}
      >
        <SelectTrigger size="sm">
          <SelectValue>
            {() =>
              selectedTenant && (
                <span className="flex flex-col">
                  <span className="truncate text-sm">{selectedTenant.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {selectedTenant.url}
                  </span>
                </span>
              )
            }
          </SelectValue>
        </SelectTrigger>
        <SelectPopup>
          {tenantList.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              <span className="flex flex-col">
                <span className="truncate text-sm">{tenant.name}</span>
                <span className="text-muted-foreground truncate text-xs">{tenant.url}</span>
              </span>
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </div>
  );
};

export default TenantSelector;
