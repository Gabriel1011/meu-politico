-- ============================================
-- STORAGE BUCKETS SETUP
-- ============================================

-- Create uploads bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================
-- Structure: uploads/{tenant_id}/events/{filename}
-- This organizes files by tenant and category

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view uploaded files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their tenant folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in their tenant folder" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete files from their tenant folder" ON storage.objects;

-- Allow public to read all files in uploads bucket
CREATE POLICY "Public can view uploaded files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');

-- Allow authenticated users from a tenant to upload files to their tenant folder
-- Files should be in format: {tenant_id}/events/{filename}
CREATE POLICY "Users can upload to their tenant folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'uploads'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] IN (
      SELECT tenant_id::text FROM public.profile
      WHERE id = auth.uid()
    )
  );

-- Allow users to update files in their tenant folder
CREATE POLICY "Users can update files in their tenant folder"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] IN (
      SELECT tenant_id::text FROM public.profile
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] IN (
      SELECT tenant_id::text FROM public.profile
      WHERE id = auth.uid()
    )
  );

-- Allow staff to delete files from their tenant folder
CREATE POLICY "Staff can delete files from their tenant folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] IN (
      SELECT tenant_id::text FROM public.profile
      WHERE id = auth.uid()
        AND role IN ('assessor', 'politico', 'admin')
    )
  );

-- ============================================
-- COMMENTS
-- ============================================
-- Note: Cannot add comments to storage.objects policies (permission denied)
-- Policy descriptions are in the CREATE POLICY comments above
