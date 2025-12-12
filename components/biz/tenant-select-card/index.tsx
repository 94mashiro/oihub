import { Skeleton } from '@/components/ui/skeleton';
import { UsageDisplay } from '@/components/ui/usage-display';
import { useTenantStore } from '@/lib/state/tenant-store';
import { useBalanceStore } from '@/lib/state/balance-store';
import { useCostStore } from '@/lib/state/cost-store';
import { CostPeriod } from '@/types/api';
import { Button } from '@/components/ui/button';
import { EditIcon, ExternalLinkIcon, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GroupSeparator, Group } from '@/components/ui/group';
import { Collapsible, CollapsiblePanel } from '@/components/ui/collapsible';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
} from '@/components/ui/alert-dialog';
import { ModelUsagePanel } from './model-usage-panel';
import { ApiEndpointsPanel } from './api-endpoints-panel';
import { TokenListPanel } from './token-list-panel';

interface Props {
  tenantId: string;
  isSelected?: boolean;
}

const TenantSelectCard: React.FC<Props> = ({ tenantId, isSelected = false }) => {
  const navigate = useNavigate();
  const removeTenant = useTenantStore((state) => state.removeTenant);
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

  let tokenManageUrl: string | null = null;
  try {
    const baseUrl = new URL(tenantInfo.url);
    tokenManageUrl = `${baseUrl.origin}/console/token`;
  } catch {
    tokenManageUrl = null;
  }

  const todayCostRaw = todayCostInfo?.reduce((t, c) => t + c.quota, 0) ?? null;
  const todayTokensRaw = todayCostInfo?.reduce((t, c) => t + c.token_used, 0) ?? null;

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
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button size="icon" variant="outline" className="size-6">
                <Trash className="size-3 text-red-400" />
              </Button>
            }
          />
          <AlertDialogPopup>
            <AlertDialogHeader>
              <AlertDialogTitle>删除租户</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除「{tenantInfo.name}」吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose render={<Button variant="outline">取消</Button>} />
              <AlertDialogClose
                render={
                  <Button variant="destructive" onClick={() => removeTenant(tenantId)}>
                    删除
                  </Button>
                }
              />
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialog>
      </Group>
      <div className="space-y-2">
        <p className="truncate text-sm font-medium">{tenantInfo.name}</p>
        <div>
          <p className="text-muted-foreground text-xs">余额</p>
          <p className="text-foreground text-xl font-semibold tracking-tight">
            {balanceInfo ? (
              <UsageDisplay
                cost={balanceInfo.quota}
                quotaPerUnit={quotaUnit}
                displayType={displayType}
              />
            ) : (
              <Skeleton className="h-7 w-20" />
            )}
          </p>
        </div>
        <div className="text-muted-foreground space-y-0.5 text-xs">
          <div className="flex justify-between">
            <span>历史消耗</span>
            {balanceInfo ? (
              <UsageDisplay
                className="text-foreground"
                cost={balanceInfo.used_quota}
                quotaPerUnit={quotaUnit}
                displayType={displayType}
              />
            ) : (
              <Skeleton className="inline-block h-3 w-12" />
            )}
          </div>
          <div className="flex justify-between">
            <span>今日消耗</span>
            <UsageDisplay
              className="text-foreground"
              cost={todayCostRaw}
              tokens={todayTokensRaw}
              quotaPerUnit={quotaUnit}
              displayType={displayType}
            />
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
                <AccordionTrigger className="py-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span>令牌列表</span>
                    {tokenManageUrl ? (
                      <a
                        href={tokenManageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground inline-flex items-center"
                        title="打开令牌管理页面"
                        onClick={(e) => {
                          // 防止触发 Accordion 的展开/收起
                          e.stopPropagation();
                        }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <ExternalLinkIcon className="size-3" />
                      </a>
                    ) : null}
                  </div>
                </AccordionTrigger>
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
