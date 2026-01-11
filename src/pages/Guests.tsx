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
import { Search, Users, Phone, Mail } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Guests() {
  const { data: bookings, isLoading } = useBookings();
  const [searchQuery, setSearchQuery] = useState('');

  const allGuests = bookings?.flatMap(booking => 
    booking.guests?.map(guest => ({
      ...guest,
      roomNumber: booking.room?.room_number,
      checkIn: booking.check_in,
      checkOut: booking.check_out || booking.expected_checkout,
      bookingStatus: booking.status,
    })) || []
  ) || [];

  const filteredGuests = allGuests.filter(guest =>
    guest.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.id_proof_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalGuests = allGuests.length;
  const primaryGuests = allGuests.filter(g => g.is_primary).length;
  const currentGuests = allGuests.filter(g => g.bookingStatus === 'checked_in').length;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-3 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Guest Registry</h1>
            <p className="text-sm text-muted-foreground">{totalGuests} total records</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Total Guests</p>
              <p className="text-2xl font-semibold">{totalGuests}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-success">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Currently In-House</p>
              <p className="text-2xl font-semibold text-success">{currentGuests}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-info">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Primary ID Holders</p>
              <p className="text-2xl font-semibold text-info">{primaryGuests}</p>
            </CardContent>
          </Card>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Card>
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-base font-medium">Guest Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
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
                      <Users className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                      No guests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {guest.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{guest.full_name}</p>
                            {guest.is_primary && (
                              <Badge variant="secondary" className="text-[10px]">Primary</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          {guest.phone && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {guest.phone}
                            </div>
                          )}
                          {guest.email && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {guest.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {guest.id_proof_type ? (
                          <div>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {guest.id_proof_type.replace('_', ' ')}
                            </Badge>
                            {guest.id_proof_number && (
                              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                                {guest.id_proof_number}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{guest.roomNumber}</TableCell>
                      <TableCell className="text-xs">
                        {format(parseISO(guest.checkIn), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            guest.bookingStatus === 'checked_in' ? 'default' :
                            guest.bookingStatus === 'checked_out' ? 'secondary' : 'outline'
                          }
                          className="text-[10px]"
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
