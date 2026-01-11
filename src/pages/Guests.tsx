import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBookings } from '@/hooks/useBookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, User, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Guests() {
  const { data: bookings, isLoading } = useBookings();
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten all guests from all bookings
  const allGuests = bookings?.flatMap(booking => 
    booking.guests?.map(guest => ({
      ...guest,
      roomNumber: booking.room?.room_number,
      checkIn: booking.check_in,
      checkOut: booking.check_out || booking.expected_checkout,
      bookingStatus: booking.status,
    })) || []
  ) || [];

  // Filter guests by search query
  const filteredGuests = allGuests.filter(guest =>
    guest.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.id_proof_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalGuests = allGuests.length;
  const primaryGuests = allGuests.filter(g => g.is_primary).length;
  const currentGuests = allGuests.filter(g => g.bookingStatus === 'checked_in').length;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
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
            <h1 className="font-serif text-3xl font-bold">Guests</h1>
            <p className="text-muted-foreground">
              All guest records and information
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Guests</p>
                <p className="text-2xl font-bold">{totalGuests}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <User className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Currently Staying</p>
                <p className="text-2xl font-bold">{currentGuests}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                <CreditCard className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Primary Guests</p>
                <p className="text-2xl font-bold">{primaryGuests}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or ID number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Guests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Guest Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>ID Proof</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      No guests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {guest.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{guest.full_name}</p>
                            {guest.is_primary && (
                              <Badge variant="secondary" className="text-xs">Primary</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {guest.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {guest.phone}
                            </div>
                          )}
                          {guest.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {guest.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {guest.id_proof_type ? (
                          <div>
                            <Badge variant="outline" className="capitalize">
                              {guest.id_proof_type.replace('_', ' ')}
                            </Badge>
                            {guest.id_proof_number && (
                              <p className="mt-1 font-mono text-xs text-muted-foreground">
                                {guest.id_proof_number}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{guest.roomNumber}</TableCell>
                      <TableCell>
                        {format(parseISO(guest.checkIn), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            guest.bookingStatus === 'checked_in'
                              ? 'default'
                              : guest.bookingStatus === 'checked_out'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="capitalize"
                        >
                          {guest.bookingStatus?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
