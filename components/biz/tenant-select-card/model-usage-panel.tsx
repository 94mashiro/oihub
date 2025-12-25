import { useMemo, useState } from 'react';
import { useTenantStore } from '@/lib/state/tenant-store';
import { useCostStore } from '@/lib/state/cost-store';
import { useCostLoader } from '@/hooks/use-cost-loader';
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { UsageDisplay } from '@/components/ui/usage-display';
import { Tabs, TabsList, TabsTab } from '@/components/ui/tabs';
import { CostPeriod } from '@/types/api';
import { Loader2 } from 'lucide-react';

type SortBy = 'cost' | 'tokens';

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
  const [sortBy, setSortBy] = useState<SortBy>('cost');
  const tenantInfo = useTenantStore((state) => state.tenantList.find((t) => t.id === tenantId));
  const costList = useCostStore((state) => state.costList[tenantId]?.[period]);
  const { loading } = useCostLoader(tenantId, period);

  const quotaUnit = tenantInfo?.info?.quota_per_unit;
  const displayType = tenantInfo?.info?.quota_display_type;

  const { modelUsage, totalCost, totalTokens } = useMemo(() => {
    if (!costList || costList.length === 0) return { modelUsage: [], totalCost: 0, totalTokens: 0 };

    const grouped = costList.reduce(
      (acc, c) => {
        if (!acc[c.modelId]) acc[c.modelId] = { quota: 0, tokens: 0 };
        acc[c.modelId].quota += c.creditCost;
        acc[c.modelId].tokens += c.tokenUsage;
        return acc;
      },
      {} as Record<string, { quota: number; tokens: number }>,
    );

    const entries = Object.entries(grouped);
    const totalCost = entries.reduce((t, [, d]) => t + d.quota, 0);
    const totalTokens = entries.reduce((t, [, d]) => t + d.tokens, 0);
    const total = sortBy === 'cost' ? totalCost : totalTokens;
    if (total === 0) return { modelUsage: [], totalCost: 0, totalTokens: 0 };

    const modelUsage = entries
      .map(([model, data]) => ({
        model,
        ...data,
        percent: Math.round(((sortBy === 'cost' ? data.quota : data.tokens) / total) * 100),
      }))
      .sort((a, b) => (sortBy === 'cost' ? b.quota - a.quota : b.tokens - a.tokens))
      .slice(0, 5);

    return { modelUsage, totalCost, totalTokens };
  }, [costList, sortBy]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as CostPeriod)}>
          <TabsList className="h-6 gap-0 p-0.5 text-xs">
            {Object.values(CostPeriod).map((p) => (
              <TabsTab key={p} value={p} className="h-5 px-2 py-0 text-xs">
                {PERIOD_LABELS[p]}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
        <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
          <TabsList className="h-6 gap-0 p-0.5 text-xs">
            <TabsTab value="cost" className="h-5 px-2 py-0 text-xs">
              金额
            </TabsTab>
            <TabsTab value="tokens" className="h-5 px-2 py-0 text-xs">
              Token
            </TabsTab>
          </TabsList>
        </Tabs>
      </div>

      {loading && !costList ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="text-muted-foreground size-3 animate-spin" />
          <span className="text-muted-foreground text-xs">加载中...</span>
        </div>
      ) : modelUsage.length === 0 ? (
        <p className="text-muted-foreground text-xs">暂无数据</p>
      ) : (
        <>
          <div className="border-border flex justify-between border-b pb-2 text-xs font-medium">
            <span>总计</span>
            <UsageDisplay
              cost={totalCost}
              tokens={totalTokens}
              quotaPerUnit={quotaUnit}
              displayType={displayType}
              separator="/"
            />
          </div>
          <div className="flex flex-col gap-2">
            {modelUsage.map((item) => (
              <div key={item.model} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground truncate">{item.model}</span>
                  <UsageDisplay
                    className="text-muted-foreground"
                    cost={item.quota}
                    tokens={item.tokens}
                    quotaPerUnit={quotaUnit}
                    displayType={displayType}
                    separator="/"
                  />
                </div>
                <Progress value={item.percent} className="h-1">
                  <ProgressTrack className="h-1">
                    <ProgressIndicator className="bg-foreground/72" />
                  </ProgressTrack>
                </Progress>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
