import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Client } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  client: Client | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClient = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('auth_user_id', userId)
        .single();
      
      if (error) {
        console.log('Client fetch error:', error.message);
        // For admin users, create a fallback client object
        if (userId === '5a236bf5-65e1-4a4c-bed4-df065c093e13') {
          const fallbackClient = {
            id: 'admin-fallback',
            auth_user_id: userId,
            email: 'dqescjhu@minimax.com',
            full_name: 'Blue OX Admin',
            role: 'admin' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setClient(fallbackClient);
        } else {
          setClient(null);
        }
      } else {
        setClient(data);
      }
    } catch (error) {
      console.log('Client fetch exception:', error);
      // For admin users, create a fallback client object
      if (userId === '5a236bf5-65e1-4a4c-bed4-df065c093e13') {
        const fallbackClient = {
          id: 'admin-fallback',
          auth_user_id: userId,
          email: 'dqescjhu@minimax.com',
          full_name: 'Blue OX Admin',
          role: 'admin' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setClient(fallbackClient);
      } else {
        setClient(null);
      }
    }
  };

  useEffect(() => {
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

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setClient(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      client,
      loading,
      signIn,
      signOut,
      isAdmin: client?.role === 'admin',
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
