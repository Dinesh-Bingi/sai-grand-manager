import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Room, RoomStatus } from '@/types/hotel';

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('floor', { ascending: true })
        .order('room_number', { ascending: true });
      
      if (error) throw error;
      return data as Room[];
    },
  });
}

export function useUpdateRoomStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ roomId, status }: { roomId: string; status: RoomStatus }) => {
      const { data, error } = await supabase
        .from('rooms')
        .update({ status })
        .eq('id', roomId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateRoomPricing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      roomId, 
      base_price, 
      ac_charge, 
      geyser_charge 
    }: { 
      roomId: string; 
      base_price: number; 
      ac_charge: number; 
      geyser_charge: number;
    }) => {
      const { data, error } = await supabase
        .from('rooms')
        .update({ base_price, ac_charge, geyser_charge })
        .eq('id', roomId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
