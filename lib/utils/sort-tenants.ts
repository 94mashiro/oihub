import { SortDirection, SortField, type SortConfig } from '@/types/sort';
import { CostPeriod } from '@/types/api';
import type { Balance, Cost } from '@/lib/api/adapters';
import type { Tenant, TenantId, TenantInfo } from '@/types/tenant';

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const getCreditUnit = (tenantInfo: TenantInfo | undefined): number => {
  const unit = tenantInfo?.creditUnit;
  // UI display falls back to 1 when quotaPerUnit is missing/invalid, keep sorting consistent.
  return isFiniteNumber(unit) && unit > 0 ? unit : 1;
};

const compareNullableNumbers = (a: number | null, b: number | null, multiplier: 1 | -1): number => {
  // Always push unknown values to the end, regardless of direction.
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  const diff = a - b;
  return diff === 0 ? 0 : multiplier * diff;
};

/**
 * Sort tenants by configured field/direction.
 *
 * NOTE: Balance/cost are stored as raw quota values per-tenant. To make sorting match the UI,
 * we normalize with `creditUnit` (quota per currency unit) before comparing.
 */
export function sortTenants(
  tenantList: Tenant[],
  sortConfig: SortConfig,
  balanceMap: Record<TenantId, Balance>,
  costMap: Record<TenantId, Partial<Record<CostPeriod, Cost[]>>>,
  tenantInfoMap: Record<TenantId, TenantInfo>,
): Tenant[] {
  const { field, direction } = sortConfig;

  // 手动排序：直接返回 tenantList 原始顺序
  if (field === SortField.MANUAL) {
    return tenantList;
  }

  const tenants = [...tenantList];
  const multiplier: 1 | -1 = direction === SortDirection.ASC ? 1 : -1;
  const compareByName = (a: Tenant, b: Tenant) => a.name.localeCompare(b.name, 'zh-CN');

  switch (field) {
    case SortField.NAME:
      return tenants.sort((a, b) => multiplier * compareByName(a, b));

    case SortField.BALANCE:
      return tenants.sort((a, b) => {
        const aRaw = balanceMap[a.id]?.remainingCredit;
        const bRaw = balanceMap[b.id]?.remainingCredit;

        const aValue = isFiniteNumber(aRaw) ? aRaw / getCreditUnit(tenantInfoMap[a.id]) : null;
        const bValue = isFiniteNumber(bRaw) ? bRaw / getCreditUnit(tenantInfoMap[b.id]) : null;

        const result = compareNullableNumbers(aValue, bValue, multiplier);
        return result !== 0 ? result : compareByName(a, b);
      });

    case SortField.TODAY_COST:
      return tenants.sort((a, b) => {
        const aCosts = costMap[a.id]?.[CostPeriod.DAY_1];
        const bCosts = costMap[b.id]?.[CostPeriod.DAY_1];

        // Undefined means "not loaded", keep it last; empty array means "loaded but zero cost".
        const aRaw = Array.isArray(aCosts)
          ? aCosts.reduce((sum, c) => sum + c.creditCost, 0)
          : null;
        const bRaw = Array.isArray(bCosts)
          ? bCosts.reduce((sum, c) => sum + c.creditCost, 0)
          : null;

        const aValue = isFiniteNumber(aRaw) ? aRaw / getCreditUnit(tenantInfoMap[a.id]) : null;
        const bValue = isFiniteNumber(bRaw) ? bRaw / getCreditUnit(tenantInfoMap[b.id]) : null;

        const result = compareNullableNumbers(aValue, bValue, multiplier);
        return result !== 0 ? result : compareByName(a, b);
      });

    default:
      return tenants;
  }
}
