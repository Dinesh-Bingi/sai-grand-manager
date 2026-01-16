-- Create enums for room status and types
CREATE TYPE public.room_status AS ENUM ('available', 'occupied', 'cleaning', 'maintenance');
CREATE TYPE public.room_type AS ENUM ('standard', 'luxury', 'penthouse', 'function_hall');
CREATE TYPE public.id_proof_type AS ENUM ('aadhaar', 'passport', 'driving_license', 'voter_id');
CREATE TYPE public.booking_status AS ENUM ('confirmed', 'checked_in', 'checked_out', 'cancelled');
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- Rooms table
CREATE TABLE public.rooms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_number TEXT NOT NULL UNIQUE,
    floor INTEGER NOT NULL,
    room_type room_type NOT NULL DEFAULT 'standard',
    base_price DECIMAL(10,2) NOT NULL DEFAULT 1000,
    ac_charge DECIMAL(10,2) NOT NULL DEFAULT 300,
    geyser_charge DECIMAL(10,2) NOT NULL DEFAULT 100,
    status room_status NOT NULL DEFAULT 'available',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bookings table
CREATE TABLE public.bookings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out TIMESTAMP WITH TIME ZONE,
    expected_checkout TIMESTAMP WITH TIME ZONE NOT NULL,
    has_ac BOOLEAN NOT NULL DEFAULT false,
    has_geyser BOOLEAN NOT NULL DEFAULT false,
    base_price DECIMAL(10,2) NOT NULL,
    ac_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    geyser_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    advance_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
    extra_charges DECIMAL(10,2) NOT NULL DEFAULT 0,
    status booking_status NOT NULL DEFAULT 'confirmed',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Guests table (supports multiple guests per booking)
CREATE TABLE public.guests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    id_proof_type id_proof_type,
    id_proof_number TEXT,
    id_front_image TEXT,
    id_back_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pricing history for audit
CREATE TABLE public.pricing_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    base_price DECIMAL(10,2) NOT NULL,
    ac_charge DECIMAL(10,2) NOT NULL,
    geyser_charge DECIMAL(10,2) NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'staff',
    UNIQUE(user_id, role)
);

-- Profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Waiting list for when rooms are full
CREATE TABLE public.waiting_list (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    guest_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    preferred_room_type room_type,
    has_ac BOOLEAN DEFAULT false,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'waiting',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activity logs for audit
CREATE TABLE public.activity_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin or staff
CREATE OR REPLACE FUNCTION public.is_staff_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'staff')
  )
$$;

-- RLS Policies for rooms (readable by authenticated staff/admin)
CREATE POLICY "Staff and admin can view rooms"
ON public.rooms FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Admin can manage rooms"
ON public.rooms FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can update room status"
ON public.rooms FOR UPDATE
TO authenticated
USING (public.is_staff_or_admin(auth.uid()))
WITH CHECK (public.is_staff_or_admin(auth.uid()));

-- RLS Policies for bookings
CREATE POLICY "Staff and admin can view bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff and admin can create bookings"
ON public.bookings FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff and admin can update bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (public.is_staff_or_admin(auth.uid()))
WITH CHECK (public.is_staff_or_admin(auth.uid()));

-- RLS Policies for guests
CREATE POLICY "Staff and admin can view guests"
ON public.guests FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff and admin can manage guests"
ON public.guests FOR ALL
TO authenticated
USING (public.is_staff_or_admin(auth.uid()))
WITH CHECK (public.is_staff_or_admin(auth.uid()));

-- RLS Policies for pricing_history
CREATE POLICY "Staff and admin can view pricing history"
ON public.pricing_history FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Admin can insert pricing history"
ON public.pricing_history FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admin can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for waiting_list
CREATE POLICY "Staff and admin can manage waiting list"
ON public.waiting_list FOR ALL
TO authenticated
USING (public.is_staff_or_admin(auth.uid()))
WITH CHECK (public.is_staff_or_admin(auth.uid()));

-- RLS Policies for activity_logs
CREATE POLICY "Staff and admin can view logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff and admin can create logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_or_admin(auth.uid()));

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_bookings_room_id ON public.bookings(room_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_check_in ON public.bookings(check_in);
CREATE INDEX idx_guests_booking_id ON public.guests(booking_id);
CREATE INDEX idx_guests_is_primary ON public.guests(is_primary);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_rooms_floor ON public.rooms(floor);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Insert default rooms for Sai Grand Lodge
-- 1st Floor: Rooms 101-110 (Standard)
INSERT INTO public.rooms (room_number, floor, room_type, base_price, ac_charge, geyser_charge, description) VALUES
('101', 1, 'standard', 800, 300, 100, 'Standard Room - 1st Floor'),
('102', 1, 'standard', 800, 300, 100, 'Standard Room - 1st Floor'),
('103', 1, 'standard', 800, 300, 100, 'Standard Room - 1st Floor'),
('104', 1, 'standard', 800, 300, 100, 'Standard Room - 1st Floor'),
('105', 1, 'standard', 800, 300, 100, 'Standard Room - 1st Floor'),
('106', 1, 'standard', 800, 300, 100, 'Standard Room - 1st Floor'),
('107', 1, 'standard', 800, 300, 100, 'Standard Room - 1st Floor'),
('108', 1, 'standard', 800, 300, 100, 'Standard Room - 1st Floor'),
('109', 1, 'standard', 800, 300, 100, 'Standard Room - 1st Floor'),
('110', 1, 'standard', 800, 300, 100, 'Standard Room - 1st Floor');

-- 2nd Floor: Rooms 201-210 (Standard)
INSERT INTO public.rooms (room_number, floor, room_type, base_price, ac_charge, geyser_charge, description) VALUES
('201', 2, 'standard', 800, 300, 100, 'Standard Room - 2nd Floor'),
('202', 2, 'standard', 800, 300, 100, 'Standard Room - 2nd Floor'),
('203', 2, 'standard', 800, 300, 100, 'Standard Room - 2nd Floor'),
('204', 2, 'standard', 800, 300, 100, 'Standard Room - 2nd Floor'),
('205', 2, 'standard', 800, 300, 100, 'Standard Room - 2nd Floor'),
('206', 2, 'standard', 800, 300, 100, 'Standard Room - 2nd Floor'),
('207', 2, 'standard', 800, 300, 100, 'Standard Room - 2nd Floor'),
('208', 2, 'standard', 800, 300, 100, 'Standard Room - 2nd Floor'),
('209', 2, 'standard', 800, 300, 100, 'Standard Room - 2nd Floor'),
('210', 2, 'standard', 800, 300, 100, 'Standard Room - 2nd Floor');

-- 3rd Floor: Function Hall + 2 rooms
INSERT INTO public.rooms (room_number, floor, room_type, base_price, ac_charge, geyser_charge, description) VALUES
('FH', 3, 'function_hall', 5000, 1000, 0, 'Function Hall - 3rd Floor'),
('301', 3, 'standard', 1000, 400, 150, 'Deluxe Room - 3rd Floor'),
('302', 3, 'standard', 1000, 400, 150, 'Deluxe Room - 3rd Floor');

-- 4th Floor: Rooms 401-410 (Luxury)
INSERT INTO public.rooms (room_number, floor, room_type, base_price, ac_charge, geyser_charge, description) VALUES
('401', 4, 'luxury', 1500, 400, 150, 'Luxury Room - 4th Floor'),
('402', 4, 'luxury', 1500, 400, 150, 'Luxury Room - 4th Floor'),
('403', 4, 'luxury', 1500, 400, 150, 'Luxury Room - 4th Floor'),
('404', 4, 'luxury', 1500, 400, 150, 'Luxury Room - 4th Floor'),
('405', 4, 'luxury', 1500, 400, 150, 'Luxury Room - 4th Floor'),
('406', 4, 'luxury', 1500, 400, 150, 'Luxury Room - 4th Floor'),
('407', 4, 'luxury', 1500, 400, 150, 'Luxury Room - 4th Floor'),
('408', 4, 'luxury', 1500, 400, 150, 'Luxury Room - 4th Floor'),
('409', 4, 'luxury', 1500, 400, 150, 'Luxury Room - 4th Floor'),
('410', 4, 'luxury', 1500, 400, 150, 'Luxury Room - 4th Floor');

-- Penthouse: 2 rooms
INSERT INTO public.rooms (room_number, floor, room_type, base_price, ac_charge, geyser_charge, description) VALUES
('PH1', 5, 'penthouse', 3000, 500, 200, 'Penthouse Suite 1 - For Bachelors & Joint Families'),
('PH2', 5, 'penthouse', 3000, 500, 200, 'Penthouse Suite 2 - For Bachelors & Joint Families');