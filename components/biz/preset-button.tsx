import { Crown } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PresetVariant = 'default' | 'premium';

const variantStyles: Record<PresetVariant, string> = {
  default: 'bg-gradient-to-b from-background to-muted/40 hover:from-accent/50 hover:to-accent/20',
  premium:
    'bg-gradient-to-b from-primary/8 via-primary/4 to-primary/10 border-primary/25 hover:from-primary/12 hover:via-primary/6 hover:to-primary/14 hover:border-primary/35',
};

interface PresetButtonProps extends Omit<ComponentProps<typeof Button>, 'variant'> {
  variant?: PresetVariant;
}

export function PresetButton({
  variant = 'default',
  className,
  children,
  ...props
}: PresetButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn('relative', variantStyles[variant], className)}
      {...props}
    >
      {children}
      {variant === 'premium' && (
        <Crown className="absolute -top-1.5 -right-1.5 size-3 rotate-45 fill-amber-500 text-amber-600" />
      )}
    </Button>
  );
}
