'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { supabase } from '../../utils/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

// Define the context interface
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        // Use getUser() instead of getSession() for better security
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error fetching user:', error);
          setUser(null);
          return;
        }
        
        if (user) {
          console.log('User found:', user.email);
          setUser(user);
        } else {
          console.log('No active user found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Don't use the user from the event directly
      // Instead, verify the session by calling getUser() again
      if (session) {
        const { data: { user: verifiedUser }, error } = await supabase.auth.getUser();
        if (!error && verifiedUser) {
          console.log('Auth state changed - verified user:', verifiedUser.email);
          setUser(verifiedUser);
        } else {
          console.log('Auth state changed but user verification failed');
          setUser(null);
        }
      } else {
        console.log('Auth state changed: No session');
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signOut, isLoading }}>
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
