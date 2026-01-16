-- Migration: Update guests table schema for returning guest tracking
-- Add phone_number UNIQUE constraint, id_verified, first_stay_at, last_stay_at
-- Add payments table

-- Step 1: Add new columns to guests table (if they don't exist)
DO $$ 
BEGIN
  -- Add phone_number column with UNIQUE constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guests' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE public.guests ADD COLUMN phone_number TEXT;
    
    -- Migrate existing phone data
    UPDATE public.guests SET phone_number = phone WHERE phone IS NOT NULL;
    
    -- Add UNIQUE constraint
    CREATE UNIQUE INDEX idx_guests_phone_number_unique ON public.guests(phone_number) 
    WHERE phone_number IS NOT NULL;
  END IF;
  
  -- Add id_verified column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guests' AND column_name = 'id_verified'
  ) THEN
    ALTER TABLE public.guests ADD COLUMN id_verified BOOLEAN DEFAULT FALSE;
    
    -- Mark existing guests with ID images as verified
    UPDATE public.guests 
    SET id_verified = TRUE 
    WHERE id_front_image IS NOT NULL 
      AND id_back_image IS NOT NULL 
      AND id_proof_type IS NOT NULL;
  END IF;
  
  -- Add first_stay_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guests' AND column_name = 'first_stay_at'
  ) THEN
    ALTER TABLE public.guests ADD COLUMN first_stay_at TIMESTAMP WITH TIME ZONE;
    
    -- Populate from earliest booking
    UPDATE public.guests g
    SET first_stay_at = (
      SELECT MIN(b.check_in)
      FROM public.bookings b
      WHERE b.id = g.booking_id
    )
    WHERE first_stay_at IS NULL;
  END IF;
  
  -- Add last_stay_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guests' AND column_name = 'last_stay_at'
  ) THEN
    ALTER TABLE public.guests ADD COLUMN last_stay_at TIMESTAMP WITH TIME ZONE;
    
    -- Populate from latest booking
    UPDATE public.guests g
    SET last_stay_at = (
      SELECT MAX(b.check_in)
      FROM public.bookings b
      WHERE b.id = g.booking_id
    )
    WHERE last_stay_at IS NULL;
  END IF;
END $$;

-- Step 2: Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer', 'other')),
    paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 3: Add index for phone_number lookup performance
CREATE INDEX IF NOT EXISTS idx_guests_phone_number ON public.guests(phone_number) 
WHERE phone_number IS NOT NULL;

-- Step 4: Add index for payments
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON public.payments(paid_at);

-- Step 5: Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Step 6: RLS Policies for payments
CREATE POLICY "Staff and admin can view payments"
ON public.payments FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff and admin can create payments"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Admin can update payments"
ON public.payments FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Step 7: Create function to update guest stay dates
CREATE OR REPLACE FUNCTION public.update_guest_stay_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Update first_stay_at and last_stay_at for primary guests
  UPDATE public.guests g
  SET 
    first_stay_at = COALESCE(
      g.first_stay_at,
      (SELECT MIN(b.check_in) FROM public.bookings b 
       JOIN public.guests g2 ON b.id = g2.booking_id 
       WHERE g2.phone_number = g.phone_number AND g2.is_primary = TRUE)
    ),
    last_stay_at = (
      SELECT MAX(b.check_in) FROM public.bookings b 
      JOIN public.guests g2 ON b.id = g2.booking_id 
      WHERE g2.phone_number = g.phone_number AND g2.is_primary = TRUE
    )
  WHERE g.phone_number IS NOT NULL 
    AND g.is_primary = TRUE
    AND EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = NEW.id
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create trigger to update guest stay dates on booking creation
DROP TRIGGER IF EXISTS trigger_update_guest_stay_dates ON public.bookings;
CREATE TRIGGER trigger_update_guest_stay_dates
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_guest_stay_dates();

-- Step 9: Create function for guest lookup by phone
CREATE OR REPLACE FUNCTION public.lookup_guest_by_phone(_phone_number TEXT)
RETURNS TABLE (
  guest_exists BOOLEAN,
  guest_id UUID,
  full_name TEXT,
  phone_number TEXT,
  id_verified BOOLEAN,
  id_proof_type id_proof_type,
  id_front_image TEXT,
  id_back_image TEXT,
  first_stay_at TIMESTAMP WITH TIME ZONE,
  last_stay_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_guest RECORD;
BEGIN
  -- Find the most recent primary guest with this phone number
  SELECT 
    g.id,
    g.full_name,
    g.phone_number,
    g.id_verified,
    g.id_proof_type,
    g.id_front_image,
    g.id_back_image,
    g.first_stay_at,
    g.last_stay_at
  INTO found_guest
  FROM public.guests g
  WHERE g.phone_number = _phone_number
    AND g.is_primary = TRUE
  ORDER BY g.last_stay_at DESC NULLS LAST, g.created_at DESC
  LIMIT 1;
  
  IF found_guest.id IS NULL THEN
    RETURN QUERY SELECT 
      FALSE::BOOLEAN,
      NULL::UUID,
      NULL::TEXT,
      NULL::TEXT,
      FALSE::BOOLEAN,
      NULL::id_proof_type,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TIMESTAMP WITH TIME ZONE,
      NULL::TIMESTAMP WITH TIME ZONE;
  ELSE
    RETURN QUERY SELECT 
      TRUE::BOOLEAN,
      found_guest.id,
      found_guest.full_name,
      found_guest.phone_number,
      found_guest.id_verified,
      found_guest.id_proof_type,
      found_guest.id_front_image,
      found_guest.id_back_image,
      found_guest.first_stay_at,
      found_guest.last_stay_at;
  END IF;
END;
$$;

-- Step 10: Grant execute permission on lookup function
GRANT EXECUTE ON FUNCTION public.lookup_guest_by_phone(TEXT) TO authenticated;

-- Step 11: Create audit log table for police exports (if not exists)
CREATE TABLE IF NOT EXISTS public.police_export_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    export_type TEXT NOT NULL CHECK (export_type IN ('pdf', 'excel', 'zip', 'detailed_pdf')),
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    records_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_police_export_logs_created_at ON public.police_export_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_police_export_logs_user_id ON public.police_export_logs(user_id);

ALTER TABLE public.police_export_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view export logs"
ON public.police_export_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can create export logs"
ON public.police_export_logs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
