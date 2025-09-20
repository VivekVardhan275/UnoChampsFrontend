'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

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

const _AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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
    const userId = userData.id || Math.random().toString(36).substr(2, 9);
    const sessionUser: User = {
        id: userId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatarUrl: `https://source.unsplash.com/200x200/?portrait,vibrant&sig=${userId}`
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

export const AuthProvider = dynamic(() => Promise.resolve(_AuthProvider), {
    ssr: false,
    loading: () => (
         <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 <div className="space-y-8">
                    <div className="text-center">
                        <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
                        <Skeleton className="h-6 w-1/2 mx-auto" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Skeleton className="h-10 w-full sm:w-[280px]" />
                        <Skeleton className="h-10 w-full sm:w-[280px]" />
                    </div>
                    <Skeleton className="h-96 w-full" />
                </div>
            </main>
        </div>
    )
});


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
