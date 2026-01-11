import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FloorSection } from '@/components/rooms/FloorSection';
import { BookingModal } from '@/components/bookings/BookingModal';
import { useRooms, useUpdateRoomStatus } from '@/hooks/useRooms';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import type { Room, RoomStatus } from '@/types/hotel';

export default function Rooms() {
  const { data: rooms, isLoading } = useRooms();
  const updateRoomStatus = useUpdateRoomStatus();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

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
      toast.success(`Room ${room.room_number} marked as available`);
    } catch (error) {
      toast.error('Failed to update room status');
    }
  };

  const handleRoomClick = (room: Room) => {
    // Could open a detail modal or navigate to room details
    console.log('Room clicked:', room);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
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
            <h1 className="font-serif text-3xl font-bold">Rooms</h1>
            <p className="text-muted-foreground">
              Manage all {rooms?.length || 0} rooms across 5 floors
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as RoomStatus | 'all')}
          >
            <SelectTrigger className="w-full md:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
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

        {/* Room Status Legend */}
        <div className="flex flex-wrap gap-4 rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span className="text-sm">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-warning" />
            <span className="text-sm">Cleaning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted-foreground" />
            <span className="text-sm">Maintenance</span>
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
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12">
            <p className="text-muted-foreground">No rooms found matching your criteria</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Clear filters
            </Button>
          </div>
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
