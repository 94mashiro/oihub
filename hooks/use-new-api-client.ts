import { useMemo } from 'react';
import { getSelectedTenant, useTenantStore } from '@/lib/state/tenant-store';
import { createNewAPIClient, defaultErrorHandler, type NewAPIClient } from '@/lib/api/newapi';

/**
 * Hook to get NewAPI client for the currently selected tenant
 */
export function useNewAPIClient(options?: {
  enableLogging?: boolean;
  timeout?: number;
  /** 是否显示错误 Toast，默认 true */
  showErrorToast?: boolean;
}): NewAPIClient | null {
  const selectedTenant = useTenantStore(getSelectedTenant);

  const client = useMemo(() => {
    if (!selectedTenant) {
      console.warn('[useNewAPIClient] No tenant selected');
      return null;
    }

    return createNewAPIClient({
      baseURL: selectedTenant.url,
      token: selectedTenant.token,
      userId: selectedTenant.userId,
      timeout: options?.timeout,
      enableLogging: options?.enableLogging,
      onError: options?.showErrorToast !== false ? defaultErrorHandler : undefined,
    });
  }, [selectedTenant, options?.timeout, options?.enableLogging, options?.showErrorToast]);

  return client;
}
