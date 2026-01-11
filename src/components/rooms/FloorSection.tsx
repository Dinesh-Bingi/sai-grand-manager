import { useState } from 'react';
import { ChevronDown, ChevronUp, DoorOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoomCard } from './RoomCard';
import { cn } from '@/lib/utils';
import type { Room } from '@/types/hotel';

interface FloorSectionProps {
  floor: number;
  floorName: string;
  rooms: Room[];
  onRoomClick: (room: Room) => void;
  onBookRoom: (room: Room) => void;
  onMarkCleaned: (room: Room) => void;
  defaultOpen?: boolean;
}

const floorNames: Record<number, string> = {
  1: 'Ground Level — Standard Accommodations',
  2: 'First Level — Standard Accommodations',
  3: 'Second Level — Function Hall & Deluxe',
  4: 'Third Level — Luxury Accommodations',
  5: 'Penthouse Level — Premium Suites',
};

export function FloorSection({
  floor,
  rooms,
  onRoomClick,
  onBookRoom,
  onMarkCleaned,
  defaultOpen = true,
}: FloorSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const availableCount = rooms.filter(r => r.status === 'available').length;
  const occupiedCount = rooms.filter(r => r.status === 'occupied').length;
  const totalRooms = rooms.length;

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-muted/50 rounded-none"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-lg font-bold text-primary">{floor}</span>
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold">
              {floorNames[floor] || `Floor ${floor}`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {totalRooms} accommodation{totalRooms !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 bg-success/10 text-success border-success/30 font-medium">
              <DoorOpen className="h-3.5 w-3.5" />
              {availableCount} Available
            </Badge>
            <Badge variant="outline" className="gap-1.5 bg-destructive/10 text-destructive border-destructive/30 font-medium">
              <Users className="h-3.5 w-3.5" />
              {occupiedCount} Occupied
            </Badge>
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </Button>
      
      <div
        className={cn(
          'grid gap-4 overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[2000px] px-6 pb-6 pt-2' : 'max-h-0 p-0'
        )}
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        }}
      >
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onClick={() => onRoomClick(room)}
            onBook={() => onBookRoom(room)}
            onMarkCleaned={() => onMarkCleaned(room)}
          />
        ))}
      </div>
    </div>
  );
}
