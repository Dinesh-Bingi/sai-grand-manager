import { AlertTriangle, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
        <AlertTitle className="text-destructive font-semibold">No Rooms Available</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>All rooms are currently occupied. New bookings will be added to the waiting list.</span>
          <Button asChild size="sm" variant="outline" className="ml-4">
            <Link to="/waiting-list">View Waiting List</Link>
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
          Weekend Rush Mode Active
          <span className="animate-pulse-soft inline-flex h-2 w-2 rounded-full bg-warning" />
        </AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>
            High occupancy ({occupancyPercentage}%) - Only {availableRooms} room{availableRooms !== 1 ? 's' : ''} left. 
            Quick booking mode enabled.
          </span>
          <Button asChild size="sm" className="ml-4 bg-warning text-warning-foreground hover:bg-warning/90">
            <Link to="/bookings/quick">Quick Book</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
