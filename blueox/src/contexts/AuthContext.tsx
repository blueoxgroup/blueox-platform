import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Client, isSupabaseConfigured } from '../lib/supabase';

interface SignUpResult {
  error: Error | AuthError | null;
  data?: { user: User | null };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  client: Client | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'workforce') => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<{ error: Error | AuthError | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClient = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('auth_user_id', userId)
        .single();
      setClient(data);
    } catch (err) {
      console.error('Error fetching client:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchClient(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchClient(session.user.id);
      } else {
        setClient(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'workforce'): Promise<SignUpResult> => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured. Please set up your environment variables.') };
    }
    
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error, data: { user: null } };
    
    if (data.user) {
      const { error: clientError } = await supabase.from('clients').insert({
        auth_user_id: data.user.id,
        email,
        full_name: fullName,
        role,
      });
      if (clientError) return { error: clientError, data };
    }
    return { error: null, data };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured. Please set up your environment variables.') };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setClient(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      client,
      loading,
      signUp,
      signIn,
      signOut,
      isAdmin: client?.role === 'admin',
      isConfigured: isSupabaseConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
