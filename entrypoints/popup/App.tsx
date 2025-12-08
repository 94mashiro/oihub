import { HashRouter, Route, Routes } from 'react-router-dom';

import PopupMainScreen from '@/components/biz-screen/popup-main-screen';
import PopupTenantCreateScreen from '@/components/biz-screen/popup-tenant-create-screen';

const Popup = () => {
  return (
    <HashRouter>
      <div className="h-[560px] min-h-[560px] w-[420px] min-w-[420px] overflow-x-hidden overflow-y-auto p-3">
        <Routes>
          <Route path="/" element={<PopupMainScreen />} />
          <Route path="/tenant/create" element={<PopupTenantCreateScreen />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default Popup;
