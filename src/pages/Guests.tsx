import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBookings } from '@/hooks/useBookings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Search, Users, UserCheck, CreditCard, Phone, Mail, Shield } from 'lucide-react';
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
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
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
            <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Guest Registry
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete guest records and verification status
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Registered Guests</p>
                <p className="text-3xl font-bold">{totalGuests}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-success">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-success/10">
                <UserCheck className="h-7 w-7 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Currently In-House</p>
                <p className="text-3xl font-bold text-success">{currentGuests}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-info">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-info/10">
                <CreditCard className="h-7 w-7 text-info" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Primary ID Holders</p>
                <p className="text-3xl font-bold text-info">{primaryGuests}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or ID number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Guests Table */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Guest Records
            </CardTitle>
            <CardDescription>
              {filteredGuests.length} guest{filteredGuests.length !== 1 ? 's' : ''} registered • Verified ID records for police compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Guest Name</TableHead>
                  <TableHead className="font-semibold">Contact Information</TableHead>
                  <TableHead className="font-semibold">ID Verification</TableHead>
                  <TableHead className="font-semibold">Room No.</TableHead>
                  <TableHead className="font-semibold">Arrival Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">No Guest Records Found</p>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Adjust your search criteria to view guest records
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((guest) => (
                    <TableRow key={guest.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {guest.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{guest.full_name}</p>
                            {guest.is_primary && (
                              <Badge variant="secondary" className="text-xs mt-0.5">
                                Primary Guest
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          {guest.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{guest.phone}</span>
                            </div>
                          )}
                          {guest.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              <span>{guest.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {guest.id_proof_type ? (
                          <div>
                            <Badge variant="outline" className="capitalize font-medium">
                              {guest.id_proof_type.replace('_', ' ')}
                            </Badge>
                            {guest.id_proof_number && (
                              <p className="mt-1 font-mono text-xs text-muted-foreground">
                                {guest.id_proof_number}
                              </p>
                            )}
                          </div>
                        ) : (
                          <Badge variant="destructive" className="font-medium">
                            Not Verified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">{guest.roomNumber}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{format(parseISO(guest.checkIn), 'dd MMM yyyy')}</span>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(guest.checkIn), 'h:mm a')}
                        </p>
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
                          className="capitalize font-medium"
                        >
                          {guest.bookingStatus === 'checked_in' ? 'In-House' : 
                           guest.bookingStatus === 'checked_out' ? 'Departed' :
                           guest.bookingStatus?.replace('_', ' ')}
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
