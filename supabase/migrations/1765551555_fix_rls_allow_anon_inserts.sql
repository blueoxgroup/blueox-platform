-- Migration: fix_rls_allow_anon_inserts
-- Created at: 1765551555

-- Drop existing restrictive policies on applications
DROP POLICY IF EXISTS "Allow anonymous inserts" ON applications;
DROP POLICY IF EXISTS "Allow all reads" ON applications;
DROP POLICY IF EXISTS "Allow anon inserts" ON applications;

-- Create policies that allow anonymous inserts
CREATE POLICY "Allow anon inserts" ON applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all reads" ON applications
  FOR SELECT USING (true);

CREATE POLICY "Allow all updates" ON applications
  FOR UPDATE USING (true);

-- Add skills column to jobs if not exists
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skills TEXT[];

-- Create job_applications table for tracking user job selections
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  job_id UUID REFERENCES jobs(id),
  selected_by_user BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for job_applications
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon inserts job_apps" ON job_applications;
DROP POLICY IF EXISTS "Allow all reads job_apps" ON job_applications;
CREATE POLICY "Allow anon inserts job_apps" ON job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all reads job_apps" ON job_applications FOR SELECT USING (true);