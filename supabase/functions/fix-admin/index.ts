Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const headers = {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    // SQL to fix the admin user and policies
    const sqlCommands = [
      // Drop all problematic policies
      "DROP POLICY IF EXISTS clients_select_own ON clients;",
      "DROP POLICY IF EXISTS clients_insert_own ON clients;", 
      "DROP POLICY IF EXISTS clients_update_own ON clients;",
      "DROP POLICY IF EXISTS clients_select_admin ON clients;",
      "DROP POLICY IF EXISTS clients_update_admin ON clients;",
      "DROP POLICY IF EXISTS clients_insert_anon ON clients;",
      
      // Delete any existing admin user record
      "DELETE FROM clients WHERE auth_user_id = '5a236bf5-65e1-4a4c-bed4-df065c093e13';",
      
      // Insert admin user with service role bypass
      "INSERT INTO clients (auth_user_id, email, full_name, role) VALUES ('5a236bf5-65e1-4a4c-bed4-df065c093e13', 'dqescjhu@minimax.com', 'Blue OX Admin', 'admin');",
      
      // Create simple, non-recursive policies
      "CREATE POLICY clients_select_own ON clients FOR SELECT USING (auth.uid() = auth_user_id);",
      "CREATE POLICY clients_insert_own ON clients FOR INSERT WITH CHECK (auth.uid() = auth_user_id);",
      "CREATE POLICY clients_update_own ON clients FOR UPDATE USING (auth.uid() = auth_user_id);",
      "CREATE POLICY clients_insert_anon ON clients FOR INSERT WITH CHECK (true);"
    ];

    // Execute each SQL command
    const results = [];
    for (const sql of sqlCommands) {
      try {
        // Use the database query endpoint with service role
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ sql })
        });
        
        const result = await response.text();
        results.push({ sql: sql.substring(0, 50) + '...', status: response.status, result });
      } catch (error) {
        results.push({ sql: sql.substring(0, 50) + '...', status: 'error', result: error.message });
      }
    }

    // Verify the admin user was created
    const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/clients?auth_user_id=eq.5a236bf5-65e1-4a4c-bed4-df065c093e13`, {
      method: 'GET',
      headers
    });
    
    const verifyData = await verifyResponse.json();
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Admin user fix completed',
      results,
      adminUser: verifyData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: {
        code: 'FUNCTION_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});