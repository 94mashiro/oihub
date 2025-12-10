import TenantSelector from '@/components/biz/tenant-select';

const PopupMainScreen = () => {
  return (
    <div className="flex h-full flex-col gap-4">
      <TenantSelector />
    </div>
  );
};

export default PopupMainScreen;
