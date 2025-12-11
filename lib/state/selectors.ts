import type { Tenant, TenantId } from '@/types/tenant';

export type TenantListState = {
  selectedTenantId: TenantId;
  tenantList: Tenant[];
};

/**
 * Helper function to compute selectedTenant from state
 * Use this in selectors instead of storing selectedTenant in state
 */
export const getSelectedTenant = (state: TenantListState): Tenant | null => {
  return state.tenantList.find((t) => t.id === state.selectedTenantId) ?? null;
};
