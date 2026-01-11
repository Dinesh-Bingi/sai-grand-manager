import { AlertTriangle, Zap, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface WeekendRushBannerProps {
  occupancyPercentage: number;
  availableRooms: number;
}

export function WeekendRushBanner({ occupancyPercentage, availableRooms }: WeekendRushBannerProps) {
  const isHighOccupancy = occupancyPercentage >= 80;
  const isFullyBooked = availableRooms === 0;

  if (isFullyBooked) {
    return (
      <Alert className="border-destructive/50 bg-destructive/10">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <AlertTitle className="text-destructive font-semibold flex items-center gap-2">
          Property Fully Occupied
          <Badge variant="destructive" className="text-[10px]">
            NO VACANCY
          </Badge>
        </AlertTitle>
        <AlertDescription className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span>
            All accommodation is currently occupied. New arrivals will be added to the waiting list 
            and notified when rooms become available.
          </span>
          <Button asChild size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
            <Link to="/waiting-list">
              <Users className="mr-2 h-4 w-4" />
              Manage Waiting List
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (isHighOccupancy) {
    return (
      <Alert className="border-warning/50 bg-warning/10">
        <Zap className="h-5 w-5 text-warning" />
        <AlertTitle className="text-warning font-semibold flex items-center gap-2">
          High Demand Period Active
          <span className="animate-pulse-soft inline-flex h-2 w-2 rounded-full bg-warning" />
          <Badge className="bg-warning text-warning-foreground text-[10px]">
            {occupancyPercentage}% OCCUPIED
          </Badge>
        </AlertTitle>
        <AlertDescription className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span>
            <strong>Only {availableRooms} room{availableRooms !== 1 ? 's' : ''} remaining.</strong>{' '}
            Quick booking mode is enabled. Advance payment is mandatory during high-demand periods.
          </span>
          <Button asChild size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90">
            <Link to="/bookings">
              <Zap className="mr-2 h-4 w-4" />
              Quick Booking
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
