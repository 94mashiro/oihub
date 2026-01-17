import { tenantStore } from '@/lib/state/tenant-store';
import { tenantInfoStore } from '@/lib/state/tenant-info-store';
import { balanceStore } from '@/lib/state/balance-store';
import { costStore } from '@/lib/state/cost-store';
import { settingStore } from '@/lib/state/setting-store';
import { createBalanceOrchestrator, createTenantInfoOrchestrator, createCostOrchestrator } from '@/lib/api/orchestrators';
import { messageRouter, type BackgroundModule } from '@/lib/background';
import { CostPeriod } from '@/types/api';
import type { TenantInfo } from '@/types/tenant';

const ALARM_NAME = 'poll-badge-balance';
const POLL_PERIOD_MINUTES = 5;

async function waitForStoresReady(timeoutMs = 5000): Promise<boolean> {
  const start = Date.now();
  console.log('[badge] Waiting for stores to hydrate...');
  while (Date.now() - start < timeoutMs) {
    if (
      tenantStore.getState().ready &&
      settingStore.getState().ready &&
      balanceStore.getState().ready &&
      costStore.getState().ready
    ) {
      console.log('[badge] Stores ready after', Date.now() - start, 'ms');
      return true;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  console.warn('[badge] Store hydration timeout, proceeding with current state');
  return false;
}

/**
 * Convert quota to display value using the same logic as quotaToPrice
 * This ensures badge shows the same value as tenant card
 */
function quotaToDisplayValue(quota: number, tenantInfo: TenantInfo): number {
  const quotaPerUnit = tenantInfo.creditUnit || 1;
  return quota / quotaPerUnit;
}

/**
 * Format balance for badge display
 * Badge best displays ~4 characters, max ~6 characters
 * Prioritizes readability within browser constraints
 */
function formatBadgeText(value: number): string {
  if (value < 0) return '';
  // 0-9.99: show as "9.99" (4 chars)
  if (value < 10) return value.toFixed(2);
  // 10-99.9: show as "99.9" (4 chars)
  if (value < 100) return value.toFixed(1);
  // 100-999: show as "999" (3 chars)
  if (value < 1000) return value.toFixed(0);
  // 1k-9.9k: show as "9.9k" (4 chars)
  if (value < 10000) return (value / 1000).toFixed(1) + 'k';
  // 10k-99k: show as "99k" (3 chars)
  if (value < 100000) return (value / 1000).toFixed(0) + 'k';
  // 100k-999k: show as "999k" (4 chars)
  if (value < 1000000) return (value / 1000).toFixed(0) + 'k';
  // 1m+: show as "9.9m" (4 chars)
  return (value / 1000000).toFixed(1) + 'm';
}

async function updateBadge(): Promise<void> {
  console.log('[badge] updateBadge started');
  await waitForStoresReady();

  const { badgeConfig } = settingStore.getState();

  // If badge is disabled or no tenant selected, clear badge
  if (!badgeConfig.enabled || !badgeConfig.tenantId) {
    console.log('[badge] Badge disabled or no tenant selected, clearing badge');
    await clearBadge();
    return;
  }

  const tenantId = badgeConfig.tenantId;
  const displayType = badgeConfig.displayType;
  const allTenants = tenantStore.getState().tenantList;

  // Determine which tenants to process
  const targetTenants = tenantId === 'all' ? allTenants : allTenants.filter((t) => t.id === tenantId);

  if (targetTenants.length === 0) {
    console.log('[badge] No tenants found, clearing badge');
    await clearBadge();
    return;
  }

  let totalValue = 0;
  let hasData = false;

  for (const tenant of targetTenants) {
    let balance = balanceStore.getState().getBalance(tenant.id);
    let tenantInfo = tenantInfoStore.getState().getTenantInfo(tenant.id);
    let costs = costStore.getState().getCost(tenant.id, CostPeriod.DAY_1);

    // If no cached data, fetch from API
    if (!balance || !tenantInfo || (displayType === 'daily' && !costs)) {
      try {
        const balanceOrchestrator = createBalanceOrchestrator(tenant);
        const infoOrchestrator = createTenantInfoOrchestrator(tenant);

        const promises: Promise<any>[] = [
          balanceOrchestrator.refresh(),
          infoOrchestrator.refresh(),
        ];

        if (displayType === 'daily') {
          const costOrchestrator = createCostOrchestrator(tenant, CostPeriod.DAY_1);
          promises.push(costOrchestrator.refresh());
        }

        const results = await Promise.allSettled(promises);

        if (results[0].status === 'fulfilled') {
          balance = results[0].value;
        }
        if (results[1].status === 'fulfilled') {
          tenantInfo = results[1].value;
        }
        if (displayType === 'daily' && results[2]?.status === 'fulfilled') {
          costs = results[2].value;
        }
      } catch (error) {
        console.error('[badge] Failed to fetch data for tenant', tenant.name, error);
        continue;
      }
    }

    if (!balance || !tenantInfo) {
      console.log('[badge] No balance or tenant info for tenant', tenant.name);
      continue;
    }

    // Calculate value based on display type
    let value = 0;
    if (displayType === 'balance') {
      value = quotaToDisplayValue(balance.remainingCredit, tenantInfo);
    } else if (displayType === 'historical') {
      value = quotaToDisplayValue(balance.consumedCredit, tenantInfo);
    } else if (displayType === 'daily') {
      if (costs && costs.length > 0) {
        const totalCost = costs.reduce((sum, cost) => sum + cost.creditCost, 0);
        value = quotaToDisplayValue(totalCost, tenantInfo);
      }
    }

    totalValue += value;
    hasData = true;
  }

  if (!hasData) {
    console.log('[badge] No data available');
    await clearBadge();
    return;
  }

  const badgeText = formatBadgeText(totalValue);

  console.log('[badge] Setting badge:', badgeText, 'type:', displayType, 'tenants:', targetTenants.length);

  try {
    await browser.action.setBadgeText({ text: badgeText });
    // Use zinc-700 (#3f3f46) to match project's zinc-based design system
    // Provides good contrast with white badge text
    await browser.action.setBadgeBackgroundColor({ color: '#3f3f46' });
  } catch (error) {
    console.error('[badge] Failed to set badge:', error);
  }
}

async function clearBadge(): Promise<void> {
  try {
    await browser.action.setBadgeText({ text: '' });
  } catch (error) {
    console.error('[badge] Failed to clear badge:', error);
  }
}

function onAlarm(alarm: { name: string }): void {
  if (alarm.name === ALARM_NAME) {
    console.log('[badge] Alarm triggered');
    void updateBadge();
  }
}

export const badgeModule: BackgroundModule = {
  name: 'badge',
  init() {
    // Create polling alarm
    browser.alarms
      .create(ALARM_NAME, { periodInMinutes: POLL_PERIOD_MINUTES })
      .catch((error) => console.error('[badge] Failed to create badge polling alarm:', error));

    // Initial update
    void updateBadge();

    // Listen to alarms
    browser.alarms.onAlarm.addListener(onAlarm);

    // Listen for balance changes from popup
    messageRouter.register('UPDATE_BADGE', async () => {
      await updateBadge();
      return { success: true };
    });

    // Listen to storage changes to update badge when config or balance changes
    const unwatch = settingStore.subscribe(
      (state) => state.badgeConfig,
      () => {
        console.log('[badge] Badge config changed, updating badge');
        void updateBadge();
      },
    );

    const unwatchBalance = balanceStore.subscribe(
      (state) => state.balanceMap,
      () => {
        const { badgeConfig } = settingStore.getState();
        if (badgeConfig.enabled && badgeConfig.tenantId) {
          console.log('[badge] Balance changed, updating badge');
          void updateBadge();
        }
      },
    );

    const unwatchCost = costStore.subscribe(
      (state) => state.costMap,
      () => {
        const { badgeConfig } = settingStore.getState();
        if (badgeConfig.enabled && badgeConfig.tenantId && badgeConfig.displayType === 'daily') {
          console.log('[badge] Cost changed, updating badge');
          void updateBadge();
        }
      },
    );

    return () => {
      browser.alarms.onAlarm.removeListener(onAlarm);
      unwatch();
      unwatchBalance();
      unwatchCost();
    };
  },
};
