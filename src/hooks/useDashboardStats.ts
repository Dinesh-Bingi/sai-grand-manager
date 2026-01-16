import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DashboardStats } from '@/types/hotel';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Get all rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*');
      
      if (roomsError) throw roomsError;
      
      // Get today's bookings for collection
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const { data: todaysBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('total_amount, extra_charges, guests(id)')
        .gte('check_in', today.toISOString())
        .lt('check_in', tomorrow.toISOString());
      
      if (bookingsError) throw bookingsError;
      
      // Calculate stats
      const totalRooms = rooms?.length || 0;
      const occupiedRooms = rooms?.filter(r => r.status === 'occupied').length || 0;
      const availableRooms = rooms?.filter(r => r.status === 'available').length || 0;
      const cleaningRooms = rooms?.filter(r => r.status === 'cleaning').length || 0;
      const maintenanceRooms = rooms?.filter(r => r.status === 'maintenance').length || 0;
      
      // Count guests from today's bookings
      const guestsToday = todaysBookings?.reduce((acc, booking) => {
        return acc + (booking.guests?.length || 0);
      }, 0) || 0;
      
      // Calculate today's collection
      const todayCollection = todaysBookings?.reduce((acc, booking) => {
        return acc + Number(booking.total_amount || 0) + Number(booking.extra_charges || 0);
      }, 0) || 0;
      
      // Calculate occupancy percentage (exclude function hall and rooms under maintenance)
      const bookableRooms = rooms?.filter(r => r.room_type !== 'function_hall' && r.status !== 'maintenance').length || 1;
      const occupancyPercentage = Math.round((occupiedRooms / bookableRooms) * 100);
      
      // Check if it's weekend (Friday, Saturday, Sunday)
      const dayOfWeek = new Date().getDay();
      const isWeekendRush = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
      
      return {
        totalRooms,
        occupiedRooms,
        availableRooms,
        cleaningRooms,
        maintenanceRooms,
        guestsToday,
        todayCollection,
        occupancyPercentage,
        isWeekendRush,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
