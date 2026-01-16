import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AirVent, Droplets, Crown, Building, Home, Sparkles, Wrench } from 'lucide-react';
import type { Room, RoomStatus } from '@/types/hotel';

interface RoomCardProps {
  room: Room;
  onClick?: () => void;
  onBook?: () => void;
  onMarkCleaned?: () => void;
  compact?: boolean;
}

const statusConfig: Record<RoomStatus, { label: string; color: string; bg: string }> = {
  available: { label: 'Available', color: 'text-success', bg: 'bg-success/10 border-success/30' },
  occupied: { label: 'Occupied', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30' },
  cleaning: { label: 'Cleaning', color: 'text-warning', bg: 'bg-warning/10 border-warning/30' },
  maintenance: { label: 'Maintenance', color: 'text-muted-foreground', bg: 'bg-muted border-muted-foreground/30' },
};

const roomTypeIcons = {
  standard: Home,
  luxury: Sparkles,
  penthouse: Crown,
  function_hall: Building,
};

export function RoomCard({ room, onClick, onBook, onMarkCleaned, compact = false }: RoomCardProps) {
  const status = statusConfig[room.status];
  const RoomIcon = roomTypeIcons[room.room_type];

  if (compact) {
    return (
      <Card
        className={cn('cursor-pointer border transition-colors hover:shadow-sm', status.bg)}
        onClick={onClick}
      >
        <CardContent className="flex flex-col items-center justify-center p-2">
          <span className="font-semibold">{room.room_number}</span>
          <span className={cn('text-xs', status.color)}>{status.label}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn('cursor-pointer border transition-colors hover:shadow-sm', status.bg)}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-md', status.bg)}>
              <RoomIcon className={cn('h-5 w-5', status.color)} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{room.room_number}</h3>
              <p className="text-xs text-muted-foreground capitalize">
                {room.room_type.replace('_', ' ')}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-xs', status.color, status.bg)}>
            {status.label}
          </Badge>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">₹{room.base_price}</span>
          <div className="flex items-center gap-1">
            <AirVent className="h-3 w-3" />
            +₹{room.ac_charge}
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="h-3 w-3" />
            +₹{room.geyser_charge}
          </div>
        </div>

        {room.status === 'available' && onBook && (
          <Button
            onClick={(e) => { e.stopPropagation(); onBook(); }}
            className="mt-3 w-full"
            size="sm"
          >
            Book Now
          </Button>
        )}

        {room.status === 'cleaning' && onMarkCleaned && (
          <Button
            onClick={(e) => { e.stopPropagation(); onMarkCleaned(); }}
            variant="outline"
            className="mt-3 w-full border-success text-success hover:bg-success/10"
            size="sm"
          >
            Mark Cleaned
          </Button>
        )}

        {room.status === 'maintenance' && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Wrench className="h-3 w-3" />
            Under maintenance
          </div>
        )}
      </CardContent>
    </Card>
  );
}
