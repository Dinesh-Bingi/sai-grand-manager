import { Link } from 'react-router-dom';
import { ChevronRight, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface RevenueSummaryProps {
  amount: number;
  status?: string;
  className?: string;
}

export function RevenueSummary({ amount, status = 'Confirmed', className }: RevenueSummaryProps) {
  return (
    <div className={cn('rounded-xl border border-border/50 bg-card shadow-luxury', className)}>
      <div className="flex items-center gap-3 border-b border-border/50 px-6 py-4">
        <IndianRupee className="h-5 w-5 text-primary" />
        <h2 className="font-serif text-xl font-medium text-foreground">Revenue Summary</h2>
      </div>
      
      <div className="px-6 py-6">
        <p className="font-serif text-4xl font-medium text-foreground">
          ₹{amount.toLocaleString('en-IN')}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{status}</p>
      </div>

      <div className="border-t border-border/50 px-6 py-4">
        <Button asChild variant="outline" size="sm" className="gap-1">
          <Link to="/reports">
            View Reports
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}