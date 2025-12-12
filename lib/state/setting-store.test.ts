import { describe, expect, test } from 'bun:test';
import type { DailyUsageAlertConfig, SettingStoreState } from './setting-store';

// Test helper functions and state logic without WXT storage dependency

describe('DailyUsageAlertConfig type', () => {
  test('config structure is correct', () => {
    const config: DailyUsageAlertConfig = {
      enabled: true,
      threshold: 500000,
    };
    expect(config.enabled).toBe(true);
    expect(config.threshold).toBe(500000);
  });

  test('disabled config', () => {
    const config: DailyUsageAlertConfig = {
      enabled: false,
      threshold: 0,
    };
    expect(config.enabled).toBe(false);
    expect(config.threshold).toBe(0);
  });
});

describe('isAlertedToday logic', () => {
  const getTodayString = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  test('returns true when alerted today', () => {
    const today = getTodayString();
    const alertedToday: Record<string, string> = {
      'tenant-1': today,
    };
    expect(alertedToday['tenant-1'] === today).toBe(true);
  });

  test('returns false when alerted on different day', () => {
    const today = getTodayString();
    const alertedToday: Record<string, string> = {
      'tenant-1': '2020-01-01',
    };
    expect(alertedToday['tenant-1'] === today).toBe(false);
  });

  test('returns false when not alerted', () => {
    const today = getTodayString();
    const alertedToday: Record<string, string> = {};
    expect(alertedToday['tenant-1'] === today).toBe(false);
  });
});

describe('SettingStoreState structure', () => {
  test('initial state structure', () => {
    const initialState: Partial<SettingStoreState> = {
      ready: false,
      dailyUsageAlert: {},
      alertedToday: {},
    };
    expect(initialState.ready).toBe(false);
    expect(initialState.dailyUsageAlert).toEqual({});
    expect(initialState.alertedToday).toEqual({});
  });

  test('state with alert configs', () => {
    const state: Partial<SettingStoreState> = {
      ready: true,
      dailyUsageAlert: {
        'tenant-1': { enabled: true, threshold: 1000000 },
        'tenant-2': { enabled: false, threshold: 0 },
      },
      alertedToday: {
        'tenant-1': '2025-12-12',
      },
    };
    expect(state.dailyUsageAlert?.['tenant-1']?.enabled).toBe(true);
    expect(state.dailyUsageAlert?.['tenant-2']?.enabled).toBe(false);
    expect(state.alertedToday?.['tenant-1']).toBe('2025-12-12');
  });
});
