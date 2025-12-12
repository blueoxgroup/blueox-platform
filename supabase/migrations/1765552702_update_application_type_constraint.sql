-- Migration: update_application_type_constraint
-- Created at: 1765552702

-- Update application_type constraint to allow chatbot values
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_application_type_check;

ALTER TABLE applications ADD CONSTRAINT applications_application_type_check 
CHECK (application_type IN ('student_university', 'student_job', 'worker_job', 'company'));