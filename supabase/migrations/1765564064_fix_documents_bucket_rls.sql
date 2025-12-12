-- Migration: fix_documents_bucket_rls
-- Created at: 1765564064

-- Enable RLS on documents bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to documents" ON storage.objects;

-- Create new policies for documents bucket
CREATE POLICY "Allow anonymous uploads to documents bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND 
  auth.role() IN ('anon', 'service_role')
);

CREATE POLICY "Allow anonymous read from documents bucket" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND 
  auth.role() IN ('anon', 'service_role')
);