import { describe, expect, test } from 'bun:test';
import { getSelectedTenant, type TenantListState } from './selectors';

describe('getSelectedTenant', () => {
  const mockTenant = { id: 'tenant-1', name: 'Test Tenant', url: 'https://example.com', userId: 'user-1', token: 'token-1' };

  test('returns tenant when found', () => {
    const state = {
      selectedTenantId: 'tenant-1',
      tenantList: [mockTenant],
    } as TenantListState;
    expect(getSelectedTenant(state)).toEqual(mockTenant);
  });

  test('returns null when tenant not found', () => {
    const state = {
      selectedTenantId: 'non-existent',
      tenantList: [mockTenant],
    } as TenantListState;
    expect(getSelectedTenant(state)).toBeNull();
  });

  test('returns null when tenant list is empty', () => {
    const state = {
      selectedTenantId: 'tenant-1',
      tenantList: [],
    } as TenantListState;
    expect(getSelectedTenant(state)).toBeNull();
  });

  test('returns null when selectedTenantId is empty', () => {
    const state = {
      selectedTenantId: '',
      tenantList: [mockTenant],
    } as TenantListState;
    expect(getSelectedTenant(state)).toBeNull();
  });
});
