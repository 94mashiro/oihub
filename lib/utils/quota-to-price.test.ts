import { describe, expect, test } from 'bun:test';
import { quotaToPrice } from './quota-to-price';

describe('quotaToPrice', () => {
  test('formats with 2 decimals and unit symbol', () => {
    expect(quotaToPrice(500000, 500000, 'USD')).toBe('$1.00');
    expect(quotaToPrice(500000, 500000, 'CNY')).toBe('¥1.00');
  });

  test('formats without symbol when unit is missing or unknown', () => {
    expect(quotaToPrice(500000, 500000)).toBe('1.00');
    expect(quotaToPrice(500000, 500000, 'EUR')).toBe('1.00');
  });

  test('formats with thousands separators', () => {
    expect(quotaToPrice(123456789, 1, 'USD')).toBe('$123,456,789.00');
  });
});
