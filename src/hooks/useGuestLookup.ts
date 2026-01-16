import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GuestLookupResult {
  guest_exists: boolean;
  guest_id: string | null;
  full_name: string | null;
  phone_number: string | null;
  id_verified: boolean;
  id_proof_type: 'aadhaar' | 'passport' | 'driving_license' | 'voter_id' | null;
  id_front_image: string | null;
  id_back_image: string | null;
  first_stay_at: string | null;
  last_stay_at: string | null;
}

export function useGuestLookup(phoneNumber: string | null) {
  return useQuery({
    queryKey: ['guest-lookup', phoneNumber],
    queryFn: async (): Promise<GuestLookupResult> => {
      if (!phoneNumber || phoneNumber.trim().length === 0) {
        return {
          guest_exists: false,
          guest_id: null,
          full_name: null,
          phone_number: null,
          id_verified: false,
          id_proof_type: null,
          id_front_image: null,
          id_back_image: null,
          first_stay_at: null,
          last_stay_at: null,
        };
      }

      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

      // Call the database function
      const { data, error } = await supabase.rpc('lookup_guest_by_phone', {
        _phone_number: cleanPhone,
      });

      if (error) {
        console.error('Guest lookup error:', error);
        return {
          guest_exists: false,
          guest_id: null,
          full_name: null,
          phone_number: null,
          id_verified: false,
          id_proof_type: null,
          id_front_image: null,
          id_back_image: null,
          first_stay_at: null,
          last_stay_at: null,
        };
      }

      if (data && data.length > 0) {
        const result = data[0];
        return {
          guest_exists: result.guest_exists || false,
          guest_id: result.guest_id || null,
          full_name: result.full_name || null,
          phone_number: result.phone_number || null,
          id_verified: result.id_verified || false,
          id_proof_type: result.id_proof_type || null,
          id_front_image: result.id_front_image || null,
          id_back_image: result.id_back_image || null,
          first_stay_at: result.first_stay_at || null,
          last_stay_at: result.last_stay_at || null,
        };
      }

      return {
        guest_exists: false,
        guest_id: null,
        full_name: null,
        phone_number: null,
        id_verified: false,
        id_proof_type: null,
        id_front_image: null,
        id_back_image: null,
        first_stay_at: null,
        last_stay_at: null,
      };
    },
    enabled: !!phoneNumber && phoneNumber.trim().length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });
}
