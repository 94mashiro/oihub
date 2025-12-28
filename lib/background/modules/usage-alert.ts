import type { Browser } from 'wxt/browser';
import { tenantStore } from '@/lib/state/tenant-store';
import { tenantInfoStore } from '@/lib/state/tenant-info-store';
import { settingStore } from '@/lib/state/setting-store';
import { quotaToCurrency } from '@/lib/utils/quota-converter';
import { TenantInfoOrchestrator, CostOrchestrator } from '@/lib/api/orchestrators';
import { CostPeriod } from '@/types/api';
import type { TenantId, TenantInfo } from '@/types/tenant';
import { messageRouter, type BackgroundModule } from '@/lib/background';

const ALARM_NAME = 'poll-daily-usage';
const POLL_PERIOD_MINUTES = 1;

async function waitForStoresReady(timeoutMs = 5000): Promise<boolean> {
  const start = Date.now();
  console.log('[usage-alert] Waiting for stores to hydrate...');
  while (Date.now() - start < timeoutMs) {
    if (tenantStore.getState().ready && settingStore.getState().ready) {
      console.log('[usage-alert] Stores ready after', Date.now() - start, 'ms');
      return true;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  console.warn('[usage-alert] Store hydration timeout, proceeding with current state');
  return false;
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

async function checkAndTriggerAlert(
  tenantId: TenantId,
  tenantName: string,
  tenantInfo: TenantInfo,
  todayUsage: number,
): Promise<void> {
  const state = settingStore.getState();
  const config = state.dailyUsageAlert[tenantId];

  if (!config?.enabled || config.threshold <= 0) return;

  const today = getTodayString();
  const alertedDate = state.alertedToday[tenantId];
  if (alertedDate === today) return;

  if (alertedDate && alertedDate !== today) {
    await state.clearAlertedToday();
  }

  if (todayUsage >= config.threshold) {
    await state.markAlerted(tenantId);

    const usageCurrency = quotaToCurrency(todayUsage, tenantInfo);
    const thresholdCurrency = quotaToCurrency(config.threshold, tenantInfo);
    const displayType = tenantInfo.displayFormat || 'CNY';

    try {
      await browser.notifications.create(`usage-alert-${tenantId}`, {
        type: 'basic',
        iconUrl: browser.runtime.getURL('/icon/128.png'),
        title: `${tenantName} 额度告警`,
        message: `今日用量 ${usageCurrency.toFixed(2)} ${displayType} 已达到阈值 ${thresholdCurrency.toFixed(2)} ${displayType}`,
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }
}

async function pollDailyUsageAndAlert(): Promise<void> {
  console.log('[usage-alert] pollDailyUsageAndAlert started');
  await waitForStoresReady();

  const { tenantList } = tenantStore.getState();
  const settingState = settingStore.getState();

  const enabledTenantIds = new Set(
    Object.entries(settingState.dailyUsageAlert)
      .filter(([, cfg]) => cfg?.enabled && cfg.threshold > 0)
      .map(([tenantId]) => tenantId),
  );

  if (enabledTenantIds.size === 0) {
    console.log('[usage-alert] No enabled alerts, skipping');
    return;
  }

  const targets = tenantList.filter((t) => enabledTenantIds.has(t.id));
  if (targets.length === 0) {
    console.log('[usage-alert] No matching tenants for alerts, skipping');
    return;
  }

  console.log('[usage-alert] Polling usage for', targets.length, 'tenant(s)');

  await Promise.allSettled(
    targets.map(async (tenant) => {
      try {
        const infoOrchestrator = new TenantInfoOrchestrator(tenant);
        const costOrchestrator = new CostOrchestrator(tenant, CostPeriod.DAY_1);

        const [infoResult, costResult] = await Promise.allSettled([
          infoOrchestrator.refresh(),
          costOrchestrator.refresh(),
        ]);

        const tenantInfo: TenantInfo | undefined =
          infoResult.status === 'fulfilled'
            ? infoResult.value
            : tenantInfoStore.getState().getTenantInfo(tenant.id);
        if (!tenantInfo) return;

        if (costResult.status === 'fulfilled') {
          const todayUsage = costResult.value.reduce((sum, item) => sum + item.creditCost, 0);
          await checkAndTriggerAlert(tenant.id, tenant.name, tenantInfo, todayUsage);
        } else {
          console.warn('Failed to fetch cost data for tenant', tenant.id);
        }
      } catch (error) {
        console.error('Error polling daily usage for tenant', tenant.id, error);
      }
    }),
  );
}

function onAlarm(alarm: Browser.alarms.Alarm): void {
  if (alarm.name === ALARM_NAME) {
    console.log('[usage-alert] Alarm triggered');
    void pollDailyUsageAndAlert();
  }
}

export const usageAlertModule: BackgroundModule = {
  name: 'usage-alert',
  init() {
    browser.alarms
      .create(ALARM_NAME, { periodInMinutes: POLL_PERIOD_MINUTES })
      .catch((error) => console.error('Failed to create usage polling alarm:', error));

    void pollDailyUsageAndAlert();

    browser.alarms.onAlarm.addListener(onAlarm);

    messageRouter.register('CHECK_USAGE_ALERT', async (payload) => {
      const { tenantId, tenantName, tenantInfo, todayUsage } = payload as {
        tenantId: TenantId;
        tenantName: string;
        tenantInfo: TenantInfo;
        todayUsage: number;
      };
      await checkAndTriggerAlert(tenantId, tenantName, tenantInfo, todayUsage);
      return { success: true };
    });

    return () => {
      browser.alarms.onAlarm.removeListener(onAlarm);
    };
  },
};
