import { describe, expect, test } from 'bun:test';
import { quotaToCurrency, currencyToQuota } from './quota-converter';
import type { TenantInfo } from '@/types/tenant';

const mockTenantInfo: TenantInfo = {
  creditUnit: 500000, // 500000 quota = 1 USD
  exchangeRate: 7.2, // Not used in conversion, only for reference
  displayFormat: 'USD',
  endpoints: [],
};

describe('quotaToCurrency', () => {
  test('converts quota to currency correctly', () => {
    // 500000 quota = 1 USD
    expect(quotaToCurrency(500000, mockTenantInfo)).toBe(1);
  });

  test('handles zero quota', () => {
    expect(quotaToCurrency(0, mockTenantInfo)).toBe(0);
  });

  test('handles large quota values', () => {
    // 5000000 quota = 10 USD
    expect(quotaToCurrency(5000000, mockTenantInfo)).toBe(10);
  });

  test('handles zero quota_per_unit', () => {
    const zeroUnitInfo: TenantInfo = {
      ...mockTenantInfo,
      creditUnit: 0,
    };
    expect(quotaToCurrency(500000, zeroUnitInfo)).toBe(0);
  });

  test('handles fractional results', () => {
    // 435000 quota = 0.87 USD
    expect(quotaToCurrency(435000, mockTenantInfo)).toBeCloseTo(0.87, 2);
  });
});

describe('currencyToQuota', () => {
  test('converts currency to quota correctly', () => {
    // 1 USD = 500000 quota
    expect(currencyToQuota(1, mockTenantInfo)).toBe(500000);
  });

  test('handles zero currency', () => {
    expect(currencyToQuota(0, mockTenantInfo)).toBe(0);
  });

  test('handles large currency values', () => {
    // 10 USD = 5000000 quota
    expect(currencyToQuota(10, mockTenantInfo)).toBe(5000000);
  });

  test('handles fractional currency', () => {
    // 0.86 USD = 430000 quota
    expect(currencyToQuota(0.86, mockTenantInfo)).toBe(430000);
  });
});

describe('bidirectional conversion', () => {
  test('quota -> currency -> quota is reversible', () => {
    const originalQuota = 1000000;
    const currency = quotaToCurrency(originalQuota, mockTenantInfo);
    const backToQuota = currencyToQuota(currency, mockTenantInfo);
    expect(backToQuota).toBeCloseTo(originalQuota, 5);
  });

  test('currency -> quota -> currency is reversible', () => {
    const originalCurrency = 2.5;
    const quota = currencyToQuota(originalCurrency, mockTenantInfo);
    const backToCurrency = quotaToCurrency(quota, mockTenantInfo);
    expect(backToCurrency).toBeCloseTo(originalCurrency, 5);
  });
});
