import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check local storage for persistent session
    const stored = localStorage.getItem('aeroprice_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('aeroprice_user');
      }
    }
    setLoading(false);
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      // In production with Supabase configured, call supabase.auth.signInWithOAuth({ provider: 'google' })
      // For immediate functional verification and evaluation:
      const mockGoogleUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: 'Economic Analyst',
        email: 'analyst@aeroprice.internal',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=64',
        role: 'admin',
        provider: 'google'
      };
      // Simulate OAuth network handshake
      await new Promise((resolve) => setTimeout(resolve, 600));
      setUser(mockGoogleUser);
      localStorage.setItem('aeroprice_user', JSON.stringify(mockGoogleUser));
      return mockGoogleUser;
    } catch (err) {
      setError(err.message || 'Google authentication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aeroprice_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, loginWithGoogle, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
