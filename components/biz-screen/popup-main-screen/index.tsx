import TenantSelector from '@/components/biz/tenant-select';

const PopupMainScreen = () => {
  const version = (() => {
    try {
      return browser.runtime.getManifest().version;
    } catch {
      return '';
    }
  })();

  return (
    <div className="flex h-full flex-col gap-4">
      <TenantSelector />
      {version ? (
        <div className="text-muted-foreground/70 mt-auto pt-2 text-center text-[10px]">
          版本 {version}
        </div>
      ) : null}
    </div>
  );
};

export default PopupMainScreen;
