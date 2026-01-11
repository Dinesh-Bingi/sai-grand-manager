export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';
export type RoomType = 'standard' | 'luxury' | 'penthouse' | 'function_hall';
export type IdProofType = 'aadhaar' | 'passport' | 'driving_license' | 'voter_id';
export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';

export interface Room {
  id: string;
  room_number: string;
  floor: number;
  room_type: RoomType;
  base_price: number;
  ac_charge: number;
  geyser_charge: number;
  status: RoomStatus;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: string;
  booking_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_primary: boolean;
  id_proof_type: IdProofType | null;
  id_proof_number: string | null;
  id_front_image: string | null;
  id_back_image: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  room_id: string;
  check_in: string;
  check_out: string | null;
  expected_checkout: string;
  has_ac: boolean;
  has_geyser: boolean;
  base_price: number;
  ac_charge: number;
  geyser_charge: number;
  total_amount: number;
  advance_paid: number;
  extra_charges: number;
  status: BookingStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  room?: Room;
  guests?: Guest[];
}

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  cleaningRooms: number;
  maintenanceRooms: number;
  guestsToday: number;
  todayCollection: number;
  occupancyPercentage: number;
  isWeekendRush: boolean;
}

export interface FloorData {
  floor: number;
  name: string;
  rooms: Room[];
}
