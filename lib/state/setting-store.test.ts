import { beforeEach, describe, expect, test } from 'bun:test';
import {
  installFakeBrowser,
  resetFakeBrowser,
  waitForStoreReady,
} from '@/lib/test/wxt-test-helpers';

describe('settingStore', () => {
  beforeEach(() => {
    installFakeBrowser();
    resetFakeBrowser();
  });

  test('setDailyUsageAlert and removeDailyUsageAlert update state', async () => {
    const { settingStore } = await import('./setting-store');
    await waitForStoreReady(settingStore);

    const tenantId = 'tenant-1' as any;
    await settingStore.getState().setDailyUsageAlert(tenantId, { enabled: true, threshold: 123 });

    expect(settingStore.getState().dailyUsageAlert[tenantId]).toEqual({
      enabled: true,
      threshold: 123,
    });

    await settingStore.getState().removeDailyUsageAlert(tenantId);
    expect(settingStore.getState().dailyUsageAlert[tenantId]).toBeUndefined();
  });

  test('markAlerted sets alertedToday and isAlertedToday returns true', async () => {
    const { settingStore } = await import('./setting-store');
    await waitForStoreReady(settingStore);

    const tenantId = 'tenant-2' as any;

    await settingStore.getState().clearAlertedToday();
    expect(settingStore.getState().isAlertedToday(tenantId)).toBe(false);

    await settingStore.getState().markAlerted(tenantId);
    expect(settingStore.getState().isAlertedToday(tenantId)).toBe(true);
    expect(settingStore.getState().alertedToday[tenantId]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('clearAlertedToday clears all alertedToday entries', async () => {
    const { settingStore } = await import('./setting-store');
    await waitForStoreReady(settingStore);

    const tenantA = 'tenant-a' as any;
    const tenantB = 'tenant-b' as any;

    await settingStore.getState().markAlerted(tenantA);
    await settingStore.getState().markAlerted(tenantB);

    expect(Object.keys(settingStore.getState().alertedToday).length).toBeGreaterThanOrEqual(2);

    await settingStore.getState().clearAlertedToday();

    expect(settingStore.getState().alertedToday).toEqual({});
    expect(settingStore.getState().isAlertedToday(tenantA)).toBe(false);
    expect(settingStore.getState().isAlertedToday(tenantB)).toBe(false);
  });
});
