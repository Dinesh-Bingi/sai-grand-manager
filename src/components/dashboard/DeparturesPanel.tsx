import { Link } from 'react-router-dom';
import { ChevronRight, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Departure {
  id: string;
  roomNumber: string;
  guestName: string;
  checkoutTime: string;
  isOverdue?: boolean;
}

interface DeparturesPanelProps {
  departures: Departure[];
  className?: string;
}

export function DeparturesPanel({ departures, className }: DeparturesPanelProps) {
  return (
    <div className={cn('rounded-xl border border-border/50 bg-card shadow-luxury', className)}>
      <div className="border-b border-border/50 px-6 py-4">
        <h2 className="text-lg font-bold text-foreground">Departures Soon</h2>
      </div>
      
      <div className="divide-y divide-border/30">
        {departures.length > 0 ? (
          departures.slice(0, 4).map((departure) => (
            <div key={departure.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'flex h-10 w-12 items-center justify-center rounded-md border text-sm font-bold',
                  departure.isOverdue 
                    ? 'bg-destructive/10 border-destructive/30 text-destructive' 
                    : 'bg-secondary border-border'
                )}>
                  {departure.roomNumber}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{departure.guestName}</p>
                  <p className="text-xs text-muted-foreground">
                    Checkout Due: {format(parseISO(departure.checkoutTime), 'h:mm a')}
                  </p>
                </div>
              </div>
              <span className={cn(
                'text-sm font-bold',
                departure.isOverdue ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {format(parseISO(departure.checkoutTime), 'h:mm a')}
              </span>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">No pending departures</p>
          </div>
        )}
      </div>

      <div className="border-t border-border/50 px-6 py-4">
        <Button asChild variant="outline" size="sm" className="w-full gap-1 font-semibold">
          <Link to="/bookings">
            View All Departures
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}