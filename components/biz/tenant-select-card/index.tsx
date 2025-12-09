import { Skeleton } from '@/components/ui/skeleton';
import { useTenantStore } from '@/lib/state/tenant-store';
import { useBalanceStore } from '@/lib/state/balance-store';
import { quotaToPrice } from '@/utils/quota-to-price';
import { useCostStore } from '@/lib/state/cost-store';
import { formatThousands } from '@/utils/format-number';
import { CostPeriod } from '@/types/api';
import { Button } from '@/components/ui/button';
import { EditIcon, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GroupSeparator, Group } from '@/components/ui/group';
import { Collapsible, CollapsiblePanel } from '@/components/ui/collapsible';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from '@/components/ui/accordion';
import { ModelUsagePanel } from './model-usage-panel';
import { ApiEndpointsPanel } from './api-endpoints-panel';
import { TokenListPanel } from './token-list-panel';

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
  const todayCostInfo = useCostStore((state) => state.costList[tenantId]?.[CostPeriod.DAY_1]);

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
              {todayTokens
                ? `${todayTokens} ${(todayTokensRaw || 0) <= 1 ? 'token' : 'tokens'}`
                : '–'}
            </span>
          </div>
        </div>

        <Collapsible open={isSelected}>
          <CollapsiblePanel>
            <Accordion className="border-border mt-3 border-t">
              <AccordionItem value="model-usage">
                <AccordionTrigger className="py-2 text-xs">模型消耗</AccordionTrigger>
                <AccordionPanel className="pb-2">
                  <ModelUsagePanel tenantId={tenantId} />
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem value="tokens">
                <AccordionTrigger className="py-2 text-xs">令牌列表</AccordionTrigger>
                <AccordionPanel className="pb-2">
                  <TokenListPanel tenantId={tenantId} />
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem value="api-endpoints">
                <AccordionTrigger className="py-2 text-xs">API 端点</AccordionTrigger>
                <AccordionPanel className="pb-2">
                  <ApiEndpointsPanel tenantId={tenantId} />
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
