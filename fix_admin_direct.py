#!/usr/bin/env python3

import requests
import json

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
    print(f"Sign in status: {response.status_code}")
    print(f"Sign in response: {response.text}")
    
    if response.status_code == 200:
        return response.json().get('access_token')
    return None

def get_admin_user_info(access_token):
    """Get admin user info"""
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    url = f"{SUPABASE_URL}/auth/v1/user"
    
    response = requests.get(url, headers=headers)
    print(f"User info status: {response.status_code}")
    print(f"User info response: {response.text}")
    
    if response.status_code == 200:
        return response.json()
    return None

def check_client_record(access_token):
    """Check if client record exists for admin user"""
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    # Get user info first
    user_info = get_admin_user_info(access_token)
    if not user_info:
        return None
    
    user_id = user_info['id']
    
    url = f"{SUPABASE_URL}/rest/v1/clients?auth_user_id=eq.{user_id}"
    
    response = requests.get(url, headers=headers)
    print(f"Client record status: {response.status_code}")
    print(f"Client record response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        if data:
            return data[0]
    return None

def create_client_record(access_token, user_info):
    """Create client record for admin user"""
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    data = {
        'auth_user_id': user_info['id'],
        'email': user_info['email'],
        'full_name': 'Blue OX Admin',
        'role': 'admin'
    }
    
    url = f"{SUPABASE_URL}/rest/v1/clients"
    
    response = requests.post(url, headers=headers, json=data)
    print(f"Create client status: {response.status_code}")
    print(f"Create client response: {response.text}")
    
    if response.status_code == 201:
        return response.json()[0]
    return None

def update_client_role(access_token, client_id):
    """Update client role to admin"""
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    data = {
        'role': 'admin',
        'full_name': 'Blue OX Admin'
    }
    
    url = f"{SUPABASE_URL}/rest/v1/clients?id=eq.{client_id}"
    
    response = requests.patch(url, headers=headers, json=data)
    print(f"Update role status: {response.status_code}")
    print(f"Update role response: {response.text}")
    
    if response.status_code == 200:
        return response.json()[0]
    return None

def main():
    print("🔧 Fixing admin login...")
    
    # Sign in with admin credentials
    access_token = sign_in_admin()
    if not access_token:
        print("❌ Failed to sign in")
        return
    
    print("✅ Signed in successfully")
    
    # Get user info
    user_info = get_admin_user_info(access_token)
    if not user_info:
        print("❌ Failed to get user info")
        return
    
    print(f"✅ User ID: {user_info['id']}")
    print(f"✅ Email: {user_info['email']}")
    
    # Check if client record exists
    client_record = check_client_record(access_token)
    
    if not client_record:
        print("❌ Client record not found, creating...")
        client_record = create_client_record(access_token, user_info)
        if client_record:
            print("✅ Client record created successfully")
        else:
            print("❌ Failed to create client record")
            return
    else:
        print(f"✅ Client record found: {client_record}")
        
        # Check if role is admin
        if client_record.get('role') != 'admin':
            print("🔧 Updating role to admin...")
            updated_record = update_client_role(access_token, client_record['id'])
            if updated_record:
                print("✅ Role updated to admin successfully")
            else:
                print("❌ Failed to update role")
                return
        else:
            print("✅ Role is already admin")
    
    print("🎉 Admin user fix completed!")

if __name__ == "__main__":
    main()