#!/usr/bin/env python3

import requests
import json

# Supabase configuration
SUPABASE_URL = "https://pvmcwgylcnedgvbjdler.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2bWN3Z3lsY25lZGd2YmpkbGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM2MDYxOSwiZXhwIjoyMDgwOTM2NjE5fQ.hj5v6zW2jQvX9yE6kL8tS4pM5rG3wD2vN9aL8qT7cA"

def run_sql_query(sql_query):
    """Execute SQL query using Supabase REST API"""
    
    headers = {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    
    data = {
        'sql': sql_query
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    # Read the SQL fix file
    with open('/workspace/fix_admin_login.sql', 'r') as f:
        sql_content = f.read()
    
    # Split SQL into individual statements
    sql_statements = []
    current_statement = []
    
    for line in sql_content.split('\n'):
        line = line.strip()
        if not line or line.startswith('--'):
            continue
        
        current_statement.append(line)
        
        if line.endswith(';'):
            statement = ' '.join(current_statement)
            sql_statements.append(statement)
            current_statement = []
    
    # Execute each statement
    success_count = 0
    for i, statement in enumerate(sql_statements, 1):
        print(f"\nExecuting statement {i}/{len(sql_statements)}:")
        print(f"Statement: {statement[:100]}...")
        
        if run_sql_query(statement):
            success_count += 1
            print("✓ Success")
        else:
            print("✗ Failed")
    
    print(f"\n=== Summary ===")
    print(f"Successful: {success_count}/{len(sql_statements)}")
    
    # Check if admin user exists
    check_sql = """
    SELECT c.*, u.email as auth_email 
    FROM clients c 
    LEFT JOIN auth.users u ON c.auth_user_id = u.id 
    WHERE c.role = 'admin' OR u.email = 'dqescjhu@minimax.com';
    """
    
    print("\nChecking admin user:")
    run_sql_query(check_sql)

if __name__ == "__main__":
    main()