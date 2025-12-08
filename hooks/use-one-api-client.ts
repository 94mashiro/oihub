import { useMemo } from 'react';
import { getSelectedTenant, useTenantStore } from '@/lib/state/tenant-store';
import { createOneAPIClient, type OneAPIClient } from '@/lib/api/oneapi';

/**
 * Hook to get OneAPI client for the currently selected tenant
 */
export function useOneAPIClient(options?: {
  enableLogging?: boolean;
  timeout?: number;
}): OneAPIClient | null {
  const selectedTenant = useTenantStore(getSelectedTenant);

  const client = useMemo(() => {
    if (!selectedTenant) {
      console.warn('[useOneAPIClient] No tenant selected');
      return null;
    }

    // Create client instance directly from selectedTenant
    return createOneAPIClient({
      baseURL: selectedTenant.url,
      token: selectedTenant.token,
      userId: selectedTenant.userId,
      timeout: options?.timeout,
      enableLogging: options?.enableLogging,
    });
  }, [selectedTenant, options]);

  return client;
}
