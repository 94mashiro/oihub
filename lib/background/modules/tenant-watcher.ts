import { getSelectedTenant, tenantStore } from '@/lib/state/tenant-store';
import type { BackgroundModule } from '@/lib/background';

export const tenantWatcherModule: BackgroundModule = {
  name: 'tenant-watcher',
  init() {
    const unsubscribe = tenantStore.subscribe(
      getSelectedTenant,
      (tenant) => {
        console.log('[tenant-watcher] Active tenant changed', tenant);
      },
      { fireImmediately: true },
    );

    return unsubscribe;
  },
};
