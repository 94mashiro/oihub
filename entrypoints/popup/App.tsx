import { HashRouter, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import PopupMainScreen from '@/components/biz-screen/popup-main-screen';
import PopupTenantCreateScreen from '@/components/biz-screen/popup-tenant-create-screen';
import PopupTenantEditScreen from '@/components/biz-screen/popup-tenant-edit-screen';
import PopupSettingsScreen from '@/components/biz-screen/popup-settings-screen';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToastProvider } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';

// Lazy load analytics screen for better performance
const PopupTenantAnalyticsScreen = lazy(() =>
  import('@/components/biz-screen/PopupTenantAnalyticsScreen').then((m) => ({
    default: m.PopupTenantAnalyticsScreen,
  })),
);

const Popup = () => {
  return (
    <ToastProvider position="top-center" limit={1}>
      <HashRouter>
        <div className="m-2 w-[420px]">
          <ScrollArea className="h-[580px]">
            <Suspense
              fallback={
                <div className="flex h-[580px] items-center justify-center">
                  <Spinner />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<PopupMainScreen />} />
                <Route path="/tenant/create" element={<PopupTenantCreateScreen />} />
                <Route path="/tenant/edit/:id" element={<PopupTenantEditScreen />} />
                <Route path="/settings" element={<PopupSettingsScreen />} />
                <Route path="/analytics/:tenantId" element={<PopupTenantAnalyticsScreen />} />
              </Routes>
            </Suspense>
          </ScrollArea>
        </div>
      </HashRouter>
    </ToastProvider>
  );
};

export default Popup;
