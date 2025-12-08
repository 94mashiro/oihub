import { getSelectedTenant, tenantStore } from '@/lib/state/tenant-store';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  const unsubscribe = tenantStore.subscribe(
    getSelectedTenant,
    (tenant) => {
      console.log('Active tenant changed', tenant);
    },
    { fireImmediately: true },
  );

  return () => {
    unsubscribe();
  };
});
