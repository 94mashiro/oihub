import { quotaToPrice } from '@/lib/utils/quota-to-price';
import { formatThousands } from '@/lib/utils/format-number';
import { cn } from '@/lib/utils';

interface UsageDisplayProps {
  cost?: number | null;
  tokens?: number | null;
  quotaPerUnit?: number;
  displayType?: string;
  separator?: '/' | '·';
  className?: string;
}

export const UsageDisplay: React.FC<UsageDisplayProps> = ({
  cost,
  tokens,
  quotaPerUnit,
  displayType,
  separator = '/',
  className,
}) => {
  const hasCost = typeof cost === 'number';
  const hasTokens = typeof tokens === 'number';
  const costStr = hasCost ? quotaToPrice(cost as number, quotaPerUnit, displayType) : null;
  const tokensStr = hasTokens ? formatThousands(tokens as number) : null;
  const tokenLabel = (typeof tokens === 'number' ? tokens : 0) <= 1 ? 'token' : 'tokens';

  let content: string;
  if (costStr && tokensStr) {
    content = `${costStr} ${separator} ${tokensStr} ${tokenLabel}`;
  } else if (costStr) {
    content = costStr;
  } else if (tokensStr) {
    content = `${tokensStr} ${tokenLabel}`;
  } else {
    content = '–';
  }

  return <span className={cn('tabular-nums', className)}>{content}</span>;
};
