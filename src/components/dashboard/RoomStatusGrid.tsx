import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Room } from '@/types/hotel';

interface RoomStatusGridProps {
  rooms: Room[];
  className?: string;
}

const statusConfig = {
  available: { 
    bg: 'bg-success/10', 
    border: 'border-success/30',
    dot: 'bg-success',
    label: 'Available' 
  },
  occupied: { 
    bg: 'bg-primary/10', 
    border: 'border-primary/30',
    dot: 'bg-primary',
    label: 'Occupied' 
  },
  cleaning: { 
    bg: 'bg-warning/10', 
    border: 'border-warning/30',
    dot: 'bg-warning',
    label: 'Cleaning' 
  },
  maintenance: { 
    bg: 'bg-muted', 
    border: 'border-border',
    dot: 'bg-muted-foreground',
    label: 'Maintenance' 
  },
};

export function RoomStatusGrid({ rooms, className }: RoomStatusGridProps) {
  // Group rooms by floor
  const roomsByFloor = rooms.reduce((acc, room) => {
    const floor = room.floor;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {} as Record<number, Room[]>);

  const floors = Object.keys(roomsByFloor)
    .map(Number)
    .sort((a, b) => a - b);

  // Room counts
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const cleaningRooms = rooms.filter(r => r.status === 'cleaning').length;
  const occupancyPercentage = totalRooms > 0 
    ? Math.round((occupiedRooms / totalRooms) * 100) 
    : 0;

  return (
    <div className={cn('rounded-xl border border-border/50 bg-card shadow-luxury', className)}>
      {/* Header with legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 px-6 py-4">
        <h2 className="text-lg font-bold text-foreground">Room Status</h2>
        <div className="flex flex-wrap items-center gap-4">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', config.dot)} />
              <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Room grid */}
      <div className="p-6 space-y-5">
        {floors.map((floor) => (
          <div key={floor} className="flex flex-wrap gap-2">
            {roomsByFloor[floor]
              .sort((a, b) => a.room_number.localeCompare(b.room_number))
              .map((room) => {
                const config = statusConfig[room.status as keyof typeof statusConfig];
                return (
                  <div
                    key={room.id}
                    className={cn(
                      'flex h-10 w-14 items-center justify-center rounded-md border text-sm font-bold transition-all hover:scale-105',
                      config.bg,
                      config.border
                    )}
                    title={`Room ${room.room_number} - ${config.label}`}
                  >
                    {room.room_number}
                  </div>
                );
              })}
          </div>
        ))}
      </div>

      {/* Footer summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/50 px-6 py-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{totalRooms}</span> Rooms Total
          <span className="mx-2">|</span>
          <span className="font-bold text-foreground">{occupiedRooms}</span> Rooms Occupied ({occupancyPercentage}% Occupancy)
          {cleaningRooms > 0 && (
            <>
              <span className="mx-2">|</span>
              <span className="font-bold text-foreground">{cleaningRooms}</span> Cleaning
            </>
          )}
        </p>
        <Button asChild variant="outline" size="sm" className="gap-1 font-semibold">
          <Link to="/rooms">
            View All Room Status
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}