-- Migration: enable_anonymous_applications
-- Created at: 1765551488

-- Enable anonymous inserts for applications table
CREATE POLICY "Allow anonymous inserts" ON applications
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Allow anonymous selects for applications (for admin dashboard)
CREATE POLICY "Allow anonymous selects" ON applications
  FOR SELECT USING (auth.role() IN ('anon', 'service_role'));

-- Enable anonymous inserts for documents table  
CREATE POLICY "Allow anonymous document inserts" ON documents
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Allow anonymous selects for documents
CREATE POLICY "Allow anonymous document selects" ON documents
  FOR SELECT USING (auth.role() IN ('anon', 'service_role'));