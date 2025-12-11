// Check admin user status and fix if needed
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pvmcwgylcnedgvbjdler.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2bWN3Z3lsY25lZGd2YmpkbGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNjA2MTksImV4cCI6MjA4MDkzNjYxOX0.3ILSwPRsvCYelH9d8ZZxEb53Ja1XurXYy59nqepLhAs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndFixAdmin() {
  try {
    console.log('🔍 Checking admin user status...');
    
    // First, try to sign in with the admin credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'dqescjhu@minimax.com',
      password: 'NWr7i4sAVa'
    });
    
    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return;
    }
    
    console.log('✅ Authentication successful');
    console.log('User ID:', authData.user.id);
    console.log('Email:', authData.user.email);
    
    // Check if client record exists
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();
    
    if (clientError) {
      console.log('❌ Client record not found:', clientError.message);
      console.log('Creating client record...');
      
      // Create client record
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          auth_user_id: authData.user.id,
          email: authData.user.email,
          full_name: 'Blue OX Admin',
          role: 'admin'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Failed to create client record:', createError.message);
      } else {
        console.log('✅ Client record created:', newClient);
      }
    } else {
      console.log('✅ Client record found:', clientData);
      
      // Check if role is admin
      if (clientData.role !== 'admin') {
        console.log('🔧 Updating role to admin...');
        
        const { data: updatedClient, error: updateError } = await supabase
          .from('clients')
          .update({ 
            role: 'admin',
            full_name: 'Blue OX Admin'
          })
          .eq('auth_user_id', authData.user.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('❌ Failed to update role:', updateError.message);
        } else {
          console.log('✅ Role updated to admin:', updatedClient);
        }
      } else {
        console.log('✅ Role is already admin');
      }
    }
    
    // Sign out
    await supabase.auth.signOut();
    console.log('👋 Signed out');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Check database schema
async function checkDatabaseSchema() {
  try {
    console.log('\n🔍 Checking database schema...');
    
    // Check clients table structure
    const { data: clientCheck, error: clientCheckError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (clientCheckError) {
      console.log('❌ Clients table error:', clientCheckError.message);
    } else {
      console.log('✅ Clients table exists and accessible');
      console.log('Sample client record:', clientCheck[0]);
    }
    
    // Check if we can query with auth_user_id filter
    try {
      const { data: authCheck, error: authCheckError } = await supabase
        .from('clients')
        .select('auth_user_id, email, role')
        .limit(5);
      
      if (authCheckError) {
        console.log('❌ auth_user_id column issue:', authCheckError.message);
      } else {
        console.log('✅ auth_user_id column accessible');
        console.log('Auth records:', authCheck);
      }
    } catch (e) {
      console.log('❌ Error checking auth_user_id:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Schema check error:', error.message);
  }
}

// Run the checks
async function main() {
  await checkDatabaseSchema();
  await checkAndFixAdmin();
}

main();