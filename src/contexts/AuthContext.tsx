'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/definitions';

const LOCAL_STORAGE_KEY = 'unostat_session';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: { name: string; email: string; role: 'ADMIN' | 'PLAYER'; token: string, id?: string }) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedSession) {
        const session = JSON.parse(storedSession);
        setUser(session.user);
        setToken(session.token);
      }
    } catch (error) {
      console.error("Failed to parse session from localStorage", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = (userData: { name: string; email: string; role: 'ADMIN' | 'PLAYER'; token: string, id?: string }) => {
    const sessionUser: User = {
        id: userData.id || Math.random().toString(36).substr(2, 9), // Use real ID if available
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatarUrl: `https://picsum.photos/seed/${userData.name}/200/200`
    };
    
    const session = { user: sessionUser, token: userData.token };
    
    setUser(sessionUser);
    setToken(userData.token);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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
