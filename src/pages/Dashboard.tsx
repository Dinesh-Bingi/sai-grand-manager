import { Link } from 'react-router-dom';
import { Plus, BedDouble, TrendingUp, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { LuxuryStatPanel } from '@/components/dashboard/LuxuryStatPanel';
import { RoomStatusGrid } from '@/components/dashboard/RoomStatusGrid';
import { DeparturesPanel } from '@/components/dashboard/DeparturesPanel';
import { RevenueSummary } from '@/components/dashboard/RevenueSummary';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useActiveBookings } from '@/hooks/useBookings';
import { useRooms } from '@/hooks/useRooms';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isAfter, parseISO } from 'date-fns';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activeBookings, isLoading: bookingsLoading } = useActiveBookings();
  const { data: rooms, isLoading: roomsLoading } = useRooms();

  // Find bookings due for checkout
  const now = new Date();
  
  const departures = activeBookings
    ?.filter(booking => booking.status === 'checked_in')
    .map(booking => {
      const expectedCheckout = parseISO(booking.expected_checkout);
      const isOverdue = isAfter(now, expectedCheckout);
      const hoursUntilCheckout = (expectedCheckout.getTime() - now.getTime()) / (1000 * 60 * 60);
      const isDueSoon = hoursUntilCheckout > 0 && hoursUntilCheckout <= 4;
      
      if (!isOverdue && !isDueSoon) return null;
      
      return {
        id: booking.id,
        roomNumber: booking.room?.room_number || '',
        guestName: booking.guests?.[0]?.full_name || 'Guest',
        checkoutTime: booking.expected_checkout,
        isOverdue,
      };
    })
    .filter(Boolean) || [];

  if (statsLoading || roomsLoading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <Skeleton className="h-48 rounded-xl" />
          <div className="grid gap-5 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header with New Booking Button */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <DashboardHeader />
          </div>
          <div className="flex-shrink-0">
            <Button asChild size="lg" className="gap-2 shadow-luxury">
              <Link to="/bookings">
                <Plus className="h-5 w-5" />
                New Booking
              </Link>
            </Button>
          </div>
        </div>

        {/* Operational Overview */}
        <div>
          <h2 className="mb-5 font-serif text-2xl font-medium text-foreground">
            Operations Dashboard
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            <LuxuryStatPanel
              title="Total Rooms"
              value={stats?.totalRooms || 0}
              icon={<BedDouble className="h-6 w-6" />}
              subtitle="Total Rooms Available"
            />
            <LuxuryStatPanel
              title="Current"
              value={`${stats?.occupancyPercentage || 0}%`}
              icon={<TrendingUp className="h-6 w-6" />}
              subtitle="Current Occupancy"
            />
            <LuxuryStatPanel
              title="Arrivals Today"
              value={stats?.guestsToday || 0}
              icon={<Users className="h-6 w-6" />}
              subtitle="Reservations from"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Room Status - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RoomStatusGrid rooms={rooms || []} />
          </div>

          {/* Right Sidebar - Departures & Revenue */}
          <div className="space-y-6">
            <DeparturesPanel departures={departures as any[]} />
            <RevenueSummary amount={stats?.todayCollection || 0} />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 text-center text-xs text-muted-foreground">
          Version 1.0 © 2024 Sai Grand Lodge
        </div>
      </div>
    </AppLayout>
  );
}