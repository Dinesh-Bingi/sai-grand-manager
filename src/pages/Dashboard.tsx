import {
  BedDouble,
  Users,
  IndianRupee,
  TrendingUp,
  Clock,
  AlertTriangle,
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
            <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Button asChild>
            <Link to="/bookings">
              <BedDouble className="mr-2 h-4 w-4" />
              New Booking
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

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Rooms"
            value={stats?.totalRooms || 0}
            icon={<BedDouble className="h-6 w-6" />}
            description={`${stats?.availableRooms || 0} available`}
          />
          <StatCard
            title="Occupancy Rate"
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
            title="Guests Today"
            value={stats?.guestsToday || 0}
            icon={<Users className="h-6 w-6" />}
            variant="info"
          />
          <StatCard
            title="Today's Collection"
            value={`₹${(stats?.todayCollection || 0).toLocaleString()}`}
            icon={<IndianRupee className="h-6 w-6" />}
            variant="success"
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
                Checkout Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dueCheckouts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Overdue ({dueCheckouts.length})
                  </h4>
                  {dueCheckouts.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-lg bg-destructive/10 p-3"
                    >
                      <div>
                        <span className="font-medium">
                          Room {booking.room?.room_number}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          Due: {format(parseISO(booking.expected_checkout), 'h:mm a')}
                        </p>
                      </div>
                      <Badge variant="destructive">Overdue</Badge>
                    </div>
                  ))}
                </div>
              )}

              {upcomingCheckouts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-medium text-warning">
                    <Clock className="h-4 w-4" />
                    Due Soon ({upcomingCheckouts.length})
                  </h4>
                  {upcomingCheckouts.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-lg bg-warning/10 p-3"
                    >
                      <div>
                        <span className="font-medium">
                          Room {booking.room?.room_number}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          Due: {format(parseISO(booking.expected_checkout), 'h:mm a')}
                        </p>
                      </div>
                      <Badge className="bg-warning text-warning-foreground">Due Soon</Badge>
                    </div>
                  ))}
                </div>
              )}

              {dueCheckouts.length === 0 && upcomingCheckouts.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  No pending checkouts at the moment
                </p>
              )}

              <Button asChild variant="outline" className="w-full">
                <Link to="/bookings">View All Bookings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Occupied"
            value={stats?.occupiedRooms || 0}
            icon={<div className="h-4 w-4 rounded-full bg-destructive" />}
            variant="danger"
          />
          <StatCard
            title="Available"
            value={stats?.availableRooms || 0}
            icon={<div className="h-4 w-4 rounded-full bg-success" />}
            variant="success"
          />
          <StatCard
            title="Cleaning"
            value={stats?.cleaningRooms || 0}
            icon={<div className="h-4 w-4 rounded-full bg-warning" />}
            variant="warning"
          />
          <StatCard
            title="Maintenance"
            value={stats?.maintenanceRooms || 0}
            icon={<div className="h-4 w-4 rounded-full bg-muted-foreground" />}
          />
        </div>
      </div>
    </AppLayout>
  );
}
