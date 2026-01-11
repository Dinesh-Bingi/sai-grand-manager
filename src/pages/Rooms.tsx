import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FloorSection } from '@/components/rooms/FloorSection';
import { BookingModal } from '@/components/bookings/BookingModal';
import { useRooms, useUpdateRoomStatus } from '@/hooks/useRooms';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Building2, DoorOpen, Sparkles, Wrench, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { Room, RoomStatus } from '@/types/hotel';

export default function Rooms() {
  const { data: rooms, isLoading } = useRooms();
  const updateRoomStatus = useUpdateRoomStatus();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Calculate room statistics
  const roomStats = useMemo(() => {
    if (!rooms) return { total: 0, available: 0, occupied: 0, cleaning: 0, maintenance: 0 };
    return {
      total: rooms.length,
      available: rooms.filter(r => r.status === 'available').length,
      occupied: rooms.filter(r => r.status === 'occupied').length,
      cleaning: rooms.filter(r => r.status === 'cleaning').length,
      maintenance: rooms.filter(r => r.status === 'maintenance').length,
    };
  }, [rooms]);

  // Group rooms by floor
  const roomsByFloor = useMemo(() => {
    if (!rooms) return {};
    
    let filtered = rooms;
    
    if (searchQuery) {
      filtered = filtered.filter(room =>
        room.room_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(room => room.status === statusFilter);
    }
    
    return filtered.reduce((acc, room) => {
      const floor = room.floor;
      if (!acc[floor]) acc[floor] = [];
      acc[floor].push(room);
      return acc;
    }, {} as Record<number, Room[]>);
  }, [rooms, searchQuery, statusFilter]);

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setBookingModalOpen(true);
  };

  const handleMarkCleaned = async (room: Room) => {
    try {
      await updateRoomStatus.mutateAsync({ roomId: room.id, status: 'available' });
      toast.success('Room Status Updated', {
        description: `Room ${room.room_number} is now available for booking`,
      });
    } catch (error) {
      toast.error('Update Failed', {
        description: 'Unable to update room status. Please try again.',
      });
    }
  };

  const handleRoomClick = (room: Room) => {
    console.log('Room clicked:', room);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
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
              <Building2 className="h-8 w-8 text-primary" />
              Room Inventory
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time accommodation status across all floors
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2 border-success/20 bg-success/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
                <DoorOpen className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-success">{roomStats.available}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-destructive/20 bg-destructive/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/20">
                <Users className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold text-destructive">{roomStats.occupied}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-warning/20 bg-warning/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/20">
                <Sparkles className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Housekeeping</p>
                <p className="text-2xl font-bold text-warning">{roomStats.cleaning}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-muted-foreground/20 bg-muted/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Wrench className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold">{roomStats.maintenance}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by room number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as RoomStatus | 'all')}
              >
                <SelectTrigger className="w-full md:w-56">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accommodations</SelectItem>
                  <SelectItem value="available">Available for Booking</SelectItem>
                  <SelectItem value="occupied">Currently Occupied</SelectItem>
                  <SelectItem value="cleaning">Housekeeping in Progress</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Room Status Legend */}
        <div className="flex flex-wrap gap-6 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-success shadow-sm" />
            <span className="text-sm font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-destructive shadow-sm" />
            <span className="text-sm font-medium">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-warning shadow-sm" />
            <span className="text-sm font-medium">Housekeeping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-muted-foreground shadow-sm" />
            <span className="text-sm font-medium">Maintenance</span>
          </div>
        </div>

        {/* Floor Sections */}
        <div className="space-y-4">
          {Object.entries(roomsByFloor)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([floor, floorRooms]) => (
              <FloorSection
                key={floor}
                floor={Number(floor)}
                floorName={`Floor ${floor}`}
                rooms={floorRooms}
                onRoomClick={handleRoomClick}
                onBookRoom={handleBookRoom}
                onMarkCleaned={handleMarkCleaned}
              />
            ))}
        </div>

        {Object.keys(roomsByFloor).length === 0 && (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No Rooms Found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                No accommodations match your current search criteria
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        room={selectedRoom}
        open={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedRoom(null);
        }}
      />
    </AppLayout>
  );
}
