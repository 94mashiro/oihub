import { Skeleton } from '@/components/ui/skeleton';
import { useTenantStore } from '@/lib/state/tenant-store';
import { useBalanceStore } from '@/lib/state/balance-store';
import { quotaToPrice } from '@/utils/quota-to-price';
import { useCostStore } from '@/lib/state/cost-store';
import { formatThousands } from '@/utils/format-number';
import { Button } from '@/components/ui/button';
import { EditIcon, Trash, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GroupSeparator, Group } from '@/components/ui/group';
import { Collapsible, CollapsiblePanel } from '@/components/ui/collapsible';
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion';
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { useMemo, useState } from 'react';

interface Props {
  tenantId: string;
  isSelected?: boolean;
}

const TenantSelectCard: React.FC<Props> = ({ tenantId, isSelected = false }) => {
  const navigate = useNavigate();
  const tenantInfo = useTenantStore((state) =>
    state.tenantList.find((tenant) => tenant.id === tenantId),
  );
  const balanceInfo = useBalanceStore((state) => state.balanceList[tenantId]);
  const todayCostInfo = useCostStore((state) => state.costList[tenantId]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // 聚合模型使用数据
  const modelUsage = useMemo(() => {
    if (!todayCostInfo || todayCostInfo.length === 0) return [];
    const totalQuota = todayCostInfo.reduce((t, c) => t + c.quota, 0);
    if (totalQuota === 0) return [];
    const grouped = todayCostInfo.reduce(
      (acc, c) => {
        if (!acc[c.model_name]) acc[c.model_name] = { quota: 0, tokens: 0 };
        acc[c.model_name].quota += c.quota;
        acc[c.model_name].tokens += c.token_used;
        return acc;
      },
      {} as Record<string, { quota: number; tokens: number }>,
    );
    return Object.entries(grouped)
      .map(([model, data]) => ({
        model,
        ...data,
        percent: Math.round((data.quota / totalQuota) * 100),
      }))
      .sort((a, b) => b.quota - a.quota)
      .slice(0, 5);
  }, [todayCostInfo]);

  if (!tenantInfo) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24" />
        <div className="flex gap-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    );
  }

  const quotaUnit = tenantInfo.info?.quota_per_unit;
  const displayType = tenantInfo.info?.quota_display_type;

  const balance = balanceInfo ? quotaToPrice(balanceInfo.quota, quotaUnit, displayType) : null;
  const usedQuota = balanceInfo
    ? quotaToPrice(balanceInfo.used_quota, quotaUnit, displayType)
    : null;
  const todayCost = todayCostInfo
    ? quotaToPrice(
        todayCostInfo.reduce((t, c) => t + c.quota, 0),
        quotaUnit,
        displayType,
      )
    : null;
  const todayTokensRaw = todayCostInfo?.reduce((t, c) => t + c.token_used, 0) ?? null;
  const todayTokens = todayTokensRaw !== null ? formatThousands(todayTokensRaw) : null;

  const apiEndpoints = tenantInfo.info?.api_info;

  const handleCopy = (e: React.MouseEvent, endpoint: { id: number; url: string }) => {
    e.stopPropagation();
    navigator.clipboard.writeText(endpoint.url);
    setCopiedId(endpoint.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="group relative">
      <Group className="absolute top-0 right-0">
        <Button
          size="icon"
          variant="outline"
          className="size-6"
          onClick={() => navigate(`/tenant/edit/${tenantId}`)}
        >
          <EditIcon className="size-3" />
        </Button>
        <GroupSeparator />
        <Button size="icon" variant="outline" className="size-6" onClick={() => {}}>
          <Trash className="size-3 text-red-400" />
        </Button>
      </Group>
      <div className="space-y-2">
        <p className="truncate text-sm font-medium">{tenantInfo.name}</p>
        <div>
          <p className="text-muted-foreground text-xs">余额</p>
          <p className="text-foreground text-xl font-semibold tracking-tight">
            {balance ?? <Skeleton className="h-7 w-20" />}
          </p>
        </div>
        <div className="text-muted-foreground space-y-0.5 text-xs">
          <div className="flex justify-between">
            <span>历史消耗</span>
            <span className="text-foreground">
              {usedQuota ?? <Skeleton className="inline-block h-3 w-12" />}
            </span>
          </div>
          <div className="flex justify-between">
            <span>今日费用</span>
            <span className="text-foreground">{todayCost ?? '–'}</span>
          </div>
          <div className="flex justify-between">
            <span>今日用量</span>
            <span className="text-foreground">
              {todayTokens ? `${todayTokens} ${todayTokensRaw <= 1 ? 'token' : 'tokens'}` : '–'}
            </span>
          </div>
        </div>

        {/* 选中态详情展开 */}
        <Collapsible open={isSelected}>
          <CollapsiblePanel>
            <Accordion className="border-border mt-3 border-t">
              <AccordionItem value="model-usage">
                <AccordionTrigger className="py-2 text-xs">今日模型消耗</AccordionTrigger>
                <AccordionPanel className="pb-2">
                  {modelUsage.length > 0 ? (
                    <div className="space-y-2">
                      {modelUsage.map((item) => (
                        <div key={item.model} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-foreground truncate">{item.model}</span>
                            <span className="text-muted-foreground tabular-nums">
                              {quotaToPrice(item.quota, quotaUnit, displayType)} ·{' '}
                              {formatThousands(item.tokens)} tokens
                            </span>
                          </div>
                          <Progress value={item.percent} className="h-1">
                            <ProgressTrack className="h-1">
                              <ProgressIndicator className="bg-foreground/72" />
                            </ProgressTrack>
                          </Progress>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-xs">暂无数据</p>
                  )}
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem value="api-endpoints">
                <AccordionTrigger className="py-2 text-xs">API 端点</AccordionTrigger>
                <AccordionPanel className="pb-2">
                  {apiEndpoints && apiEndpoints.length > 0 ? (
                    <div className="space-y-2">
                      {apiEndpoints.map((endpoint) => (
                        <div key={endpoint.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-foreground">{endpoint.route}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-5"
                              onClick={(e) => handleCopy(e, endpoint)}
                              aria-label={`复制 ${endpoint.route} 端点`}
                            >
                              {copiedId === endpoint.id ? (
                                <Check className="text-success size-3" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </Button>
                          </div>
                          <p className="text-muted-foreground truncate font-mono text-[11px]">
                            {endpoint.url}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-xs">暂无数据</p>
                  )}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </CollapsiblePanel>
        </Collapsible>
      </div>
    </div>
  );
};

export default TenantSelectCard;
