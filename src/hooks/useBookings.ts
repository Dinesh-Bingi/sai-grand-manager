import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Booking, BookingStatus, Guest } from '@/types/hotel';

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          room:rooms(*),
          guests(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Booking[];
    },
  });
}

export function useActiveBookings() {
  return useQuery({
    queryKey: ['active-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          room:rooms(*),
          guests(*)
        `)
        .in('status', ['confirmed', 'checked_in'])
        .order('check_in', { ascending: true });
      
      if (error) throw error;
      return data as Booking[];
    },
  });
}

export function useTodaysBookings() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return useQuery({
    queryKey: ['todays-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          room:rooms(*),
          guests(*)
        `)
        .gte('check_in', today.toISOString())
        .lt('check_in', tomorrow.toISOString())
        .order('check_in', { ascending: true });
      
      if (error) throw error;
      return data as Booking[];
    },
  });
}

interface CreateBookingData {
  room_id: string;
  check_in: string;
  expected_checkout: string;
  has_ac: boolean;
  has_geyser: boolean;
  base_price: number;
  ac_charge: number;
  geyser_charge: number;
  total_amount: number;
  advance_paid: number;
  notes?: string;
  guests: Omit<Guest, 'id' | 'booking_id' | 'created_at'>[];
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookingData: CreateBookingData) => {
      const { guests, ...booking } = bookingData;
      
      // Create booking
      const { data: newBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          ...booking,
          status: 'checked_in',
        })
        .select()
        .single();
      
      if (bookingError) throw bookingError;
      
      // Create guests with phone_number
      const guestsWithBookingId = guests.map(guest => ({
        ...guest,
        booking_id: newBooking.id,
        phone_number: guest.phone_number || guest.phone || null, // Use phone_number field
        // Mark as verified if ID images exist
        id_verified: !!(guest.id_front_image && guest.id_back_image && guest.id_proof_type),
      }));
      
      const { error: guestsError } = await supabase
        .from('guests')
        .insert(guestsWithBookingId);
      
      if (guestsError) throw guestsError;
      
      // Update guest stay dates for primary guests
      const primaryGuest = guests.find(g => g.is_primary);
      if (primaryGuest?.phone_number) {
        // Update first_stay_at and last_stay_at via database function
        // This is handled by the trigger, but we can also call it explicitly if needed
        await supabase.rpc('update_guest_stay_dates');
      }
      
      // Update room status to occupied
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('id', booking.room_id);
      
      if (roomError) throw roomError;
      
      return newBooking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['todays-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useCheckoutBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ bookingId, roomId, extraCharges = 0 }: { bookingId: string; roomId: string; extraCharges?: number }) => {
      // Update booking
      const { data, error: bookingError } = await supabase
        .from('bookings')
        .update({ 
          status: 'checked_out',
          check_out: new Date().toISOString(),
          extra_charges: extraCharges,
        })
        .eq('id', bookingId)
        .select()
        .single();
      
      if (bookingError) throw bookingError;
      
      // Update room status to cleaning
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'cleaning' })
        .eq('id', roomId);
      
      if (roomError) throw roomError;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
