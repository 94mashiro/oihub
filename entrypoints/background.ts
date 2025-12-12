import { getSelectedTenant, tenantStore } from '@/lib/state/tenant-store';
import { settingStore } from '@/lib/state/setting-store';
import { quotaToCurrency } from '@/lib/utils/quota-converter';
import { TenantAPIService } from '@/lib/api';
import { CostPeriod } from '@/types/api';
import type { TenantId, TenantInfo } from '@/types/tenant';

interface FetchRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

interface FetchResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  status?: number;
}

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  // 定时轮询当日用量并触发告警（使用 alarms 以适配 MV3 service worker 生命周期）
  const ALARM_NAME = 'poll-daily-usage';
  const POLL_PERIOD_MINUTES = 1;

  // Create repeating alarm on startup
  browser.alarms
    .create(ALARM_NAME, { periodInMinutes: POLL_PERIOD_MINUTES })
    .catch((error) => console.error('Failed to create usage polling alarm:', error));

  // Run once immediately
  void pollDailyUsageAndAlert();

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
      void pollDailyUsageAndAlert();
    }
  });

  // Universal fetch handler - bypasses CORS
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'FETCH') {
      handleBackgroundFetch(message.payload)
        .then(sendResponse)
        .catch((error) => {
          sendResponse({
            success: false,
            error: error.message || 'Request failed',
          });
        });
      return true; // Keep message channel open for async response
    }
  });

  const unsubscribe = tenantStore.subscribe(
    getSelectedTenant,
    (tenant) => {
      console.log('Active tenant changed', tenant);
    },
    { fireImmediately: true },
  );

  // Listen for CHECK_USAGE_ALERT messages from popup
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'CHECK_USAGE_ALERT') {
      const { tenantId, tenantName, tenantInfo, todayUsage } = message.payload as {
        tenantId: TenantId;
        tenantName: string;
        tenantInfo: TenantInfo;
        todayUsage: number;
      };
      checkAndTriggerAlert(tenantId, tenantName, tenantInfo, todayUsage)
        .then(() => sendResponse({ success: true }))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;
    }
  });

  return () => {
    unsubscribe();
  };
});

/**
 * Poll daily usage for tenants with enabled alerts, then trigger notifications if needed.
 */
async function pollDailyUsageAndAlert(): Promise<void> {
  const { tenantList } = tenantStore.getState();
  const settingState = settingStore.getState();

  const enabledTenantIds = new Set(
    Object.entries(settingState.dailyUsageAlert)
      .filter(([, cfg]) => cfg?.enabled && cfg.threshold > 0)
      .map(([tenantId]) => tenantId),
  );

  if (enabledTenantIds.size === 0) return;

  const targets = tenantList.filter((t) => enabledTenantIds.has(t.id));
  if (targets.length === 0) return;

  await Promise.allSettled(
    targets.map(async (tenant) => {
      try {
        const api = new TenantAPIService(tenant);

        const [infoResult, costResult] = await Promise.allSettled([
          // tenant.info 可能为空或过期，拉取最新 status 用于展示
          api.getStatus(),
          api.getCostData(CostPeriod.DAY_1),
        ]);

        const tenantInfo: TenantInfo | undefined =
          infoResult.status === 'fulfilled' ? infoResult.value : tenant.info;
        if (!tenantInfo) return;

        if (costResult.status === 'fulfilled') {
          const todayUsage = costResult.value.reduce((sum, item) => sum + item.quota, 0);
          await checkAndTriggerAlert(tenant.id, tenant.name, tenantInfo, todayUsage);
        } else {
          console.warn('Failed to fetch cost data for tenant', tenant.id, costResult.reason);
        }
      } catch (error) {
        console.error('Error polling daily usage for tenant', tenant.id, error);
      }
    }),
  );
}

/**
 * Handle fetch requests in background - bypasses CORS
 */
async function handleBackgroundFetch(request: FetchRequest): Promise<FetchResponse> {
  const { url, method = 'GET', headers = {}, body, timeout = 30000 } = request;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    let data: unknown;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return {
        success: false,
        error:
          (data as { message?: string })?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        data,
      };
    }

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout',
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Check if usage exceeds threshold and trigger notification
 */
async function checkAndTriggerAlert(
  tenantId: TenantId,
  tenantName: string,
  tenantInfo: TenantInfo,
  todayUsage: number,
): Promise<void> {
  const state = settingStore.getState();
  const config = state.dailyUsageAlert[tenantId];

  // Skip if alert not enabled or no threshold set
  if (!config?.enabled || config.threshold <= 0) {
    return;
  }

  // Skip if already alerted today
  const today = getTodayString();
  const alertedDate = state.alertedToday[tenantId];
  if (alertedDate === today) {
    return;
  }

  // Clear stale alerted records (from previous days)
  if (alertedDate && alertedDate !== today) {
    await state.clearAlertedToday();
  }

  // Check if usage exceeds threshold
  if (todayUsage >= config.threshold) {
    // Mark as alerted
    await state.markAlerted(tenantId);

    // Convert to currency for display
    const usageCurrency = quotaToCurrency(todayUsage, tenantInfo);
    const thresholdCurrency = quotaToCurrency(config.threshold, tenantInfo);
    const displayType = tenantInfo.quota_display_type || 'CNY';

    // Send notification
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
