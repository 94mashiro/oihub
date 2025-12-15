import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from '@/components/ui/frame';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useTenantStore } from '@/lib/state/tenant-store';
import { useSettingStore } from '@/lib/state/setting-store';
import { quotaToCurrency, currencyToQuota } from '@/lib/utils/quota-converter';
import type { Tenant } from '@/types/tenant';

const PopupSettingsScreen = () => {
  const navigate = useNavigate();
  const tenantList = useTenantStore((state) => state.tenantList);
  const tenantReady = useTenantStore((state) => state.ready);
  const dailyUsageAlert = useSettingStore((state) => state.dailyUsageAlert);
  const setDailyUsageAlert = useSettingStore((state) => state.setDailyUsageAlert);
  const experimentalFeatures = useSettingStore((state) => state.experimentalFeatures);
  const setExperimentalFeature = useSettingStore((state) => state.setExperimentalFeature);
  const settingReady = useSettingStore((state) => state.ready);

  if (!tenantReady || !settingReady) {
    return (
      <Frame>
        <FrameHeader className="relative p-2">
          <div className="absolute top-2.5 left-2">
            <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft />
            </Button>
          </div>
          <div className="pl-10">
            <FrameTitle>设置</FrameTitle>
            <FrameDescription className="mt-0.5 text-xs">配置扩展选项</FrameDescription>
          </div>
        </FrameHeader>
        <FramePanel className="rounded-md p-2">
          <p className="text-muted-foreground text-xs">加载中...</p>
        </FramePanel>
      </Frame>
    );
  }

  return (
    <Frame>
      <FrameHeader className="relative p-2">
        <div className="absolute top-2.5 left-2">
          <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
        </div>
        <div className="pl-10">
          <FrameTitle>设置</FrameTitle>
          <FrameDescription className="mt-0.5 text-xs">配置扩展选项</FrameDescription>
        </div>
      </FrameHeader>
      <FramePanel className="rounded-md p-2">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Bell className="text-muted-foreground size-3.5" />
            <span className="text-sm font-medium">今日额度告警</span>
          </div>
          <p className="text-muted-foreground text-xs">
            当账号今日用量达到设定阈值时，发送浏览器通知提醒
          </p>
          {tenantList.length === 0 ? (
            <p className="text-muted-foreground text-xs">暂无账号，请先添加账号</p>
          ) : (
            <div className="divide-border/50 divide-y">
              {tenantList.map((tenant) => (
                <TenantAlertConfig
                  key={tenant.id}
                  tenant={tenant}
                  config={dailyUsageAlert[tenant.id]}
                  onConfigChange={(config) => setDailyUsageAlert(tenant.id, config)}
                />
              ))}
            </div>
          )}
        </div>
      </FramePanel>
      <FramePanel className="rounded-md p-2">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <FlaskConical className="text-muted-foreground size-3.5" />
            <span className="text-sm font-medium">实验性功能</span>
          </div>
          <p className="text-muted-foreground text-xs">这些功能仍在开发中，可能不稳定</p>
          <div className="divide-border/50 divide-y">
            <div className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-foreground text-xs font-medium">一键导出</span>
                  <p className="text-muted-foreground mt-0.5 text-[10px]">
                    在令牌列表中显示一键导出按钮
                  </p>
                </div>
                <Switch
                  checked={experimentalFeatures.tokenExport}
                  onCheckedChange={(checked) => setExperimentalFeature('tokenExport', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </FramePanel>
    </Frame>
  );
};

interface TenantAlertConfigProps {
  tenant: Tenant;
  config?: { enabled: boolean; threshold: number };
  onConfigChange: (config: { enabled: boolean; threshold: number }) => void;
}

const TenantAlertConfig = ({ tenant, config, onConfigChange }: TenantAlertConfigProps) => {
  const enabled = config?.enabled ?? false;
  const threshold = config?.threshold ?? 0;
  const tenantInfo = tenant.info;

  // Local state for input value (in currency units)
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  // Sync input value when threshold or tenantInfo changes
  useEffect(() => {
    if (!tenantInfo || threshold === 0) {
      setInputValue('');
    } else {
      setInputValue(quotaToCurrency(threshold, tenantInfo).toFixed(2));
    }
  }, [threshold, tenantInfo]);

  const handleToggle = (checked: boolean) => {
    onConfigChange({ enabled: checked, threshold });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError('');
  };

  const handleInputBlur = () => {
    if (!tenantInfo) return;

    const value = parseFloat(inputValue);
    if (isNaN(value) || value <= 0) {
      if (inputValue !== '') {
        setError('请输入正数');
      }
      return;
    }

    const quotaValue = currencyToQuota(value, tenantInfo);
    onConfigChange({ enabled, threshold: quotaValue });
    setInputValue(value.toFixed(2));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const hasInfo = !!tenantInfo;
  const displayType = tenantInfo?.quota_display_type || 'CNY';

  return (
    <div className="py-2.5 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-foreground truncate text-xs font-medium">{tenant.name}</span>
        </div>
        <Switch checked={enabled} onCheckedChange={handleToggle} />
      </div>
      {enabled && (
        <div className="mt-2">
          {!hasInfo ? (
            <p className="text-muted-foreground text-[10px]">请先刷新账号信息以配置阈值</p>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-[10px]">阈值</span>
              <Input
                type="number"
                size="sm"
                placeholder="0.00"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                className="w-20 text-xs [&_input]:text-xs"
                min={0}
                step={0.01}
              />
              <span className="text-muted-foreground text-[10px]">{displayType}</span>
            </div>
          )}
          {error && <p className="text-destructive mt-1 text-[10px]">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default PopupSettingsScreen;
