import { quotaToPrice } from '@/utils/quota-to-price';
import { formatThousands } from '@/utils/format-number';
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
  const hasCost = cost != null && cost !== 0;
  const hasTokens = tokens != null;
  const costStr = hasCost ? quotaToPrice(cost, quotaPerUnit, displayType) : null;
  const tokensStr = hasTokens ? formatThousands(tokens) : null;
  const tokenLabel = (tokens ?? 0) <= 1 ? 'token' : 'tokens';

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

  return <span className={cn(className)}>{content}</span>;
};
