'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from '../../utils/supabase';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
          console.log('fetch user', session.user);
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      //console.log('auth state change', session);
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
