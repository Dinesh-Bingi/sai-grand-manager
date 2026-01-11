import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  1: '1st Floor - Standard Rooms',
  2: '2nd Floor - Standard Rooms',
  3: '3rd Floor - Function Hall & Deluxe',
  4: '4th Floor - Luxury Rooms',
  5: 'Penthouse - Premium Suites',
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

  return (
    <div className="rounded-xl border bg-card">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-t-xl px-5 py-4 text-left hover:bg-muted/50"
      >
        <div className="flex items-center gap-4">
          <h3 className="font-serif text-lg font-semibold">{floorNames[floor] || `Floor ${floor}`}</h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
              {availableCount} available
            </span>
            <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
              {occupiedCount} occupied
            </span>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>
      
      <div
        className={cn(
          'grid gap-4 overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-[2000px] p-5 pt-2' : 'max-h-0 p-0'
        )}
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
