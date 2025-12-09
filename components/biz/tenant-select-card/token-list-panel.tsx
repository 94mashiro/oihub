import { useState } from 'react';
import { useTenantStore } from '@/lib/state/tenant-store';
import { useTokenStore } from '@/lib/state/token-store';
import { quotaToPrice } from '@/utils/quota-to-price';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipPopup } from '@/components/ui/tooltip';
import { Copy, Check, Info } from 'lucide-react';

interface Props {
  tenantId: string;
}

export const TokenListPanel: React.FC<Props> = ({ tenantId }) => {
  const tenantInfo = useTenantStore((state) => state.tenantList.find((t) => t.id === tenantId));
  const tokenList = useTokenStore((state) => state.tokenList[tenantId]);
  const tokenGroups = useTokenStore((state) => state.tokenGroups[tenantId]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const quotaUnit = tenantInfo?.info?.quota_per_unit;
  const displayType = tenantInfo?.info?.quota_display_type;

  const handleCopy = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (!tokenList || tokenList.length === 0) {
    return <p className="text-muted-foreground text-xs">暂无令牌</p>;
  }

  return (
    <div className="divide-border/50 divide-y">
      {[...tokenList]
        .sort((a, b) => (b.accessed_time || 0) - (a.accessed_time || 0))
        .map((token) => (
          <div
            key={token.key}
            className="group/token flex items-center gap-3 py-2 first:pt-0 last:pb-0"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-foreground truncate text-xs">{token.name}</span>
                {token.group && tokenGroups?.[token.group] && (
                  <Badge variant="outline" size="sm" className="shrink-0 gap-0.5">
                    {token.group}
                    {tokenGroups[token.group].ratio !== 1 && (
                      <span className="text-muted-foreground">
                        ×{tokenGroups[token.group].ratio}
                      </span>
                    )}
                    <Tooltip>
                      <TooltipTrigger render={<span />}>
                        <Info className="text-muted-foreground size-2.5" />
                      </TooltipTrigger>
                      <TooltipPopup className="max-w-64">
                        {tokenGroups[token.group].desc || token.group}
                      </TooltipPopup>
                    </Tooltip>
                  </Badge>
                )}
              </div>
              <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-[10px]">
                <span>
                  已用{' '}
                  <span className="tabular-nums">
                    {quotaToPrice(token.used_quota, quotaUnit, displayType)}
                  </span>
                </span>
                <Separator orientation="vertical" className="h-2.5" />
                <span>
                  {token.accessed_time
                    ? `${new Date(token.accessed_time * 1000).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} 最后使用`
                    : '从未访问'}
                </span>
                {/* <Separator orientation="vertical" className="h-2.5" />
              <span>
                {token.created_time
                  ? `${new Date(token.created_time * 1000).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} 创建`
                  : '–'}
              </span> */}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 shrink-0 gap-1 px-2 text-[10px] opacity-0 transition-opacity group-hover/token:opacity-100"
              onClick={(e) => handleCopy(e, `token-${token.key}`, `sk-${token.key}`)}
            >
              {copiedId === `token-${token.key}` ? (
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
          </div>
        ))}
    </div>
  );
};
