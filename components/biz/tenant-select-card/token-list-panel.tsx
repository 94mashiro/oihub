import { useState } from 'react';
import { useTenantStore } from '@/lib/state/tenant-store';
import { useTenantInfoStore } from '@/lib/state/tenant-info-store';
import { useTokenStore } from '@/lib/state/token-store';
import { useTokensLoader } from '@/hooks/use-tokens-loader';
import { UsageDisplay } from '@/components/ui/usage-display';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipPopup } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTab } from '@/components/ui/tabs';
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
  MenuGroup,
  MenuGroupLabel,
} from '@/components/ui/menu';
import { Copy, Check, Info, Loader2, ExternalLink } from 'lucide-react';
import { ClaudeIcon, OpenAIIcon, GeminiIcon } from '@/components/ui/icons/provider-icons';
import { buildCCSwitchDeeplink, type CCSwitchApp } from '@/lib/utils/ccswitch-deeplink';
import { useSettingStore } from '@/lib/state/setting-store';
import { Token } from '@/types/token';
import { ScrollArea } from '@/components/ui/scroll-area';

type SortBy = 'time' | 'cost';

interface Props {
  tenantId: string;
}

export const TokenListPanel: React.FC<Props> = ({ tenantId }) => {
  const tenantInfo = useTenantStore((state) => state.tenantList.find((t) => t.id === tenantId));
  const tenantInfoData = useTenantInfoStore((state) => state.tenantInfoMap[tenantId]);
  const tokenList = useTokenStore((state) => state.tokenList[tenantId]);
  const tokenGroups = useTokenStore((state) => state.tokenGroups[tenantId]);
  const { loading } = useTokensLoader(tenantId);
  const tokenExportEnabled = useSettingStore((state) => state.experimentalFeatures.tokenExport);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('time');

  const quotaUnit = tenantInfoData?.creditUnit;
  const displayType = tenantInfoData?.displayFormat;

  const getTokenGroups = useCallback((token: Token) => {
    if (!token.group) {
      return [];
    } else if (typeof token.group === 'string') {
      return [token.group];
    }
    return token.group;
  }, []);

  const handleCopy = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExport = (tokenKey: string, tokenName: string, app: CCSwitchApp) => {
    const baseUrl = tenantInfo?.url || '';
    const name = tenantInfo?.name ? `${tenantInfo.name} - ${tokenName}` : tokenName;
    const url = buildCCSwitchDeeplink({ app, name, baseUrl, tokenKey });
    window.open(url);
  };

  if (loading && !tokenList) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader2 className="text-muted-foreground size-3 animate-spin" />
        <span className="text-muted-foreground text-xs">加载中...</span>
      </div>
    );
  }

  if (!tokenList || tokenList.length === 0) {
    return <p className="text-muted-foreground text-xs">暂无令牌</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
        <TabsList className="h-6 gap-0 p-0.5 text-xs">
          <TabsTab value="time" className="h-5 px-2 py-0 text-xs">
            时间
          </TabsTab>
          <TabsTab value="cost" className="h-5 px-2 py-0 text-xs">
            金额
          </TabsTab>
        </TabsList>
      </Tabs>
      {[...tokenList]
        .sort((a, b) =>
          sortBy === 'time'
            ? (b.lastUsedAt || 0) - (a.lastUsedAt || 0)
            : (b.creditConsumed || 0) - (a.creditConsumed || 0),
        )
        .map((token) => (
          <div
            key={token.secretKey}
            className="group/token border-border flex items-center gap-0 border-b pb-2 last:border-b-0 last:pb-0"
          >
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-foreground shrink-0 truncate text-xs font-medium">
                  {token.label}
                </span>
                {token.group !== null && (
                  <div className="min-w-0 flex-1">
                    <ScrollArea orientation="horizontal">
                      <div className="flex w-max gap-1">
                        {getTokenGroups(token)!.map((groupId) => {
                          const groupInfo = tokenGroups?.[groupId];
                          if (!groupInfo) {
                            return (
                              <Badge
                                key={groupId}
                                size="sm"
                                className="shrink-0 gap-0.5 rounded select-none"
                                variant="error"
                              >
                                分组已失效
                              </Badge>
                            );
                          }
                          return (
                            <Badge
                              variant="outline"
                              size="sm"
                              className="shrink-0 gap-0.5 rounded select-none"
                              key={groupId}
                            >
                              {groupInfo?.name}
                              <span className="text-muted-foreground">×{groupInfo.multiplier}</span>
                              {groupInfo.description && (
                                <Tooltip>
                                  <TooltipTrigger render={<span />}>
                                    <Info className="text-muted-foreground size-2.5" />
                                  </TooltipTrigger>
                                  <TooltipPopup className="max-w-64">
                                    {groupInfo.description}
                                  </TooltipPopup>
                                </Tooltip>
                              )}
                            </Badge>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
              <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-[10px]">
                <span>
                  已用{' '}
                  <UsageDisplay
                    cost={token.creditConsumed}
                    quotaPerUnit={quotaUnit}
                    displayType={displayType}
                  />
                </span>
                <Separator orientation="vertical" className="h-2.5" />
                <span>
                  {token.lastUsedAt
                    ? `${new Date(token.lastUsedAt * 1000).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} 最后使用`
                    : '从未访问'}
                </span>
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity] duration-[300ms,200ms] ease-out group-hover/token:grid-cols-[1fr] group-hover/token:opacity-100 has-[[data-popup-open]]:grid-cols-[1fr] has-[[data-popup-open]]:opacity-100">
              <div className="flex min-w-0 gap-1 overflow-hidden pl-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 gap-1 px-2 text-[10px]"
                  onClick={(e) =>
                    handleCopy(e, `token-${token.secretKey}`, `sk-${token.secretKey}`)
                  }
                >
                  {copiedId === `token-${token.secretKey}` ? (
                    <>
                      <Check className="size-3" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      复制
                    </>
                  )}
                </Button>
                {tokenExportEnabled && (
                  <Menu>
                    <MenuTrigger
                      render={
                        <Button size="sm" variant="ghost" className="h-6 gap-1 px-2 text-[10px]">
                          <ExternalLink className="size-3" />
                          导出
                        </Button>
                      }
                    />
                    <MenuPopup className="min-w-28">
                      <MenuGroup>
                        <MenuGroupLabel className="text-[10px]">导出到 CC Switch</MenuGroupLabel>
                        <MenuItem
                          className="text-xs"
                          onClick={() => handleExport(token.secretKey, token.label, 'claude')}
                        >
                          <ClaudeIcon className="size-3.5" />
                          Claude
                        </MenuItem>
                        <MenuItem
                          className="text-xs"
                          onClick={() => handleExport(token.secretKey, token.label, 'codex')}
                        >
                          <OpenAIIcon className="size-3.5" />
                          Codex
                        </MenuItem>
                        <MenuItem
                          className="text-xs"
                          onClick={() => handleExport(token.secretKey, token.label, 'gemini')}
                        >
                          <GeminiIcon className="size-3.5" />
                          Gemini
                        </MenuItem>
                      </MenuGroup>
                    </MenuPopup>
                  </Menu>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};
