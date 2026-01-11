import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FloorSection } from '@/components/rooms/FloorSection';
import { BookingModal } from '@/components/bookings/BookingModal';
import { useRooms, useUpdateRoomStatus } from '@/hooks/useRooms';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Room, RoomStatus } from '@/types/hotel';

export default function Rooms() {
  const { data: rooms, isLoading } = useRooms();
  const updateRoomStatus = useUpdateRoomStatus();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

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
      toast.success(`Room ${room.room_number} marked as available`);
    } catch (error) {
      toast.error('Failed to update room status');
    }
  };

  const handleRoomClick = (room: Room) => {
    console.log('Room clicked:', room);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-3 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Room Inventory</h1>
            <p className="text-sm text-muted-foreground">
              {roomStats.total} rooms across 5 floors
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 md:grid-cols-4">
          <Card className="border-l-4 border-l-success">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Available</p>
                  <p className="text-2xl font-semibold text-success">{roomStats.available}</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-destructive">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Occupied</p>
                  <p className="text-2xl font-semibold text-destructive">{roomStats.occupied}</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Cleaning</p>
                  <p className="text-2xl font-semibold text-warning">{roomStats.cleaning}</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-muted-foreground">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Maintenance</p>
                  <p className="text-2xl font-semibold">{roomStats.maintenance}</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as RoomStatus | 'all')}
          >
            <SelectTrigger className="w-full md:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Floor Sections */}
        <div className="space-y-3">
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
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No rooms match your criteria</p>
            </CardContent>
          </Card>
        )}
      </div>

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
