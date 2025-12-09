import { useMemo, useState } from 'react';
import { useTenantStore } from '@/lib/state/tenant-store';
import { useCostStore } from '@/lib/state/cost-store';
import { quotaToPrice } from '@/utils/quota-to-price';
import { formatThousands } from '@/utils/format-number';
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTab } from '@/components/ui/tabs';
import { CostPeriod } from '@/types/api';

const PERIOD_LABELS: Record<CostPeriod, string> = {
  [CostPeriod.DAY_1]: '今日',
  [CostPeriod.DAY_7]: '近 7 天',
  [CostPeriod.DAY_14]: '近 14 天',
  [CostPeriod.DAY_30]: '近 30 天',
};

interface Props {
  tenantId: string;
}

export const ModelUsagePanel: React.FC<Props> = ({ tenantId }) => {
  const [period, setPeriod] = useState<CostPeriod>(CostPeriod.DAY_1);
  const tenantInfo = useTenantStore((state) => state.tenantList.find((t) => t.id === tenantId));
  const costList = useCostStore((state) => state.costList[tenantId]?.[period]);

  const quotaUnit = tenantInfo?.info?.quota_per_unit;
  const displayType = tenantInfo?.info?.quota_display_type;

  const modelUsage = useMemo(() => {
    if (!costList || costList.length === 0) return [];
    const totalQuota = costList.reduce((t, c) => t + c.quota, 0);
    if (totalQuota === 0) return [];

    const grouped = costList.reduce(
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
  }, [costList]);

  return (
    <div className="space-y-2">
      <Tabs value={period} onValueChange={(v) => setPeriod(v as CostPeriod)}>
        <TabsList className="h-6 gap-0 p-0.5 text-xs">
          {Object.values(CostPeriod).map((p) => (
            <TabsTab key={p} value={p} className="h-5 px-2 py-0 text-xs">
              {PERIOD_LABELS[p]}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>

      {modelUsage.length === 0 ? (
        <p className="text-muted-foreground text-xs">暂无数据</p>
      ) : (
        modelUsage.map((item) => (
          <div key={item.model} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground truncate">{item.model}</span>
              <span className="text-muted-foreground tabular-nums">
                {quotaToPrice(item.quota, quotaUnit, displayType)} · {formatThousands(item.tokens)}{' '}
                tokens
              </span>
            </div>
            <Progress value={item.percent} className="h-1">
              <ProgressTrack className="h-1">
                <ProgressIndicator className="bg-foreground/72" />
              </ProgressTrack>
            </Progress>
          </div>
        ))
      )}
    </div>
  );
};
