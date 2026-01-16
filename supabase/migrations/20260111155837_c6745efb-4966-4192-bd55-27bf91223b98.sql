-- Create storage bucket for ID proof images
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-proofs', 'id-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for ID proof images - only staff/admin can upload
CREATE POLICY "Staff and admin can upload ID proofs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'id-proofs' 
  AND is_staff_or_admin(auth.uid())
);

-- Staff and admin can view ID proofs
CREATE POLICY "Staff and admin can view ID proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-proofs' 
  AND is_staff_or_admin(auth.uid())
);

-- Staff and admin can delete ID proofs
CREATE POLICY "Staff and admin can delete ID proofs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'id-proofs' 
  AND is_staff_or_admin(auth.uid())
);