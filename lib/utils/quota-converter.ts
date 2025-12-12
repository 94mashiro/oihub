import type { TenantInfo } from '@/types/tenant';

/**
 * Convert raw quota to display currency (for UI display)
 * Uses the same formula as quotaToPrice in utils/quota-to-price.ts
 * Formula: quota / quota_per_unit = display value (USD or CNY based on quota_display_type)
 */
export function quotaToCurrency(quota: number, tenantInfo: TenantInfo): number {
  const { quota_per_unit } = tenantInfo;
  if (quota_per_unit === 0) return 0;
  return quota / quota_per_unit;
}

/**
 * Convert display currency to raw quota (for storage)
 * Formula: currency * quota_per_unit = quota
 */
export function currencyToQuota(currency: number, tenantInfo: TenantInfo): number {
  const { quota_per_unit } = tenantInfo;
  return currency * quota_per_unit;
}
