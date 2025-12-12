import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pvmcwgylcnedgvbjdler.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions based on database schema
export interface Client {
  id: string;
  auth_user_id?: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  nationality?: string;
  date_of_birth?: string;
  role: 'admin' | 'student' | 'workforce';
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  client_id?: string;
  user_path?: string;
  application_type?: string;
  target_country?: string;
  status: string;
  data?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface Document {
  id: string;
  client_id: string;
  application_id?: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  client_id: string;
  application_id?: string;
  phase: number;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'verified' | 'refunded';
  payment_date?: string;
  verified_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  title: string;
  company?: string;
  location?: string;
  country: string;
  job_type: string;
  description: string;
  requirements?: string;
  salary_range?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ClientPaymentPhases {
  id: string;
  client_id: string;
  phase_1_down_payment: boolean;
  phase_1_amount: number;
  phase_1_date?: string;
  phase_2_embassy_fee: boolean;
  phase_2_amount: number;
  phase_2_date?: string;
  phase_3_after_visa_fee: boolean;
  phase_3_amount: number;
  phase_3_date?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}
