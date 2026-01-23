export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          ac_charge: number
          advance_paid: number
          base_price: number
          check_in: string
          check_out: string | null
          created_at: string
          created_by: string | null
          expected_checkout: string
          extra_charges: number
          geyser_charge: number
          has_ac: boolean
          has_geyser: boolean
          id: string
          notes: string | null
          room_id: string
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          ac_charge?: number
          advance_paid?: number
          base_price: number
          check_in: string
          check_out?: string | null
          created_at?: string
          created_by?: string | null
          expected_checkout: string
          extra_charges?: number
          geyser_charge?: number
          has_ac?: boolean
          has_geyser?: boolean
          id?: string
          notes?: string | null
          room_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          ac_charge?: number
          advance_paid?: number
          base_price?: number
          check_in?: string
          check_out?: string | null
          created_at?: string
          created_by?: string | null
          expected_checkout?: string
          extra_charges?: number
          geyser_charge?: number
          has_ac?: boolean
          has_geyser?: boolean
          id?: string
          notes?: string | null
          room_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          address: string | null
          booking_id: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          id_back_image: string | null
          id_front_image: string | null
          id_proof_number: string | null
          id_proof_type: Database["public"]["Enums"]["id_proof_type"] | null
          is_primary: boolean
          phone: string | null
        }
        Insert: {
          address?: string | null
          booking_id: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          id_back_image?: string | null
          id_front_image?: string | null
          id_proof_number?: string | null
          id_proof_type?: Database["public"]["Enums"]["id_proof_type"] | null
          is_primary?: boolean
          phone?: string | null
        }
        Update: {
          address?: string | null
          booking_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          id_back_image?: string | null
          id_front_image?: string | null
          id_proof_number?: string | null
          id_proof_type?: Database["public"]["Enums"]["id_proof_type"] | null
          is_primary?: boolean
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_history: {
        Row: {
          ac_charge: number
          base_price: number
          changed_at: string
          changed_by: string | null
          geyser_charge: number
          id: string
          room_id: string
        }
        Insert: {
          ac_charge: number
          base_price: number
          changed_at?: string
          changed_by?: string | null
          geyser_charge: number
          id?: string
          room_id: string
        }
        Update: {
          ac_charge?: number
          base_price?: number
          changed_at?: string
          changed_by?: string | null
          geyser_charge?: number
          id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_history_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          ac_charge: number
          base_price: number
          created_at: string
          description: string | null
          floor: number
          geyser_charge: number
          id: string
          room_number: string
          room_type: Database["public"]["Enums"]["room_type"]
          status: Database["public"]["Enums"]["room_status"]
          updated_at: string
        }
        Insert: {
          ac_charge?: number
          base_price?: number
          created_at?: string
          description?: string | null
          floor: number
          geyser_charge?: number
          id?: string
          room_number: string
          room_type?: Database["public"]["Enums"]["room_type"]
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Update: {
          ac_charge?: number
          base_price?: number
          created_at?: string
          description?: string | null
          floor?: number
          geyser_charge?: number
          id?: string
          room_number?: string
          room_type?: Database["public"]["Enums"]["room_type"]
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waiting_list: {
        Row: {
          created_at: string
          guest_name: string
          has_ac: boolean | null
          id: string
          notes: string | null
          phone: string
          preferred_room_type: Database["public"]["Enums"]["room_type"] | null
          status: string
        }
        Insert: {
          created_at?: string
          guest_name: string
          has_ac?: boolean | null
          id?: string
          notes?: string | null
          phone: string
          preferred_room_type?: Database["public"]["Enums"]["room_type"] | null
          status?: string
        }
        Update: {
          created_at?: string
          guest_name?: string
          has_ac?: boolean | null
          id?: string
          notes?: string | null
          phone?: string
          preferred_room_type?: Database["public"]["Enums"]["room_type"] | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff_or_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff"
      booking_status: "confirmed" | "checked_in" | "checked_out" | "cancelled"
      id_proof_type: "aadhaar" | "passport" | "driving_license" | "voter_id"
      room_status: "available" | "occupied" | "cleaning" | "maintenance"
      room_type: "standard" | "luxury" | "penthouse" | "function_hall"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff"],
      booking_status: ["confirmed", "checked_in", "checked_out", "cancelled"],
      id_proof_type: ["aadhaar", "passport", "driving_license", "voter_id"],
      room_status: ["available", "occupied", "cleaning", "maintenance"],
      room_type: ["standard", "luxury", "penthouse", "function_hall"],
    },
  },
} as const
