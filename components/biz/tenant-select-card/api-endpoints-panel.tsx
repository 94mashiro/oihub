import { useState } from 'react';
import { useTenantInfoStore } from '@/lib/state/tenant-info-store';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface Props {
  tenantId: string;
}

export const ApiEndpointsPanel: React.FC<Props> = ({ tenantId }) => {
  const apiEndpoints = useTenantInfoStore((state) => state.tenantInfoMap[tenantId]?.endpoints);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (!apiEndpoints || apiEndpoints.length === 0) {
    return <p className="text-muted-foreground text-xs">暂无数据</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {apiEndpoints.map((endpoint) => (
        <div key={endpoint.id} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground font-medium">{endpoint.route}</span>
            <Button
              size="icon"
              variant="ghost"
              className="size-5"
              onClick={(e) => handleCopy(e, `api-${endpoint.id}`, endpoint.url)}
              aria-label={`复制 ${endpoint.route} 端点`}
            >
              {copiedId === `api-${endpoint.id}` ? (
                <Check className="text-success size-3" />
              ) : (
                <Copy className="size-3" />
              )}
            </Button>
          </div>
          <p className="text-muted-foreground truncate text-[12px]">{endpoint.url}</p>
          {endpoint.description && (
            <p className="text-muted-foreground/80 rounded-md border bg-zinc-200/40 p-1.5 font-mono text-[10px] leading-tight whitespace-pre-line">
              {endpoint.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
