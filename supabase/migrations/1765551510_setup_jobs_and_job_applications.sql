-- Migration: setup_jobs_and_job_applications
-- Created at: 1765551510

-- Add RLS policies for jobs table
CREATE POLICY "Allow anonymous selects for jobs" ON jobs
  FOR SELECT USING (auth.role() IN ('anon', 'service_role'));

-- Create job_applications table with correct UUID types
CREATE TABLE job_applications (
  id SERIAL PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  job_id UUID REFERENCES jobs(id),
  selected_by_user BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies for job_applications table
CREATE POLICY "Allow anonymous inserts for job_applications" ON job_applications
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Allow anonymous selects for job_applications" ON job_applications
  FOR SELECT USING (auth.role() IN ('anon', 'service_role'));

-- Add some sample jobs for testing
INSERT INTO jobs (title, company, location, country, job_type, description, requirements, salary_range) VALUES
('Construction Worker', 'BuildTech GmbH', 'Berlin', 'Germany', 'Full-time', 'Experienced construction worker needed for building projects', '3+ years experience, basic German preferred', '€1800-€2500'),
('Kitchen Assistant', 'Restaurant Central', 'Amsterdam', 'Netherlands', 'Part-time', 'Help in busy restaurant kitchen', 'Food handling experience preferred', '€1600-€2000'),
('Manufacturing Operator', 'TechFlow SA', 'Warsaw', 'Poland', 'Full-time', 'Operate manufacturing equipment', 'Technical background helpful', '€1500-€2200'),
('Delivery Driver', 'QuickExpress', 'Paris', 'France', 'Full-time', 'Deliver packages across the city', 'Valid driving license required', '€1700-€2100'),
('Warehouse Worker', 'LogiStock BV', 'Rotterdam', 'Netherlands', 'Full-time', 'Package and organize warehouse inventory', 'Physical fitness required', '€1600-€2000');