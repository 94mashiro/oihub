import type { TenantInfo } from '@/types/tenant';

/**
 * Convert raw quota to display currency (for UI display)
 * Uses the same formula as quotaToPrice in utils/quota-to-price.ts
 * Formula: quota / creditUnit = display value (USD or CNY based on displayFormat)
 */
export function quotaToCurrency(quota: number, tenantInfo: TenantInfo): number {
  const { creditUnit } = tenantInfo;
  if (!creditUnit || creditUnit === 0) return 0;
  return quota / creditUnit;
}

/**
 * Convert display currency to raw quota (for storage)
 * Formula: currency * creditUnit = quota
 */
export function currencyToQuota(currency: number, tenantInfo: TenantInfo): number {
  const { creditUnit } = tenantInfo;
  if (!creditUnit) return 0;
  return currency * creditUnit;
}
