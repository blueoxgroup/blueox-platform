// Run this with: node fix-supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pvmcwgylcnedgvbjdler.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2bWN3Z3lsY25lZGd2YmpkbGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM2MDYxOSwiZXhwIjoyMDgwOTM2NjE5fQ._Icw1DhGSGlUyBBoetSK_8sh_f6MjPXAnUOOU917Mi4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixSchema() {
  console.log('Adding missing columns to applications table...\n');

  // Add the missing columns using raw SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE public.applications
      ADD COLUMN IF NOT EXISTS user_path VARCHAR(50);

      ALTER TABLE public.applications
      ADD COLUMN IF NOT EXISTS data JSONB;

      -- Also make application_type nullable since chatbot uses user_path instead
      ALTER TABLE public.applications
      ALTER COLUMN application_type DROP NOT NULL;

      -- Update the check constraint to allow more values
      ALTER TABLE public.applications
      DROP CONSTRAINT IF EXISTS applications_application_type_check;
    `
  });

  if (error) {
    console.log('RPC method not available, trying direct approach...\n');

    // If RPC doesn't work, we'll need to run SQL directly in Supabase
    console.log('Please run this SQL in Supabase SQL Editor:\n');
    console.log(`
-- Add missing columns for chatbot integration
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS user_path VARCHAR(50);

ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS data JSONB;

-- Make application_type nullable (chatbot uses user_path)
ALTER TABLE public.applications
ALTER COLUMN application_type DROP NOT NULL;

-- Remove restrictive check constraint
ALTER TABLE public.applications
DROP CONSTRAINT IF EXISTS applications_application_type_check;
    `);

    // Test inserting with current schema
    console.log('\nTesting current table structure...');
    const { data: testData, error: testError } = await supabase
      .from('applications')
      .select('*')
      .limit(1);

    if (testError) {
      console.log('Error reading table:', testError.message);
    } else {
      console.log('Current table columns:', testData.length > 0 ? Object.keys(testData[0]) : 'No rows yet');
    }
  } else {
    console.log('Schema updated successfully!');
  }
}

fixSchema();
