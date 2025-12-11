import { describe, expect, test } from 'bun:test';
import { getTimestampRange } from './tenant-api-service';
import { CostPeriod } from '@/types/api';

describe('getTimestampRange', () => {
  test('returns correct range for DAY_1', () => {
    const [start, end] = getTimestampRange(CostPeriod.DAY_1);
    expect(end).toBeGreaterThan(start);
    expect(end - start).toBeLessThanOrEqual(24 * 60 * 60);
  });

  test('returns correct range for DAY_7', () => {
    const [start, end] = getTimestampRange(CostPeriod.DAY_7);
    expect(end).toBeGreaterThan(start);
    const days = Math.ceil((end - start) / (24 * 60 * 60));
    expect(days).toBe(7);
  });

  test('returns correct range for DAY_14', () => {
    const [start, end] = getTimestampRange(CostPeriod.DAY_14);
    expect(end).toBeGreaterThan(start);
    const days = Math.ceil((end - start) / (24 * 60 * 60));
    expect(days).toBe(14);
  });

  test('returns correct range for DAY_30', () => {
    const [start, end] = getTimestampRange(CostPeriod.DAY_30);
    expect(end).toBeGreaterThan(start);
    const days = Math.ceil((end - start) / (24 * 60 * 60));
    expect(days).toBe(30);
  });

  test('start is at 00:00:00 and end is at 23:59:59', () => {
    const [start, end] = getTimestampRange(CostPeriod.DAY_1);
    const startDate = new Date(start * 1000);
    const endDate = new Date(end * 1000);
    expect(startDate.getHours()).toBe(0);
    expect(startDate.getMinutes()).toBe(0);
    expect(endDate.getHours()).toBe(23);
    expect(endDate.getMinutes()).toBe(59);
  });
});
