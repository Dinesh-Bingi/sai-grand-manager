import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
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

const floorLabels: Record<number, string> = {
  1: '1st Floor - Standard',
  2: '2nd Floor - Standard',
  3: '3rd Floor - Function Hall',
  4: '4th Floor - Luxury',
  5: '5th Floor - Penthouse',
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
    <div className="rounded-md border bg-card">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 rounded-t-md"
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">{floorLabels[floor] || `Floor ${floor}`}</span>
          <span className="text-sm text-muted-foreground">({rooms.length})</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
            {availableCount} available
          </Badge>
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
            {occupiedCount} occupied
          </Badge>
        </div>
      </Button>
      
      {isOpen && (
        <div
          className="grid gap-3 p-4 border-t"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
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
      )}
    </div>
  );
}
