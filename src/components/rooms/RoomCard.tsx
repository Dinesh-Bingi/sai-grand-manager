import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AirVent,
  Droplets,
  Crown,
  Building,
  Home,
  Sparkles,
  Wrench,
  User,
} from 'lucide-react';
import type { Room, RoomStatus } from '@/types/hotel';

interface RoomCardProps {
  room: Room;
  onClick?: () => void;
  onBook?: () => void;
  onMarkCleaned?: () => void;
  compact?: boolean;
}

const statusConfig: Record<RoomStatus, { label: string; color: string; bgColor: string }> = {
  available: { label: 'Available', color: 'text-success', bgColor: 'bg-success/10 border-success/30' },
  occupied: { label: 'Occupied', color: 'text-destructive', bgColor: 'bg-destructive/10 border-destructive/30' },
  cleaning: { label: 'Cleaning', color: 'text-warning', bgColor: 'bg-warning/10 border-warning/30' },
  maintenance: { label: 'Maintenance', color: 'text-muted-foreground', bgColor: 'bg-muted border-muted-foreground/30' },
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
        className={cn(
          'cursor-pointer border-2 transition-all hover:shadow-md',
          status.bgColor
        )}
        onClick={onClick}
      >
        <CardContent className="flex flex-col items-center justify-center p-3">
          <span className="text-lg font-bold">{room.room_number}</span>
          <span className={cn('text-xs font-medium', status.color)}>{status.label}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'cursor-pointer border-2 transition-all hover:shadow-lg',
        status.bgColor
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', status.bgColor)}>
              <RoomIcon className={cn('h-6 w-6', status.color)} />
            </div>
            <div>
              <h3 className="text-xl font-bold">{room.room_number}</h3>
              <p className="text-sm capitalize text-muted-foreground">
                {room.room_type.replace('_', ' ')} • Floor {room.floor}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={cn('font-medium', status.color, status.bgColor)}>
            {status.label}
          </Badge>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground">₹{room.base_price}</span>
            <span>/night</span>
          </div>
          <div className="flex items-center gap-1">
            <AirVent className="h-4 w-4" />
            <span>+₹{room.ac_charge}</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="h-4 w-4" />
            <span>+₹{room.geyser_charge}</span>
          </div>
        </div>

        {room.status === 'available' && onBook && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onBook();
            }}
            className="mt-4 w-full"
            size="sm"
          >
            <User className="mr-2 h-4 w-4" />
            Book Now
          </Button>
        )}

        {room.status === 'cleaning' && onMarkCleaned && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onMarkCleaned();
            }}
            variant="outline"
            className="mt-4 w-full border-success text-success hover:bg-success/10"
            size="sm"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Mark as Cleaned
          </Button>
        )}

        {room.status === 'maintenance' && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Wrench className="h-4 w-4" />
            <span>Under maintenance</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
