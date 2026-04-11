import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const resolved = useRef(false);

  const resolveAuth = () => {
    if (!resolved.current) {
      resolved.current = true;
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    // Safety timeout — never stay on loading screen forever
    const timeout = setTimeout(() => {
      if (!resolved.current) {
        console.warn('Auth check timed out after 8s');
        resolveAuth();
      }
    }, 8000);

    // Check current session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Session check failed:', error);
        setAuthError({ type: 'unknown', message: error.message });
      } else if (session?.user) {
        setUser(prev => prev?.id === session.user.id ? prev : session.user);
        setIsAuthenticated(true);
        await loadProfile(session.user.id);
      }
      resolveAuth();
    }).catch((err) => {
      console.error('Unexpected auth error:', err);
      setAuthError({ type: 'unknown', message: err.message });
      resolveAuth();
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(prev => prev?.id === session.user.id ? prev : session.user);
          setIsAuthenticated(true);
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
        resolveAuth();
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile load error:', error);
      }
      setProfile(data || null);
    } catch (err) {
      console.error('Profile load failed:', err);
    }
  };

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signInWithMagicLink = async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      isLoadingAuth,
      authError,
      signUp,
      signIn,
      signInWithGoogle,
      signInWithMagicLink,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
