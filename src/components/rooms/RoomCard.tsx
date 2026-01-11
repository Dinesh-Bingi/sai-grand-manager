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
  UserPlus,
  CheckCircle,
} from 'lucide-react';
import type { Room, RoomStatus } from '@/types/hotel';

interface RoomCardProps {
  room: Room;
  onClick?: () => void;
  onBook?: () => void;
  onMarkCleaned?: () => void;
  compact?: boolean;
}

const statusConfig: Record<RoomStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  available: { 
    label: 'Available', 
    color: 'text-success', 
    bgColor: 'bg-success/10',
    borderColor: 'border-success/40'
  },
  occupied: { 
    label: 'Occupied', 
    color: 'text-destructive', 
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/40'
  },
  cleaning: { 
    label: 'Housekeeping', 
    color: 'text-warning', 
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/40'
  },
  maintenance: { 
    label: 'Maintenance', 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted',
    borderColor: 'border-muted-foreground/40'
  },
};

const roomTypeConfig = {
  standard: { icon: Home, label: 'Standard' },
  luxury: { icon: Sparkles, label: 'Luxury' },
  penthouse: { icon: Crown, label: 'Penthouse' },
  function_hall: { icon: Building, label: 'Function Hall' },
};

export function RoomCard({ room, onClick, onBook, onMarkCleaned, compact = false }: RoomCardProps) {
  const status = statusConfig[room.status];
  const roomType = roomTypeConfig[room.room_type];
  const RoomIcon = roomType.icon;

  if (compact) {
    return (
      <Card
        className={cn(
          'cursor-pointer border-2 transition-all hover:shadow-md',
          status.bgColor,
          status.borderColor
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
        'cursor-pointer border-2 transition-all hover:shadow-lg hover:scale-[1.01]',
        status.bgColor,
        status.borderColor
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              'flex h-14 w-14 items-center justify-center rounded-xl border-2',
              status.bgColor,
              status.borderColor
            )}>
              <RoomIcon className={cn('h-7 w-7', status.color)} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{room.room_number}</h3>
              <p className="text-sm text-muted-foreground">
                {roomType.label} • Level {room.floor}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn('font-semibold text-xs px-3 py-1', status.color, status.bgColor, status.borderColor)}
          >
            {status.label}
          </Badge>
        </div>

        <div className="mt-5 flex items-center gap-5 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-foreground">₹{room.base_price.toLocaleString('en-IN')}</span>
            <span className="text-muted-foreground">/night</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <AirVent className="h-4 w-4" />
            <span>+₹{room.ac_charge}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
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
            className="mt-5 w-full font-semibold"
            size="lg"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create Reservation
          </Button>
        )}

        {room.status === 'cleaning' && onMarkCleaned && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onMarkCleaned();
            }}
            variant="outline"
            className="mt-5 w-full border-success text-success hover:bg-success/10 font-semibold"
            size="lg"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark Ready for Guests
          </Button>
        )}

        {room.status === 'maintenance' && (
          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
            <Wrench className="h-4 w-4" />
            <span>Currently under maintenance</span>
          </div>
        )}

        {room.status === 'occupied' && (
          <div className="mt-5 flex items-center gap-2 text-sm text-destructive/80 p-3 rounded-lg bg-destructive/5">
            <span className="font-medium">Guest in residence</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
