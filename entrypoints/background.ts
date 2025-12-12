import { moduleRegistry, messageRouter } from '@/lib/background';
import { usageAlertModule } from '@/lib/background/modules/usage-alert';
import { fetchProxyModule } from '@/lib/background/modules/fetch-proxy';
import { tenantWatcherModule } from '@/lib/background/modules/tenant-watcher';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  messageRouter.init();

  const cleanup = moduleRegistry.initAll([
    fetchProxyModule,
    usageAlertModule,
    tenantWatcherModule,
  ]);

  return cleanup;
});
