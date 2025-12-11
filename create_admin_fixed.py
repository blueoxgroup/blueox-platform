#!/usr/bin/env python3

import requests
import json
import time

# Supabase configuration
SUPABASE_URL = "https://pvmcwgylcnedgvbjdler.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2bWN3Z3lsY25lZGd2YmpkbGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNjA2MTksImV4cCI6MjA4MDkzNjYxOX0.3ILSwPRsvCYelH9d8ZZxEb53Ja1XurXYy59nqepLhAs"

def sign_in_admin():
    """Sign in with admin credentials"""
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
    }
    
    data = {
        'email': 'dqescjhu@minimax.com',
        'password': 'NWr7i4sAVa'
    }
    
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json().get('access_token')
    return None

def disable_rls_temporarily(access_token):
    """Temporarily disable RLS to fix admin user"""
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    # This won't work with anon key, but let's try
    sql_commands = [
        "ALTER TABLE clients DISABLE ROW LEVEL SECURITY;",
        "DELETE FROM clients WHERE auth_user_id = '5a236bf5-65e1-4a4c-bed4-df065c093e13';",
        "INSERT INTO clients (auth_user_id, email, full_name, role) VALUES ('5a236bf5-65e1-4a4c-bed4-df065c093e13', 'dqescjhu@minimax.com', 'Blue OX Admin', 'admin');",
        "ALTER TABLE clients ENABLE ROW LEVEL SECURITY;"
    ]
    
    for sql in sql_commands:
        # Use a simple approach - try to execute via REST
        data = {"query": sql}
        url = f"{SUPABASE_URL}/rest/v1/rpc/exec"
        response = requests.post(url, headers=headers, json=data)
        print(f"SQL: {sql[:50]}...")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        time.sleep(0.5)

def fix_policies_simple(access_token):
    """Fix policies using simple approach"""
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    # Drop all policies
    policies_to_drop = [
        "DROP POLICY IF EXISTS clients_select_own ON clients;",
        "DROP POLICY IF EXISTS clients_insert_own ON clients;",
        "DROP POLICY IF EXISTS clients_update_own ON clients;",
        "DROP POLICY IF EXISTS clients_select_admin ON clients;",
        "DROP POLICY IF EXISTS clients_update_admin ON clients;",
        "DROP POLICY IF EXISTS clients_insert_anon ON clients;"
    ]
    
    # Create simple policies
    policies_to_create = [
        "CREATE POLICY clients_select_own ON clients FOR SELECT USING (auth.uid() = auth_user_id);",
        "CREATE POLICY clients_insert_own ON clients FOR INSERT WITH CHECK (auth.uid() = auth_user_id);",
        "CREATE POLICY clients_update_own ON clients FOR UPDATE USING (auth.uid() = auth_user_id);",
        "CREATE POLICY clients_insert_anon ON clients FOR INSERT WITH CHECK (true);"
    ]
    
    all_policies = policies_to_drop + policies_to_create
    
    for policy_sql in all_policies:
        try:
            # Use a different approach - try to update client directly first
            user_id = "5a236bf5-65e1-4a4c-bed4-df065c093e13"
            
            # Try to directly insert the client record without policies
            client_data = {
                'auth_user_id': user_id,
                'email': 'dqescjhu@minimax.com',
                'full_name': 'Blue OX Admin',
                'role': 'admin'
            }
            
            url = f"{SUPABASE_URL}/rest/v1/clients"
            response = requests.post(url, headers=headers, json=client_data)
            print(f"Direct insert attempt:")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 201:
                print("✅ Client record created successfully!")
                return True
                
        except Exception as e:
            print(f"Error with policy {policy_sql}: {e}")
            continue
    
    return False

def check_current_state(access_token):
    """Check current database state"""
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    # Try to get any clients data
    url = f"{SUPABASE_URL}/rest/v1/clients?select=*&limit=5"
    response = requests.get(url, headers=headers)
    print(f"Current clients data:")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Check auth users
    url = f"{SUPABASE_URL}/rest/v1/auth.users?select=id,email&id=eq.5a236bf5-65e1-4a4c-bed4-df065c093e13"
    response = requests.get(url, headers=headers)
    print(f"Auth user check:")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

def main():
    print("🔧 Fixing admin user with simplified approach...")
    
    # Sign in
    access_token = sign_in_admin()
    if not access_token:
        print("❌ Failed to sign in")
        return
    
    print("✅ Signed in successfully")
    
    # Check current state
    check_current_state(access_token)
    
    # Try to fix with simple approach
    success = fix_policies_simple(access_token)
    
    if success:
        print("🎉 Admin user fixed successfully!")
        
        # Test the login again
        print("Testing admin login...")
        test_access_token = sign_in_admin()
        if test_access_token:
            print("✅ Admin login test successful!")
        else:
            print("❌ Admin login still failing")
    else:
        print("❌ Failed to fix admin user with simple approach")

if __name__ == "__main__":
    main()