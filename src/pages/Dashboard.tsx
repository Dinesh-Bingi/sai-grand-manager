import {
  BedDouble,
  Users,
  IndianRupee,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { WeekendRushBanner } from '@/components/dashboard/WeekendRushBanner';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useActiveBookings } from '@/hooks/useBookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { format, isAfter, parseISO } from 'date-fns';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activeBookings, isLoading: bookingsLoading } = useActiveBookings();

  // Find bookings due for checkout
  const now = new Date();
  const dueCheckouts = activeBookings?.filter(booking => {
    const expectedCheckout = parseISO(booking.expected_checkout);
    return isAfter(now, expectedCheckout) && booking.status === 'checked_in';
  }) || [];

  const upcomingCheckouts = activeBookings?.filter(booking => {
    const expectedCheckout = parseISO(booking.expected_checkout);
    const hoursUntilCheckout = (expectedCheckout.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilCheckout > 0 && hoursUntilCheckout <= 2 && booking.status === 'checked_in';
  }) || [];

  if (statsLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold">Operations Dashboard</h1>
            <p className="text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d, yyyy')} • Live Status
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/bookings">
              <BedDouble className="mr-2 h-5 w-5" />
              New Guest Booking
            </Link>
          </Button>
        </div>

        {/* Weekend Rush / No Rooms Banner */}
        {stats?.isWeekendRush && (
          <WeekendRushBanner
            occupancyPercentage={stats.occupancyPercentage}
            availableRooms={stats.availableRooms}
          />
        )}

        {/* Primary Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Inventory"
            value={stats?.totalRooms || 0}
            icon={<BedDouble className="h-6 w-6" />}
            description={`${stats?.availableRooms || 0} rooms ready for guests`}
          />
          <StatCard
            title="Current Occupancy"
            value={`${stats?.occupancyPercentage || 0}%`}
            icon={<TrendingUp className="h-6 w-6" />}
            variant={
              (stats?.occupancyPercentage || 0) >= 80
                ? 'warning'
                : (stats?.occupancyPercentage || 0) >= 50
                ? 'success'
                : 'default'
            }
          />
          <StatCard
            title="Arrivals Today"
            value={stats?.guestsToday || 0}
            icon={<Users className="h-6 w-6" />}
            variant="info"
            description="Expected check-ins"
          />
          <StatCard
            title="Today's Revenue"
            value={`₹${(stats?.todayCollection || 0).toLocaleString()}`}
            icon={<IndianRupee className="h-6 w-6" />}
            variant="success"
            description="Confirmed collections"
          />
        </div>

        {/* Charts and Alerts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Occupancy Chart */}
          <OccupancyChart
            available={stats?.availableRooms || 0}
            occupied={stats?.occupiedRooms || 0}
            cleaning={stats?.cleaningRooms || 0}
            maintenance={stats?.maintenanceRooms || 0}
          />

          {/* Checkout Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5" />
                Departure Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dueCheckouts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Overdue Departures ({dueCheckouts.length})
                  </h4>
                  {dueCheckouts.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-lg bg-destructive/10 p-3 border border-destructive/20"
                    >
                      <div>
                        <span className="font-semibold">
                          Room {booking.room?.room_number}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          Scheduled: {format(parseISO(booking.expected_checkout), 'h:mm a')}
                        </p>
                      </div>
                      <Badge variant="destructive">Action Required</Badge>
                    </div>
                  ))}
                </div>
              )}

              {upcomingCheckouts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-warning">
                    <Clock className="h-4 w-4" />
                    Departing Soon ({upcomingCheckouts.length})
                  </h4>
                  {upcomingCheckouts.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-lg bg-warning/10 p-3 border border-warning/20"
                    >
                      <div>
                        <span className="font-semibold">
                          Room {booking.room?.room_number}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          Scheduled: {format(parseISO(booking.expected_checkout), 'h:mm a')}
                        </p>
                      </div>
                      <Badge className="bg-warning text-warning-foreground">
                        Departing Soon
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {dueCheckouts.length === 0 && upcomingCheckouts.length === 0 && (
                <div className="py-8 text-center">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 text-muted-foreground">
                    No pending departures at this time
                  </p>
                </div>
              )}

              <Button asChild variant="outline" className="w-full">
                <Link to="/bookings">
                  View All Reservations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Room Status Summary */}
        <div>
          <h2 className="mb-4 font-serif text-xl font-semibold">Room Status Summary</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Occupied"
              value={stats?.occupiedRooms || 0}
              icon={<div className="h-4 w-4 rounded-full bg-destructive" />}
              variant="danger"
              description="Guests in residence"
            />
            <StatCard
              title="Available"
              value={stats?.availableRooms || 0}
              icon={<div className="h-4 w-4 rounded-full bg-success" />}
              variant="success"
              description="Ready for booking"
            />
            <StatCard
              title="Housekeeping"
              value={stats?.cleaningRooms || 0}
              icon={<div className="h-4 w-4 rounded-full bg-warning" />}
              variant="warning"
              description="Being prepared"
            />
            <StatCard
              title="Under Maintenance"
              value={stats?.maintenanceRooms || 0}
              icon={<div className="h-4 w-4 rounded-full bg-muted-foreground" />}
              description="Temporarily unavailable"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
