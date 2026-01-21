import { describe, expect, test } from 'bun:test';
import { sortTenants } from './sort-tenants';
import { SortDirection, SortField, type SortConfig } from '@/types/sort';
import { CostPeriod } from '@/types/api';
import type { Balance, Cost } from '@/lib/api/adapters';
import type { Tenant, TenantId, TenantInfo } from '@/types/tenant';

const createTenant = (id: TenantId, name: string): Tenant => ({
  id,
  name,
  token: 'token',
  url: 'https://example.com',
});

describe('sortTenants', () => {
  test('sorts by balance using creditUnit-normalized values (desc/asc)', () => {
    const tenants: Tenant[] = [
      createTenant('a', 'A'),
      createTenant('b', 'B'),
      createTenant('c', 'C'),
    ];

    const tenantInfoMap: Record<TenantId, TenantInfo> = {
      a: { creditUnit: 1 },
      b: { creditUnit: 1_000_000 },
      c: { creditUnit: 100 },
    };

    const balanceMap: Record<TenantId, Balance> = {
      // Display: 100
      a: { remainingCredit: 100, consumedCredit: 0 },
      // Display: 50
      b: { remainingCredit: 50_000_000, consumedCredit: 0 },
      // Display: 20
      c: { remainingCredit: 2000, consumedCredit: 0 },
    };

    const costMap: Record<TenantId, Partial<Record<CostPeriod, Cost[]>>> = {};

    const desc: SortConfig = { field: SortField.BALANCE, direction: SortDirection.DESC };
    expect(sortTenants(tenants, desc, balanceMap, costMap, tenantInfoMap).map((t) => t.id)).toEqual(
      ['a', 'b', 'c'],
    );

    const asc: SortConfig = { field: SortField.BALANCE, direction: SortDirection.ASC };
    expect(sortTenants(tenants, asc, balanceMap, costMap, tenantInfoMap).map((t) => t.id)).toEqual(
      ['c', 'b', 'a'],
    );
  });

  test('pushes tenants with invalid balance values (NaN/undefined) to the end', () => {
    const tenants: Tenant[] = [
      createTenant('a', 'A'),
      createTenant('d', 'D'),
      createTenant('b', 'B'),
    ];

    const tenantInfoMap: Record<TenantId, TenantInfo> = {
      a: { creditUnit: 1 },
      b: { creditUnit: 1 },
      d: { creditUnit: 1 },
    };

    const balanceMap: Record<TenantId, Balance> = {
      a: { remainingCredit: 10, consumedCredit: 0 },
      b: { remainingCredit: 20, consumedCredit: 0 },
      d: { remainingCredit: Number.NaN, consumedCredit: 0 },
    };

    const costMap: Record<TenantId, Partial<Record<CostPeriod, Cost[]>>> = {};

    const desc: SortConfig = { field: SortField.BALANCE, direction: SortDirection.DESC };
    expect(sortTenants(tenants, desc, balanceMap, costMap, tenantInfoMap).map((t) => t.id)).toEqual(
      ['b', 'a', 'd'],
    );

    const asc: SortConfig = { field: SortField.BALANCE, direction: SortDirection.ASC };
    expect(sortTenants(tenants, asc, balanceMap, costMap, tenantInfoMap).map((t) => t.id)).toEqual(
      ['a', 'b', 'd'],
    );
  });

  test('sorts today cost using creditUnit-normalized values', () => {
    const tenants: Tenant[] = [
      createTenant('a', 'A'),
      createTenant('b', 'B'),
      createTenant('c', 'C'),
    ];

    const tenantInfoMap: Record<TenantId, TenantInfo> = {
      a: { creditUnit: 1 },
      b: { creditUnit: 1_000_000 },
      c: { creditUnit: 100 },
    };

    const balanceMap: Record<TenantId, Balance> = {};
    const costMap: Record<TenantId, Partial<Record<CostPeriod, Cost[]>>> = {
      a: { [CostPeriod.DAY_1]: [{ modelId: 'm', creditCost: 100, tokenUsage: 0 }] },
      b: { [CostPeriod.DAY_1]: [{ modelId: 'm', creditCost: 50_000_000, tokenUsage: 0 }] },
      c: { [CostPeriod.DAY_1]: [{ modelId: 'm', creditCost: 2000, tokenUsage: 0 }] },
    };

    const desc: SortConfig = { field: SortField.TODAY_COST, direction: SortDirection.DESC };
    expect(sortTenants(tenants, desc, balanceMap, costMap, tenantInfoMap).map((t) => t.id)).toEqual(
      ['a', 'b', 'c'],
    );
  });
});

