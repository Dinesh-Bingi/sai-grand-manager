import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LuxuryStatPanelProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  className?: string;
}

export function LuxuryStatPanel({
  title,
  value,
  icon,
  subtitle,
  className,
}: LuxuryStatPanelProps) {
  return (
    <div className={cn(
      'flex items-center gap-5 rounded-lg border border-border/50 bg-card px-6 py-5 shadow-luxury transition-all hover:shadow-luxury-hover',
      className
    )}>
      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-muted-foreground">{title}</p>
        <p className="mt-1 text-3xl font-bold text-foreground tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}