import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBookings, useCheckoutBooking } from '@/hooks/useBookings';
import { useRooms } from '@/hooks/useRooms';
import { BookingModal } from '@/components/bookings/BookingModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, Plus, LogOut, User, Calendar, Clock, AlertTriangle, IndianRupee } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import type { Booking, Room, BookingStatus } from '@/types/hotel';

const statusConfig: Record<BookingStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  confirmed: { label: 'Confirmed', variant: 'secondary' },
  checked_in: { label: 'In Residence', variant: 'default' },
  checked_out: { label: 'Departed', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export default function Bookings() {
  const { data: bookings, isLoading } = useBookings();
  const { data: rooms } = useRooms();
  const checkoutBooking = useCheckoutBooking();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const availableRooms = rooms?.filter(r => r.status === 'available') || [];

  const filteredBookings = bookings?.filter(booking => {
    const matchesSearch = 
      booking.room?.room_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guests?.some(g => g.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleNewBooking = () => {
    if (availableRooms.length === 0) {
      toast.error('No Rooms Available', {
        description: 'All accommodation is currently occupied. Please check the waiting list.',
      });
      return;
    }
    setSelectedRoom(availableRooms[0]);
    setBookingModalOpen(true);
  };

  const handleCheckout = async () => {
    if (!selectedBooking) return;

    try {
      await checkoutBooking.mutateAsync({
        bookingId: selectedBooking.id,
        roomId: selectedBooking.room_id,
      });
      toast.success('Guest Departure Confirmed', {
        description: `Room ${selectedBooking.room?.room_number} has been released for housekeeping.`,
      });
      setCheckoutDialogOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      toast.error('Checkout Failed', {
        description: error instanceof Error ? error.message : 'Unable to process departure. Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold">Reservation Management</h1>
            <p className="text-muted-foreground">
              Manage guest arrivals, departures, and room allocations
            </p>
          </div>
          <Button onClick={handleNewBooking} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Register New Guest
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Arrivals</p>
                <p className="text-2xl font-bold">
                  {bookings?.filter(b => 
                    format(parseISO(b.check_in), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  ).length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <User className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Guests in Residence</p>
                <p className="text-2xl font-bold">
                  {bookings?.filter(b => b.status === 'checked_in').length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Departures</p>
                <p className="text-2xl font-bold">
                  {bookings?.filter(b => 
                    b.status === 'checked_in' && 
                    new Date(b.expected_checkout) < new Date()
                  ).length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <LogOut className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rooms Available</p>
                <p className="text-2xl font-bold">{availableRooms.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by room number or guest name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as BookingStatus | 'all')}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reservations</SelectItem>
              <SelectItem value="checked_in">In Residence</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="checked_out">Departed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead>Scheduled Departure</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="h-12 w-12 text-muted-foreground/30" />
                        <p className="font-medium">No Reservations Found</p>
                        <p className="text-sm text-muted-foreground">
                          Adjust your search criteria or create a new booking
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const primaryGuest = booking.guests?.find(g => g.is_primary);
                    const status = statusConfig[booking.status];
                    
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-semibold">
                          {booking.room?.room_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{primaryGuest?.full_name || 'Guest'}</p>
                            {booking.guests && booking.guests.length > 1 && (
                              <p className="text-xs text-muted-foreground">
                                +{booking.guests.length - 1} accompanying guest{booking.guests.length > 2 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(parseISO(booking.check_in), 'MMM d, h:mm a')}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(booking.expected_checkout), 'MMM d, h:mm a')}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{Number(booking.total_amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {booking.status === 'checked_in' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setCheckoutDialogOpen(true);
                              }}
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              Process Departure
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* New Booking Modal */}
      <BookingModal
        room={selectedRoom}
        open={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedRoom(null);
        }}
      />

      {/* Checkout Confirmation Dialog */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Confirm Guest Departure
            </DialogTitle>
            <DialogDescription>
              Please verify the final bill before processing departure for Room {selectedBooking?.room?.room_number}.
            </DialogDescription>
          </DialogHeader>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Final Settlement Required</AlertTitle>
            <AlertDescription>
              Ensure all charges are collected before confirming departure. Room will be sent for housekeeping.
            </AlertDescription>
          </Alert>

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Room Charges</span>
                <span className="font-medium">
                  ₹{Number(selectedBooking?.total_amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Advance Received</span>
                <span className="font-medium text-success">
                  - ₹{Number(selectedBooking?.advance_paid || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold">Balance Due</span>
                <span className="text-xl font-bold text-primary">
                  ₹{(Number(selectedBooking?.total_amount || 0) - Number(selectedBooking?.advance_paid || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={checkoutBooking.isPending}>
              {checkoutBooking.isPending ? 'Processing...' : 'Confirm Departure & Collect Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
